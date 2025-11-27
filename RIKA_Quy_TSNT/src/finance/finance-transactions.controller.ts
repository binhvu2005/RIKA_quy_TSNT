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
import { Public } from '../common/decorators/public.decorator';

/**
 * Finance Transactions Controller
 * Xử lý các HTTP request liên quan đến Finance Transaction
 */
@Controller('finance/transactions')
export class FinanceTransactionsController {
  constructor(
    private readonly transactionsService: FinanceTransactionsService,
  ) {}

  /**
   * Lấy danh sách contributions công khai (Public)
   * GET /finance/transactions/public/contributions?page=1&limit=20
   */
  @Get('public/contributions')
  @Public()
  async getPublicContributions(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.transactionsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      undefined,
      'income',
      'completed',
    );
  }

  /**
   * Lấy top contributors (Public)
   * GET /finance/transactions/public/top-contributors?limit=3
   */
  @Get('public/top-contributors')
  @Public()
  async getTopContributors(@Query('limit') limit?: string) {
    return this.transactionsService.getTopContributors(
      limit ? parseInt(limit) : 3,
    );
  }

  /**
   * Tạo contribution mới (User đóng góp)
   * POST /finance/transactions/contribute
   * Yêu cầu: Authentication (user)
   */
  @Post('contribute')
  @UseGuards(JwtAuthGuard)
  async contribute(
    @Body() createTransactionDto: CreateFinanceTransactionDto,
    @CurrentUser() user: any,
  ) {
    // Đảm bảo type là income và status là pending
    const contributionDto = {
      ...createTransactionDto,
      type: 'income',
      status: 'pending',
    };
    return this.transactionsService.create(
      contributionDto,
      user._id.toString(),
    );
  }

  /**
   * Tạo transaction mới
   * POST /finance/transactions
   * Yêu cầu quyền: admin, editor
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
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
   * GET /finance/transactions?page=1&limit=20&fund_id=xxx&type=income&status=completed&search=keyword&sortBy=amount&sortOrder=desc
   * Yêu cầu quyền: admin, editor
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'editor')
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('fund_id') fundId?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return this.transactionsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      fundId,
      type,
      status,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      search,
      sortBy,
      sortOrder,
    );
  }

  /**
   * Lấy transaction theo ID
   * GET /finance/transactions/:id
   * Yêu cầu quyền: admin, editor
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.transactionsService.remove(id);
  }
}

