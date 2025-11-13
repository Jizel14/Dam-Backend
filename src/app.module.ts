import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { WordsModule } from './words/words.module';
import { ChildrenModule } from './children/children.module';
import { StoriesModule } from './stories/stories.module';
import { QuestsModule } from './quests/quests.module';
import { ProgressModule } from './progress/progress.module';
import { LessonsModule } from './lessons/lessons.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { TwinTalkModule } from './twin-talk/twin-talk.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.DB_URI || 'mongodb://localhost/nestjs-app', ),
    AuthModule,
    WordsModule,
    ChildrenModule,
    StoriesModule,
    QuestsModule,
    ProgressModule,
    LessonsModule,
    QuizzesModule,
    TwinTalkModule,
  ],
})
export class AppModule {}