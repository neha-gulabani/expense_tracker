import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(userId: string, createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = new this.categoryModel({
      ...createCategoryDto,
      user: userId,
    });
    return category.save();
  }

  async findAll(userId: string): Promise<Category[]> {
    return this.categoryModel.find({ user: userId }).exec();
  }

  async findOne(userId: string, id: string): Promise<Category | null> {
    return this.categoryModel.findOne({ _id: id, user: userId }).exec();
  }

  async update(userId: string, id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category | null> {
    return this.categoryModel.findOneAndUpdate(
      { _id: id, user: userId },
      updateCategoryDto,
      { new: true },
    ).exec();
  }

  async remove(userId: string, id: string): Promise<Category | null> {
    return this.categoryModel.findOneAndDelete({ _id: id, user: userId }).exec();
  }

  async findOrCreate(userId: string, categoryName: string): Promise<Category> {
    let category = await this.categoryModel.findOne({
      name: categoryName,
      user: userId,
    }).exec();

    if (!category) {
      const newCategory = await this.create(userId, { 
        name: categoryName,
        color: '#' + Math.floor(Math.random()*16777215).toString(16) 
      });
      return newCategory;
    }

    return category as Category;
  }
}