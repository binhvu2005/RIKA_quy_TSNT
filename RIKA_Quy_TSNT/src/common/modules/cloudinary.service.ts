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

    // Kiểm tra loại file
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File phải là ảnh');
    }

    // Kiểm tra kích thước file (tối đa 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('Kích thước file không được vượt quá 5MB');
    }

    return new Promise((resolve, reject) => {
      const uploadOptions: any = {
        resource_type: 'auto',
      };

      if (folder) {
        uploadOptions.folder = folder;
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(new BadRequestException(`Lỗi upload ảnh: ${error.message}`));
          } else if (result) {
            resolve(result.secure_url);
          } else {
            reject(new BadRequestException('Lỗi upload ảnh: Không nhận được kết quả từ Cloudinary'));
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

