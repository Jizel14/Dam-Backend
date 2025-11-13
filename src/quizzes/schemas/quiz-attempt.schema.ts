import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class QuizAttempt extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Quiz', required: true })
  quizId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ChildProfile', required: true })
  childId: Types.ObjectId;

  @Prop({ type: [Object], required: true })
  answers: {
    questionId: string;
    answer: string;
    isCorrect: boolean;
    points: number;
  }[];

  @Prop({ required: true })
  score: number;

  @Prop({ required: true })
  totalPoints: number;

  @Prop()
  completedAt: Date;

  @Prop()
  timeSpent: number; // seconds
}

export const QuizAttemptSchema = SchemaFactory.createForClass(QuizAttempt);

QuizAttemptSchema.index({ quizId: 1, childId: 1 });
