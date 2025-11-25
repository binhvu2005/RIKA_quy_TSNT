import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

/**
 * Categories Service
 * Xử lý logic nghiệp vụ liên quan đến Category
 */
@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  /**
   * Tạo category mới
   * @param createCategoryDto - Dữ liệu tạo category
   * @returns Category đã tạo
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryDocument> {
    // Tạo slug nếu không có
    let slug = createCategoryDto.slug;
    if (!slug) {
      slug = this.generateSlug(createCategoryDto.name);
    }

    // Kiểm tra slug đã tồn tại
    const existingCategory = await this.categoryModel.findOne({ slug });
    if (existingCategory) {
      throw new ConflictException('Slug đã tồn tại');
    }

    // Xử lý parent_id và ancestors
    let parent_id: Types.ObjectId | null = null;
    let ancestors: any[] = [];

    if (createCategoryDto.parent_id) {
      const parent = await this.categoryModel.findById(
        createCategoryDto.parent_id,
      );
      if (!parent) {
        throw new NotFoundException('Danh mục cha không tồn tại');
      }

      // Kiểm tra không được tạo category con của chính nó
      if (parent._id.toString() === createCategoryDto.parent_id) {
        throw new BadRequestException('Không thể tạo danh mục con của chính nó');
      }

      parent_id = parent._id;
      ancestors = [...parent.ancestors, parent._id];
    }

    const category = new this.categoryModel({
      ...createCategoryDto,
      slug,
      parent_id,
      ancestors,
    });

    return category.save();
  }

  /**
   * Lấy tất cả categories dạng cây
   * @param type - Lọc theo loại
   * @returns Danh sách categories dạng cây
   */
  async findAll(type?: string): Promise<CategoryDocument[]> {
    const query: any = {};
    if (type) {
      query.type = type;
    }

    const categories = await this.categoryModel.find(query).sort({ name: 1 });

    // Xây dựng cây từ danh sách phẳng
    return this.buildTree(categories);
  }

  /**
   * Lấy category theo ID
   * @param id - Category ID
   * @returns Category document
   */
  async findOne(id: string): Promise<CategoryDocument> {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException(`Category với ID ${id} không tồn tại`);
    }
    return category;
  }

  /**
   * Lấy category theo slug
   * @param slug - Category slug
   * @returns Category document
   */
  async findBySlug(slug: string): Promise<CategoryDocument> {
    const category = await this.categoryModel.findOne({ slug });
    if (!category) {
      throw new NotFoundException(`Category với slug ${slug} không tồn tại`);
    }
    return category;
  }

  /**
   * Cập nhật category
   * @param id - Category ID
   * @param updateCategoryDto - Dữ liệu cập nhật
   * @returns Category đã cập nhật
   */
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryDocument> {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException(`Category với ID ${id} không tồn tại`);
    }

    // Xử lý slug nếu có thay đổi
    if (updateCategoryDto.name && !updateCategoryDto.slug) {
      updateCategoryDto.slug = this.generateSlug(updateCategoryDto.name);
    }

    // Kiểm tra slug trùng lặp
    if (updateCategoryDto.slug) {
      const existing = await this.categoryModel.findOne({
        slug: updateCategoryDto.slug,
        _id: { $ne: id },
      });
      if (existing) {
        throw new ConflictException('Slug đã tồn tại');
      }
    }

    // Xử lý parent_id nếu có thay đổi
    if (updateCategoryDto.parent_id !== undefined) {
      if (updateCategoryDto.parent_id) {
        const parent = await this.categoryModel.findById(
          updateCategoryDto.parent_id,
        );
        if (!parent) {
          throw new NotFoundException('Danh mục cha không tồn tại');
        }

        // Kiểm tra không được set parent là chính nó hoặc con của nó
        if (
          parent._id.toString() === id ||
          parent.ancestors.some((a) => a.toString() === id)
        ) {
          throw new BadRequestException(
            'Không thể đặt danh mục cha là chính nó hoặc con của nó',
          );
        }

        updateCategoryDto['ancestors'] = [...parent.ancestors, parent._id];
      } else {
        updateCategoryDto['ancestors'] = [];
      }
    }

    const updated = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();
    
    if (!updated) {
      throw new NotFoundException('Category không tồn tại');
    }
    
    return updated;
  }

  /**
   * Xóa category
   * @param id - Category ID
   */
  async remove(id: string): Promise<void> {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException(`Category với ID ${id} không tồn tại`);
    }

    // Kiểm tra có category con không
    const children = await this.categoryModel.findOne({ parent_id: id });
    if (children) {
      throw new BadRequestException(
        'Không thể xóa category có category con. Vui lòng xóa các category con trước.',
      );
    }

    await this.categoryModel.findByIdAndDelete(id);
  }

  /**
   * Xây dựng cây từ danh sách phẳng
   * @param categories - Danh sách categories phẳng
   * @returns Danh sách categories dạng cây
   */
  private buildTree(categories: CategoryDocument[]): CategoryDocument[] {
    const map = new Map();
    const roots: CategoryDocument[] = [];

    // Tạo map
    categories.forEach((cat) => {
      map.set(cat._id.toString(), { ...cat.toObject(), children: [] });
    });

    // Xây dựng cây
    categories.forEach((cat) => {
      const node = map.get(cat._id.toString());
      if (cat.parent_id) {
        const parent = map.get(cat.parent_id.toString());
        if (parent) {
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots as any;
  }

  /**
   * Tạo slug từ tên
   * @param name - Tên category
   * @returns Slug
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu
      .replace(/[^a-z0-9]+/g, '-') // Thay ký tự đặc biệt bằng dấu gạch ngang
      .replace(/^-+|-+$/g, ''); // Loại bỏ dấu gạch ngang ở đầu và cuối
  }
}

