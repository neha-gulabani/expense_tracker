import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Category } from '../../categories/schemas/category.schema';
import { User } from '../../users/schemas/user.schema';

export enum RecurringInterval {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export type RecurringExpenseDocument = RecurringExpense & Document;

@Schema({ timestamps: true })
export class RecurringExpense {
  _id?: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: RecurringInterval, default: RecurringInterval.MONTHLY })
  frequency: RecurringInterval;

  @Prop({ required: true })
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category' })
  category: Category;

  @Prop({ type: String, required: true })
  user: string;

  @Prop({ default: false })
  isActive: boolean;

  @Prop({ default: Date.now })
  lastProcessed: Date;
}

export const RecurringExpenseSchema = SchemaFactory.createForClass(RecurringExpense);