import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../enums/role.enums';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [String], enum: Role, required: true })
  roles: Role[];

  @Prop()
  age?: number;

  @Prop()
  phone?: string;

  @Prop()
  address?: string;

  @Prop()
  school?: string;

  @Prop()
  grade?: string;

  @Prop()
  avatar?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 'en' })
  locale: string;
}

export const UserSchema = SchemaFactory.createForClass(User);