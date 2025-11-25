import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Patch,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FinanceTransactionsService } from './finance-transactions.service';
import { CreateFinanceTransactionDto } from './dto/create-finance-transaction.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

/**
 * Finance Transactions Controller
 * Xử lý các HTTP request liên quan đến Finance Transaction
 */
@Controller('finance/transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinanceTransactionsController {
  constructor(
    private readonly transactionsService: FinanceTransactionsService,
  ) {}

  /**
   * Tạo transaction mới
   * POST /finance/transactions
   * Yêu cầu quyền: admin, editor
   */
  @Post()
  @Roles('admin', 'editor')
  async create(
    @Body() createTransactionDto: CreateFinanceTransactionDto,
    @CurrentUser() user: any,
  ) {
    return this.transactionsService.create(
      createTransactionDto,
      user._id.toString(),
    );
  }

  /**
   * Lấy danh sách transactions với phân trang và filter
   * GET /finance/transactions?page=1&limit=20&fund_id=xxx&type=income&status=completed
   * Yêu cầu quyền: admin, editor
   */
  @Get()
  @Roles('admin', 'editor')
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('fund_id') fundId?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    return this.transactionsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      fundId,
      type,
      status,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  /**
   * Lấy transaction theo ID
   * GET /finance/transactions/:id
   * Yêu cầu quyền: admin, editor
   */
  @Get(':id')
  @Roles('admin', 'editor')
  async findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }

  /**
   * Cập nhật trạng thái transaction
   * PATCH /finance/transactions/:id/status
   * Yêu cầu quyền: admin
   */
  @Patch(':id/status')
  @Roles('admin')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'pending' | 'completed' | 'rejected',
  ) {
    return this.transactionsService.updateStatus(id, status);
  }

  /**
   * Xóa transaction
   * DELETE /finance/transactions/:id
   * Yêu cầu quyền: admin
   */
  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.transactionsService.remove(id);
  }
}

