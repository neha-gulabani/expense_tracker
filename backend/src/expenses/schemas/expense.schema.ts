import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Category } from '../../categories/schemas/category.schema';
import { User } from '../../users/schemas/user.schema';

export type ExpenseDocument = Expense & Document;

@Schema({ timestamps: true })
export class Expense {
  _id?: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  description: string;

  @Prop({ default: Date.now })
  date: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category' })
  category: Category;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);