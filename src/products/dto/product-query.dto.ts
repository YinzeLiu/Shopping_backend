import { IsOptional, IsNumber, IsString } from 'class-validator';

export class ProductQueryDto {
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsString()
  name?: string;
}
