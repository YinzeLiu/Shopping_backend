import {
  Body,
  ConflictException,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { Category } from './entities/category.entity';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateCategoryDto } from './dto/create-categoy.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  findAll() {
    return this.categoryRepository.find({
      order: {
        id: 'ASC',
      },
    });
  }
  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id: +id },
    });
    if (!category) {
      throw new NotFoundException(`Category #${id} not found`);
    }
    return category;
  }

  async create(createCategoryDto: CreateCategoryDto) {
    return this.categoryRepository.save(createCategoryDto);
  }

  async update(
    id: number,
    @Body(ValidationPipe) updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.categoryRepository.preload({
      id: +id,
      ...updateCategoryDto,
    });
    if (!category) {
      throw new NotFoundException(`Category #${id} not found for update`);
    }
    return this.categoryRepository.save(category);
  }
  async remove(id: number) {
    try {
      const category = await this.categoryRepository.findOneBy({ id });
      if (!category) throw new NotFoundException(`Category #${id} not found`);

      return await this.categoryRepository.remove(category);
    } catch (err) {
      if (err.code === '23503') {
        throw new ConflictException(
          'Cannot delete category with associated products',
        );
      }
      throw err;
    }
  }
}
