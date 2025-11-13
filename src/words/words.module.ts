import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WordsService } from './words.service';
import { WordsController } from './words.controller';
import { Word, WordSchema } from './schemas/word.schema';
import { Category, CategorySchema } from './schemas/category.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Word.name, schema: WordSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
    AuthModule,
  ],
  controllers: [WordsController],
  providers: [WordsService],
  exports: [WordsService],
})
export class WordsModule {}
