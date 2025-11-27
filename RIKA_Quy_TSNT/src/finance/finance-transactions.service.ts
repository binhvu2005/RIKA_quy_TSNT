import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import {
  FinanceTransaction,
  FinanceTransactionDocument,
  ReferenceObject,
} from './schemas/finance-transaction.schema';
import { CreateFinanceTransactionDto } from './dto/create-finance-transaction.dto';
import { FundsService } from './funds.service';

/**
 * Finance Transactions Service
 * Xử lý logic nghiệp vụ liên quan đến Finance Transaction
 */
@Injectable()
export class FinanceTransactionsService {
  constructor(
    @InjectModel(FinanceTransaction.name)
    private transactionModel: Model<FinanceTransactionDocument>,
    private fundsService: FundsService,
  ) {}

  /**
   * Tạo transaction mới
   * @param createTransactionDto - Dữ liệu tạo transaction
   * @param userId - ID user thực hiện
   * @returns Transaction đã tạo
   */
  async create(
    createTransactionDto: CreateFinanceTransactionDto,
    userId: string,
  ): Promise<FinanceTransactionDocument> {
    // Kiểm tra fund tồn tại
    await this.fundsService.findOne(createTransactionDto.fund_id);

    // Chuyển đổi amount sang Decimal128
    const amount = mongoose.Types.Decimal128.fromString(
      createTransactionDto.amount.toString(),
    );

    // Xử lý ref_obj nếu có
    let ref_obj: ReferenceObject | null = null;
    if (createTransactionDto.ref_obj) {
      ref_obj = {
        model: createTransactionDto.ref_obj.model,
        id: new mongoose.Types.ObjectId(createTransactionDto.ref_obj.id),
      };
    }

    const transaction = new this.transactionModel({
      ...createTransactionDto,
      user_id: new mongoose.Types.ObjectId(userId),
      fund_id: new mongoose.Types.ObjectId(createTransactionDto.fund_id),
      amount,
      ref_obj,
      status: createTransactionDto.status || 'pending',
    });

    const savedTransaction = await transaction.save();

    // Nếu status là completed thì cập nhật số dư fund
    if (savedTransaction.status === 'completed') {
      await this.updateFundBalance(savedTransaction);
    }

    return savedTransaction;
  }

  /**
   * Lấy danh sách transactions với phân trang và filter
   * @param page - Số trang
   * @param limit - Số lượng mỗi trang
   * @param fundId - Lọc theo fund
   * @param type - Lọc theo loại
   * @param status - Lọc theo trạng thái
   * @param startDate - Ngày bắt đầu
   * @param endDate - Ngày kết thúc
   * @param search - Tìm kiếm theo tên/email user
   * @param sortBy - Sắp xếp theo field
   * @param sortOrder - Thứ tự sắp xếp (asc/desc)
   * @returns Danh sách transactions và metadata phân trang
   */
  async findAll(
    page: number = 1,
    limit: number = 20,
    fundId?: string,
    type?: string,
    status?: string,
    startDate?: Date,
    endDate?: Date,
    search?: string,
    sortBy?: string,
    sortOrder?: string,
  ) {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (fundId) {
      query.fund_id = fundId;
    }

    if (type) {
      query.type = type;
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = startDate;
      }
      if (endDate) {
        query.createdAt.$lte = endDate;
      }
    }

    // Build sort object
    const sortObj: any = {};
    if (sortBy) {
      sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortObj.createdAt = -1;
    }

    const transactionQuery = this.transactionModel
      .find(query)
      .populate('fund_id', 'name currency')
      .populate('user_id', 'username email profile')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const [transactions, total] = await Promise.all([
      transactionQuery.exec(),
      this.transactionModel.countDocuments(query).exec(),
    ]);

