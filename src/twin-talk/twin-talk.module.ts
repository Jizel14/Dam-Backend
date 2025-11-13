import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TwinTalkService } from './twin-talk.service';
import { TwinTalkController } from './twin-talk.controller';
import { TwinSession, TwinSessionSchema } from './schemas/twin-session.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TwinSession.name, schema: TwinSessionSchema },
    ]),
    AuthModule,
  ],
  controllers: [TwinTalkController],
  providers: [TwinTalkService],
  exports: [TwinTalkService],
})
export class TwinTalkModule {}
