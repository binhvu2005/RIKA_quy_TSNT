import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { Fund, FundDocument } from './schemas/fund.schema';
import { CreateFundDto } from './dto/create-fund.dto';

/**
 * Funds Service
 * Xử lý logic nghiệp vụ liên quan đến Fund
 */
@Injectable()
export class FundsService {
  constructor(
    @InjectModel(Fund.name) private fundModel: Model<FundDocument>,
  ) {}

  /**
   * Tạo fund mới
   * @param createFundDto - Dữ liệu tạo fund
   * @returns Fund đã tạo
   */
  async create(createFundDto: CreateFundDto): Promise<FundDocument> {
    const balance = createFundDto.balance
      ? mongoose.Types.Decimal128.fromString(createFundDto.balance.toString())
      : mongoose.Types.Decimal128.fromString('0');

    const fund = new this.fundModel({
      ...createFundDto,
      balance,
    });

    return fund.save();
  }

  /**
   * Lấy tất cả funds
   * @returns Danh sách funds
   */
  async findAll(): Promise<FundDocument[]> {
    return this.fundModel.find().sort({ name: 1 }).exec();
  }

  /**
   * Lấy fund theo ID
   * @param id - Fund ID
   * @returns Fund document
   */
  async findOne(id: string): Promise<FundDocument> {
    const fund = await this.fundModel.findById(id);
    if (!fund) {
      throw new NotFoundException(`Fund với ID ${id} không tồn tại`);
    }
    return fund;
  }

  /**
   * Cập nhật fund
   * @param id - Fund ID
   * @param updateData - Dữ liệu cập nhật
   * @returns Fund đã cập nhật
   */
  async update(
    id: string,
    updateData: Partial<CreateFundDto>,
  ): Promise<FundDocument> {
    const fund = await this.fundModel.findById(id);
    if (!fund) {
      throw new NotFoundException(`Fund với ID ${id} không tồn tại`);
    }

    // Xử lý balance nếu có
    if (updateData.balance !== undefined) {
      updateData['balance'] = mongoose.Types.Decimal128.fromString(
        updateData.balance.toString(),
      ) as any;
    }

    const updated = await this.fundModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    
    if (!updated) {
      throw new NotFoundException('Fund không tồn tại');
    }
    
    return updated;
  }

  /**
   * Xóa fund
   * @param id - Fund ID
   */
  async remove(id: string): Promise<void> {
    const fund = await this.fundModel.findById(id);
    if (!fund) {
      throw new NotFoundException(`Fund với ID ${id} không tồn tại`);
    }

    // TODO: Kiểm tra có transaction nào liên quan không
    // Nếu có thì không cho xóa

    await this.fundModel.findByIdAndDelete(id);
  }

  /**
   * Cập nhật số dư fund (tăng)
   * @param id - Fund ID
   * @param amount - Số tiền tăng
   */
  async incrementBalance(id: string, amount: number): Promise<void> {
    const fund = await this.fundModel.findById(id);
    if (!fund) {
      throw new NotFoundException(`Fund với ID ${id} không tồn tại`);
    }

    const currentBalance = parseFloat(fund.balance.toString());
    const newBalance = currentBalance + amount;

    await this.fundModel.findByIdAndUpdate(id, {
      balance: mongoose.Types.Decimal128.fromString(newBalance.toString()),
    });
  }

  /**
   * Cập nhật số dư fund (giảm)
   * @param id - Fund ID
   * @param amount - Số tiền giảm
   */
  async decrementBalance(id: string, amount: number): Promise<void> {
    const fund = await this.fundModel.findById(id);
    if (!fund) {
      throw new NotFoundException(`Fund với ID ${id} không tồn tại`);
    }

    const currentBalance = parseFloat(fund.balance.toString());
    const newBalance = currentBalance - amount;

    if (newBalance < 0) {
      throw new BadRequestException('Số dư không đủ');
    }

    await this.fundModel.findByIdAndUpdate(id, {
      balance: mongoose.Types.Decimal128.fromString(newBalance.toString()),
    });
  }
}

