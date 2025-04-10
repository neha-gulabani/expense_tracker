import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  _id?: string;
  
  @Prop({ required: true })
  name: string;
  
  @Prop()
  color: string;
  
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User;
}

export const CategorySchema = SchemaFactory.createForClass(Category);