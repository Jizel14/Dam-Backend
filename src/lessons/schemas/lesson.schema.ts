import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Lesson extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: ['4-6', '7-9', '10-12'] })
  level: string;

  @Prop({ required: true })
  category: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] })
  targetWords: Types.ObjectId[];

  @Prop({ type: Object })
  content: {
    intro?: string;
    activities?: any[];
    objectives?: string[];
  };

  @Prop()
  duration: number; // in minutes

  @Prop()
  coverImage: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isPublic: boolean;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
