import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChildrenService } from './children.service';
import { ChildrenController } from './children.controller';
import { ChildProfile, ChildProfileSchema } from './schemas/child-profile.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChildProfile.name, schema: ChildProfileSchema },
    ]),
    AuthModule,
  ],
  controllers: [ChildrenController],
  providers: [ChildrenService],
  exports: [ChildrenService],
})
export class ChildrenModule {}
