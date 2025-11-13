import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Word extends Document {
  @Prop({ required: true })
  lemma: string;

  @Prop({ required: true })
  translation: string;

  @Prop({ type: [String], required: true })
  phonemes: string[];

  @Prop({ required: true })
  audioUrl: string;

  @Prop()
  illustrationUrl: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true, enum: ['4-6', '7-9', '10-12'] })
  level: string;

  @Prop({ default: 'en' })
  language: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const WordSchema = SchemaFactory.createForClass(Word);
