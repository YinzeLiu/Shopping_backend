import { Body, NotFoundException, ValidationPipe } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Category } from '../categories/entities/category.entity';

import { ProductQueryDto } from './dto/product-query.dto';

export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(query: ProductQueryDto): Promise<Product[]> {
    const { categoryId, name } = query;
    const where: any = {};

    if (categoryId) {
      where.category = { id: categoryId };
    }

    if (name) {
      where.name = ILike(`%${name}%`);
    }

    return this.productRepository.find({
      where,
      relations: ['category'],
    });
  }
  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: { id: +id },
      relations: ['category'],
    });
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }

  async create(createProductDto: CreateProductDto) {
    const category = await this.categoryRepository.findOneBy({
      id: createProductDto.categoryId,
    });

    if (!category) {
      throw new NotFoundException(
        `Category #${createProductDto.categoryId} not found`,
      );
    }

    const product = this.productRepository.create({
      ...createProductDto,
      category,
    });

    return this.productRepository.save(product);
  }

  async update(
    id: number,
    @Body(ValidationPipe) updateProductDto: UpdateProductDto,
  ) {
    const product = await this.productRepository.findOne({
      where: { id: +id },
      relations: ['category'],
    });
    if (!product) {
      throw new NotFoundException(`Product #${id} not found for update`);
    }
    const category = await this.categoryRepository.findOneBy({
      id: updateProductDto.categoryId,
    });
    if (!category) {
      throw new NotFoundException(
        `Category #${updateProductDto.categoryId} not found`,
      );
    }
    const updatedProduct = this.productRepository.merge(product, {
      ...updateProductDto,
      category,
    });
    return this.productRepository.save(updatedProduct);
  }
  async remove(id: number) {
    const product = await this.productRepository.findOne({
      where: { id: +id },
    });
    if (!product) {
      throw new NotFoundException(`Product #${id} not found for removal 1`);
    }
    return this.productRepository.remove(product);
  }
}
