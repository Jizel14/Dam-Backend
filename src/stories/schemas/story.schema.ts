import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Story extends Document {
  @Prop({ type: Types.ObjectId, ref: 'ChildProfile', required: true })
  childId: Types.ObjectId;

  @Prop({ required: true })
  level: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Word' }], required: true })
  items: Types.ObjectId[];

  @Prop({ required: true })
  text: string;

  @Prop()
  audioUrl: string;

  @Prop()
  coverImageUrl: string;

  @Prop({ enum: ['narration', 'finish'], default: 'narration' })
  mode: string;

  @Prop()
  childEndingAudioUrl: string;

  @Prop({ default: false })
  isShared: boolean;
}

export const StorySchema = SchemaFactory.createForClass(Story);
