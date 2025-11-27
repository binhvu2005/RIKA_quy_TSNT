import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BankAccountsService } from './bank-accounts.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

/**
 * Bank Accounts Controller
 * Xử lý các HTTP request liên quan đến Bank Account
 */
@Controller('bank-accounts')
export class BankAccountsController {
  constructor(private readonly bankAccountsService: BankAccountsService) {}

  /**
   * Lấy danh sách bank accounts công khai (Public)
   * GET /bank-accounts/public?activeOnly=true
   */
  @Get('public')
  @Public()
  async findAllPublic(@Query('activeOnly') activeOnly?: string) {
    return this.bankAccountsService.findAll(activeOnly === 'true');
  }

  /**
   * Tạo bank account mới
   * POST /bank-accounts
   * Yêu cầu quyền: admin
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async create(@Body() createBankAccountDto: CreateBankAccountDto) {
    return this.bankAccountsService.create(createBankAccountDto);
  }

  /**
   * Lấy tất cả bank accounts
   * GET /bank-accounts
   * Yêu cầu quyền: admin, editor
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'editor')
  async findAll(@Query('activeOnly') activeOnly?: string) {
    return this.bankAccountsService.findAll(activeOnly === 'true');
  }

  /**
   * Lấy bank account theo ID
   * GET /bank-accounts/:id
   * Yêu cầu quyền: admin, editor
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'editor')
  async findOne(@Param('id') id: string) {
    return this.bankAccountsService.findOne(id);
  }

  /**
   * Cập nhật bank account
   * PATCH /bank-accounts/:id
   * Yêu cầu quyền: admin
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateBankAccountDto>,
  ) {
    return this.bankAccountsService.update(id, updateData);
  }

  /**
   * Xóa bank account
   * DELETE /bank-accounts/:id
   * Yêu cầu quyền: admin
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.bankAccountsService.remove(id);
  }
}

