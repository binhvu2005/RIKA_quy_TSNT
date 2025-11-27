import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Express } from 'express';

/**
 * Cloudinary Service
 * Service xử lý upload và quản lý ảnh với Cloudinary
 */
@Injectable()
export class CloudinaryService {
  /**
   * Upload ảnh lên Cloudinary
   * @param file - File ảnh từ multer
   * @param folder - Folder trên Cloudinary để lưu ảnh (optional)
   * @returns URL của ảnh đã upload
   */
  async uploadImage(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('Không có file được tải lên');
    }

    // Kiểm tra loại file - cho phép cả ảnh và document
    const allowedMimeTypes = [
      'image/', // Tất cả các loại ảnh
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    ];
    
    const isValidType = allowedMimeTypes.some(type => file.mimetype.startsWith(type));
    if (!isValidType) {
      throw new BadRequestException('File không được hỗ trợ. Chỉ chấp nhận: ảnh, PDF, Word, Excel');
    }

    // Kiểm tra kích thước file (tối đa 10MB cho document, 5MB cho ảnh)
    const maxSize = file.mimetype.startsWith('image/') 
      ? 5 * 1024 * 1024  // 5MB cho ảnh
      : 10 * 1024 * 1024; // 10MB cho document
    if (file.size > maxSize) {
      throw new BadRequestException(
        `Kích thước file không được vượt quá ${maxSize / 1024 / 1024}MB`
      );
    }

    return new Promise((resolve, reject) => {
      const uploadOptions: any = {
        resource_type: 'auto', // Cloudinary tự động detect loại file
      };

      if (folder) {
        uploadOptions.folder = folder;
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(new BadRequestException(`Lỗi upload file: ${error.message}`));
          } else if (result) {
            resolve(result.secure_url);
          } else {
            reject(new BadRequestException('Lỗi upload file: Không nhận được kết quả từ Cloudinary'));
          }
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  /**
   * Upload nhiều ảnh cùng lúc
   * @param files - Mảng các file ảnh
   * @param folder - Folder trên Cloudinary để lưu ảnh (optional)
   * @returns Mảng các URL của ảnh đã upload
   */
  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder?: string,
  ): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Không có file được tải lên');
    }

    const uploadPromises = files.map((file) => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }

  /**
   * Xóa ảnh từ Cloudinary
   * @param publicId - Public ID của ảnh trên Cloudinary
   * @returns Kết quả xóa
   */
  async deleteImage(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId);
  }

  /**
   * Lấy public ID từ URL Cloudinary
   * @param url - URL của ảnh trên Cloudinary
   * @returns Public ID
   */
  extractPublicIdFromUrl(url: string): string | null {
    try {
      const regex = /\/([^\/]+)\/([^\/]+)\/([^\/]+)\.(jpg|jpeg|png|gif|webp)$/;
      const match = url.match(regex);
      if (match) {
        return `${match[2]}/${match[3]}`;
      }
      return null;
    } catch {
      return null;
    }
  }
}

