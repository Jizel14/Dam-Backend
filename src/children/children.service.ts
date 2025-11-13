import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChildProfile } from './schemas/child-profile.schema';
import { CreateChildProfileDto } from './dto/create-child-profile.dto';
import { UpdateChildProfileDto } from './dto/update-child-profile.dto';

@Injectable()
export class ChildrenService {
  constructor(
    @InjectModel(ChildProfile.name) private childProfileModel: Model<ChildProfile>,
  ) {}

  async create(userId: string, createChildProfileDto: CreateChildProfileDto): Promise<ChildProfile> {
    const profile = await this.childProfileModel.create({
      ...createChildProfileDto,
      userId,
    });
    return profile;
  }

  async findAllByParent(userId: string): Promise<ChildProfile[]> {
    return this.childProfileModel.find({ userId, isActive: true }).exec();
  }

  async findOne(id: string, userId: string): Promise<ChildProfile> {
    const profile = await this.childProfileModel.findOne({ _id: id, userId }).exec();
    if (!profile) {
      throw new NotFoundException('Child profile not found');
    }
    return profile;
  }

  async update(id: string, userId: string, updateChildProfileDto: UpdateChildProfileDto): Promise<ChildProfile> {
    const profile = await this.childProfileModel.findOneAndUpdate(
      { _id: id, userId },
      updateChildProfileDto,
      { new: true },
    ).exec();
    if (!profile) {
      throw new NotFoundException('Child profile not found');
    }
    return profile;
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const profile = await this.childProfileModel.findOneAndUpdate(
      { _id: id, userId },
      { isActive: false },
      { new: true },
    ).exec();
    if (!profile) {
      throw new NotFoundException('Child profile not found');
    }
    return { message: 'Child profile deleted successfully' };
  }

  async addXP(childId: string, xp: number): Promise<ChildProfile> {
    const profile = await this.childProfileModel.findByIdAndUpdate(
      childId,
      { $inc: { xp } },
      { new: true },
    ).exec();
    if (!profile) {
      throw new NotFoundException('Child profile not found');
    }
    return profile;
  }

  async addPetPart(childId: string, part: string): Promise<ChildProfile> {
    const profile = await this.childProfileModel.findByIdAndUpdate(
      childId,
      { $addToSet: { petParts: part } },
      { new: true },
    ).exec();
    if (!profile) {
      throw new NotFoundException('Child profile not found');
    }
    return profile;
  }
}
