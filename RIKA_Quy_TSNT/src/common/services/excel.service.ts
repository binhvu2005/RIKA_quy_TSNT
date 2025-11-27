import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

/**
 * Excel Service
 * Xử lý xuất/nhập dữ liệu Excel
 */
@Injectable()
export class ExcelService {
  /**
   * Xuất danh sách users ra Excel
   * @param users - Danh sách users
   * @returns Buffer chứa file Excel
   */
  async exportUsers(users: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    // Định nghĩa columns
    worksheet.columns = [
      { header: 'STT', key: 'stt', width: 10 },
      { header: 'Username', key: 'username', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Họ và tên', key: 'full_name', width: 25 },
      { header: 'Số điện thoại', key: 'phone', width: 15 },
      { header: 'CMND/CCCD', key: 'identity', width: 15 },
      { header: 'Vai trò', key: 'roles', width: 20 },
      { header: 'Trạng thái', key: 'status', width: 15 },
      { header: 'Ngày tạo', key: 'created_at', width: 20 },
    ];

    // Style cho header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Thêm dữ liệu
    users.forEach((user, index) => {
      worksheet.addRow({
        stt: index + 1,
        username: user.username || '',
        email: user.email || '',
        full_name: user.profile?.full_name || '',
        phone: user.profile?.phone || '',
        identity: user.profile?.identity || '',
        roles: user.roles?.join(', ') || '',
        status: user.status || '',
        created_at: user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : '',
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Đọc danh sách users từ Excel
   * @param fileBuffer - Buffer của file Excel
   * @returns Danh sách users
   */
  async importUsers(fileBuffer: Buffer): Promise<any[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new Error('Không tìm thấy worksheet trong file Excel');
    }

    const users: any[] = [];
    let rowIndex = 0;

    worksheet.eachRow((row, rowNumber) => {
      // Bỏ qua header row
      if (rowNumber === 1) return;

      rowIndex++;
      const values = row.values as any[];

      users.push({
        username: values[2]?.toString().trim() || '',
        email: values[3]?.toString().trim() || '',
        password: 'TempPassword123!', // Mật khẩu tạm, user cần đổi sau
        profile: {
          full_name: values[4]?.toString().trim() || '',
          phone: values[5]?.toString().trim() || '',
          identity: values[6]?.toString().trim() || '',
        },
        roles: values[7]?.toString().split(',').map((r: string) => r.trim()) || ['user'],
        status: values[8]?.toString().trim() || 'active',
      });
    });

    return users;
  }

  /**
   * Xuất danh sách học bổng ra Excel
   * @param scholarships - Danh sách học bổng
   * @returns Buffer chứa file Excel
   */
  async exportScholarships(scholarships: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Scholarships');

    worksheet.columns = [
      { header: 'STT', key: 'stt', width: 10 },
      { header: 'Tên học bổng', key: 'name', width: 30 },
      { header: 'Mô tả', key: 'description', width: 40 },
      { header: 'Ngân sách', key: 'budget', width: 20 },
      { header: 'Số lượng', key: 'quantity', width: 15 },
      { header: 'Ngày bắt đầu', key: 'start_date', width: 20 },
      { header: 'Ngày kết thúc', key: 'end_date', width: 20 },
      { header: 'Trạng thái', key: 'status', width: 15 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    scholarships.forEach((scholarship, index) => {
      worksheet.addRow({
        stt: index + 1,
        name: scholarship.name || '',
        description: scholarship.description || '',
        budget: scholarship.budget || 0,
        quantity: scholarship.quantity || 0,
        start_date: scholarship.start_date ? new Date(scholarship.start_date).toLocaleDateString('vi-VN') : '',
        end_date: scholarship.end_date ? new Date(scholarship.end_date).toLocaleDateString('vi-VN') : '',
        status: scholarship.status || '',
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}

