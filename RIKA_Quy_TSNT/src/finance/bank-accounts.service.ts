import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BankAccount, BankAccountDocument } from './schemas/bank-account.schema';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';

/**
 * Bank Accounts Service
 * Xử lý logic nghiệp vụ liên quan đến Bank Account
 */
@Injectable()
export class BankAccountsService {
  constructor(
    @InjectModel(BankAccount.name) private bankAccountModel: Model<BankAccountDocument>,
  ) {}

  /**
   * Tạo bank account mới
   * @param createBankAccountDto - Dữ liệu tạo bank account
   * @returns Bank Account đã tạo
   */
  async create(createBankAccountDto: CreateBankAccountDto): Promise<BankAccountDocument> {
    const bankAccount = new this.bankAccountModel(createBankAccountDto);
    return bankAccount.save();
  }

  /**
   * Lấy tất cả bank accounts
   * @param activeOnly - Chỉ lấy các tài khoản active
   * @returns Danh sách bank accounts
   */
  async findAll(activeOnly: boolean = false): Promise<BankAccountDocument[]> {
    const query = activeOnly ? { status: 'active' } : {};
    return this.bankAccountModel.find(query).sort({ bank_name: 1, createdAt: -1 }).exec();
  }

  /**
   * Lấy bank account theo ID
   * @param id - Bank Account ID
   * @returns Bank Account document
   */
  async findOne(id: string): Promise<BankAccountDocument> {
    const bankAccount = await this.bankAccountModel.findById(id);
    if (!bankAccount) {
      throw new NotFoundException(`Bank Account với ID ${id} không tồn tại`);
    }
    return bankAccount;
  }

  /**
   * Cập nhật bank account
   * @param id - Bank Account ID
   * @param updateData - Dữ liệu cập nhật
   * @returns Bank Account đã cập nhật
   */
  async update(
    id: string,
    updateData: Partial<CreateBankAccountDto>,
  ): Promise<BankAccountDocument> {
    const bankAccount = await this.bankAccountModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    ).exec();
    
    if (!bankAccount) {
      throw new NotFoundException(`Bank Account với ID ${id} không tồn tại`);
    }
    
    return bankAccount;
  }

  /**
   * Xóa bank account
   * @param id - Bank Account ID
   */
  async remove(id: string): Promise<void> {
    const bankAccount = await this.bankAccountModel.findById(id);
    if (!bankAccount) {
      throw new NotFoundException(`Bank Account với ID ${id} không tồn tại`);
    }

    await this.bankAccountModel.findByIdAndDelete(id);
  }
}

