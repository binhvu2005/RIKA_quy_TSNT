import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FundsService } from './funds.service';
import { CreateFundDto } from './dto/create-fund.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

/**
 * Funds Controller
 * Xử lý các HTTP request liên quan đến Fund
 */
@Controller('funds')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FundsController {
  constructor(private readonly fundsService: FundsService) {}

  /**
   * Tạo fund mới
   * POST /funds
   * Yêu cầu quyền: admin
   */
  @Post()
  @Roles('admin')
  async create(@Body() createFundDto: CreateFundDto) {
    return this.fundsService.create(createFundDto);
  }

  /**
   * Lấy tất cả funds
   * GET /funds
   * Yêu cầu quyền: admin, editor
   */
  @Get()
  @Roles('admin', 'editor')
  async findAll() {
    return this.fundsService.findAll();
  }

  /**
   * Lấy fund theo ID
   * GET /funds/:id
   * Yêu cầu quyền: admin, editor
   */
  @Get(':id')
  @Roles('admin', 'editor')
  async findOne(@Param('id') id: string) {
    return this.fundsService.findOne(id);
  }

  /**
   * Cập nhật fund
   * PATCH /funds/:id
   * Yêu cầu quyền: admin
   */
  @Patch(':id')
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateFundDto>,
  ) {
    return this.fundsService.update(id, updateData);
  }

  /**
   * Xóa fund
   * DELETE /funds/:id
   * Yêu cầu quyền: admin
   */
  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.fundsService.remove(id);
  }
}

