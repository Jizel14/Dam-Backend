import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Quiz extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, enum: ['4-6', '7-9', '10-12'] })
  level: string;

  @Prop({ type: [Object], required: true })
  questions: {
    id: string;
    type: 'multiple-choice' | 'pronunciation' | 'match' | 'fill-blank';
    question: string;
    options?: string[];
    correctAnswer: string;
    wordId?: Types.ObjectId;
    points: number;
  }[];

  @Prop({ type: Types.ObjectId, ref: 'Lesson' })
  lessonId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ default: 10 })
  timeLimit: number; // minutes

  @Prop({ default: true })
  isActive: boolean;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);