    // Filter by search after populate (client-side filtering for populated fields)
    let filteredTransactions = transactions;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTransactions = transactions.filter((t: any) => {
        const user = t.user_id;
        const username = user?.username?.toLowerCase() || '';
        const email = user?.email?.toLowerCase() || '';
        const fullName = user?.profile?.full_name?.toLowerCase() || '';
        const desc = t.desc?.toLowerCase() || '';
        return username.includes(searchLower) || 
               email.includes(searchLower) || 
               fullName.includes(searchLower) || 
               desc.includes(searchLower);
      });
    }

    return {
      data: filteredTransactions,
      pagination: {
        page,
        limit,
        total: search ? filteredTransactions.length : total,
        totalPages: search ? Math.ceil(filteredTransactions.length / limit) : Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy transaction theo ID
   * @param id - Transaction ID
   * @returns Transaction document
   */
  async findOne(id: string): Promise<FinanceTransactionDocument> {
    const transaction = await this.transactionModel
      .findById(id)
      .populate('fund_id', 'name currency')
      .populate('user_id', 'username profile')
      .exec();

    if (!transaction) {
      throw new NotFoundException(
        `Transaction với ID ${id} không tồn tại`,
      );
    }

    return transaction;
  }

  /**
   * Cập nhật trạng thái transaction
   * @param id - Transaction ID
   * @param status - Trạng thái mới
   * @returns Transaction đã cập nhật
   */
  async updateStatus(
    id: string,
    status: 'pending' | 'completed' | 'rejected',
  ): Promise<FinanceTransactionDocument> {
    const transaction = await this.transactionModel.findById(id);
    if (!transaction) {
      throw new NotFoundException(
        `Transaction với ID ${id} không tồn tại`,
      );
    }

    const oldStatus = transaction.status;
    transaction.status = status;

    // Nếu chuyển sang completed thì cập nhật số dư fund
    if (status === 'completed' && oldStatus !== 'completed') {
      await this.updateFundBalance(transaction);
    }

    // Nếu từ completed chuyển sang status khác thì hoàn lại số dư
    if (oldStatus === 'completed' && status !== 'completed') {
      await this.revertFundBalance(transaction);
    }

    return transaction.save();
  }

  /**
   * Xóa transaction
   * @param id - Transaction ID
   */
  async remove(id: string): Promise<void> {
    const transaction = await this.transactionModel.findById(id);
    if (!transaction) {
      throw new NotFoundException(
        `Transaction với ID ${id} không tồn tại`,
      );
    }

    // Nếu transaction đã completed thì hoàn lại số dư
    if (transaction.status === 'completed') {
      await this.revertFundBalance(transaction);
    }

    await this.transactionModel.findByIdAndDelete(id);
  }

  /**
   * Cập nhật số dư fund dựa trên transaction
   * @param transaction - Transaction document
   */
  private async updateFundBalance(
    transaction: FinanceTransactionDocument,
  ): Promise<void> {
    const amount = parseFloat(transaction.amount.toString());
    const fundId = transaction.fund_id.toString();

    if (transaction.type === 'income') {
      await this.fundsService.incrementBalance(fundId, amount);
    } else if (transaction.type === 'expense') {
      await this.fundsService.decrementBalance(fundId, amount);
    }
  }

  /**
   * Hoàn lại số dư fund (revert transaction)
   * @param transaction - Transaction document
   */
  private async revertFundBalance(
    transaction: FinanceTransactionDocument,
  ): Promise<void> {
    const amount = parseFloat(transaction.amount.toString());
    const fundId = transaction.fund_id.toString();

    // Đảo ngược logic
    if (transaction.type === 'income') {
      await this.fundsService.decrementBalance(fundId, amount);
    } else if (transaction.type === 'expense') {
      await this.fundsService.incrementBalance(fundId, amount);
    }
  }

  /**
   * Lấy top contributors (người đóng góp nhiều nhất)
   * @param limit - Số lượng top contributors
   * @returns Danh sách top contributors với tổng số tiền đóng góp
   */
  async getTopContributors(limit: number = 3) {
    const result = await this.transactionModel.aggregate([
      {
        $match: {
          type: 'income',
          status: 'completed',
        },
      },
      {
        $group: {
          _id: '$user_id',
          totalAmount: { $sum: { $toDouble: '$amount' } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { totalAmount: -1 },
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          user_id: '$_id',
          totalAmount: 1,
          count: 1,
          user: {
            _id: '$user._id',
            username: '$user.username',
            name: { $ifNull: ['$user.profile.full_name', '$user.username'] },
            avatar: '$user.profile.avatar',
          },
        },
      },
    ]);

    return result;
  }
}

