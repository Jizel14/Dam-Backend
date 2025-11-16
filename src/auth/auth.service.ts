import { Injectable, ConflictException, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema';
import { Otp } from './schemas/otp.schema';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignupParentDto } from './dto/signup-parent.dto';
import { SignupTeacherDto } from './dto/signup-teacher.dto';
import { CreateKidDto } from './dto/create-kid.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateKidDto } from './dto/update-kid.dto';
import { Role } from './enums/role.enums';
import { MailService } from './mail.service';
import { ChildProfile } from '../children/schemas/child-profile.schema';
import { CheckEmailDto } from './dto/check-email.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Otp.name) private otpModel: Model<Otp>,
    @InjectModel(ChildProfile.name) private childProfileModel: Model<ChildProfile>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async signupUser(signupDto: SignupDto): Promise<{ token: string; user: any }> {
    const { email, password, ...rest } = signupDto;

    // Check if user exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with PARENT role (default)
    const user = await this.userModel.create({
      ...rest,
      email,
      password: hashedPassword,
      roles: [Role.PARENT],
    });

    // Generate token
    const token = this.jwtService.sign({ 
      id: user._id, 
      roles: user.roles 
    });

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        age: user.age,
        phone: user.phone,
        address: user.address,
      },
    };
  }

  async createAdmin(createAdminDto: CreateAdminDto): Promise<{ token: string; user: any }> {
    const { email, password, name } = createAdminDto;

    // Check if user exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin with ADMIN role
    const admin = await this.userModel.create({
      name,
      email,
      password: hashedPassword,
      roles: [Role.ADMIN],
    });

    // Generate token
    const token = this.jwtService.sign({ 
      id: admin._id, 
      roles: admin.roles 
    });

    return {
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        roles: admin.roles,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<{ token: string; user: any }> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate token
    const token = this.jwtService.sign({ 
      id: user._id, 
      roles: user.roles 
    });

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles, // ✅ Already returning roles
        age: user.age,
        phone: user.phone,
        address: user.address,
      },
    };
  }

  async getAllUsers(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return { message: 'User deleted successfully' };
  }

  /**
   * Generate and send OTP for password reset
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    // Check if user exists
    const user = await this.userModel.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not for security
      return { message: 'If the email exists, an OTP has been sent' };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTPs for this email
    await this.otpModel.deleteMany({ email });

    // Save OTP to database (expires in 10 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await this.otpModel.create({
      email,
      otp,
      expiresAt,
      isUsed: false,
    });

    // Send OTP via email
    try {
      await this.mailService.sendOtpEmail(email, otp);
    } catch (error) {
      throw new BadRequestException('Failed to send OTP email');
    }

    return { message: 'OTP sent successfully to your email' };
  }

  /**
   * Verify OTP code
   */
  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{ message: string; valid: boolean }> {
    const { email, otp } = verifyOtpDto;

    // Find the OTP
    const otpRecord = await this.otpModel.findOne({
      email,
      otp,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    return { message: 'OTP verified successfully', valid: true };
  }

  /**
   * Reset password using OTP
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { email, otp, newPassword } = resetPasswordDto;

    // Verify OTP
    const otpRecord = await this.otpModel.findOne({
      email,
      otp,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Find user
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Send confirmation email
    try {
      await this.mailService.sendPasswordChangedEmail(email, user.name);
    } catch (error) {
      console.error('Failed to send password changed email:', error);
    }

    return { message: 'Password reset successfully' };
  }

  async signupParent(signupParentDto: SignupParentDto): Promise<{ token: string; user: any }> {
    const { email, password, ...rest } = signupParentDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userModel.create({
      ...rest,
      email,
      password: hashedPassword,
      roles: [Role.PARENT],
    });

    const token = this.jwtService.sign({ 
      id: user._id, 
      roles: user.roles 
    });

    // Send welcome email
    try {
      await this.mailService.sendWelcomeEmail(email, user.name);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        phone: user.phone,
        address: user.address,
      },
    };
  }

  async signupTeacher(signupTeacherDto: SignupTeacherDto): Promise<{ token: string; user: any }> {
    const { email, password, ...rest } = signupTeacherDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userModel.create({
      ...rest,
      email,
      password: hashedPassword,
      roles: [Role.TEACHER],
    });

    const token = this.jwtService.sign({ 
      id: user._id, 
      roles: user.roles 
    });

    try {
      await this.mailService.sendWelcomeEmail(email, user.name);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        school: user.school,
        grade: user.grade,
      },
    };
  }

  async createKid(parentId: string, createKidDto: CreateKidDto): Promise<{ user: any }> {
    const { username, name, avatar, age, level, grade } = createKidDto;

    // Check if username exists (check in ChildProfile collection)
    const existingKid = await this.childProfileModel.findOne({ 
      userId: parentId,
      name: username 
    }).exec();

    if (existingKid) {
      throw new ConflictException('Username already taken');
    }

    // Create kid profile linked to parent
    const kid = await this.childProfileModel.create({
      userId: parentId, // Link to parent
      name: name || username,
      avatar: avatar || 'default-avatar.png',
      level,
      age,
      xp: 0,
      timeLimitMinutes: 30,
      petParts: [],
      targetLanguage: 'en',
      isActive: true,
    });

    return {
      user: {
        id: kid._id,
        parentId: parentId,
        name: kid.name,
        username: username,
        avatar: kid.avatar,
        age: kid.age,
        level: kid.level,
        xp: kid.xp,
      },
    };
  }

  /**
   * Update user profile (Parent/Teacher can edit their own profile)
   */
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<{ user: any }> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if email is being changed and if it already exists
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUser = await this.userModel.findOne({ email: updateProfileDto.email }).exec();
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }

    // Update allowed fields
    const allowedFields = ['name', 'email', 'phone', 'address', 'age', 'school', 'grade'];
    allowedFields.forEach(field => {
      if (updateProfileDto[field] !== undefined) {
        user[field] = updateProfileDto[field];
      }
    });

    await user.save();

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        phone: user.phone,
        address: user.address,
        age: user.age,
        school: user.school,
        grade: user.grade,
      },
    };
  }

  /**
   * Change password (requires current password verification)
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Send confirmation email
    try {
      await this.mailService.sendPasswordChangedEmail(user.email, user.name);
    } catch (error) {
      console.error('Failed to send password changed email:', error);
    }

    return { message: 'Password changed successfully' };
  }

  /**
   * Update kid profile (Parent can ONLY edit their own kids)
   */
  async updateKidProfile(parentId: string, kidId: string, updateKidDto: UpdateKidDto): Promise<{ user: any }> {
    // Find kid and verify parent ownership
    const kid = await this.childProfileModel.findOne({ 
      _id: kidId,
      userId: parentId, // ✅ Verify parent owns this kid
      isActive: true
    }).exec();

    if (!kid) {
      throw new ForbiddenException('Kid not found or you do not have permission to edit this profile');
    }

    // Update allowed fields
    if (updateKidDto.name !== undefined) kid.name = updateKidDto.name;
    if (updateKidDto.avatar !== undefined) kid.avatar = updateKidDto.avatar;
    if (updateKidDto.age !== undefined) kid.age = updateKidDto.age;
    if (updateKidDto.level !== undefined) kid.level = updateKidDto.level;
    if (updateKidDto.grade !== undefined) {
      // Store grade in a custom field if needed, or ignore
      // ChildProfile schema doesn't have grade field, you may need to add it
    }

    await kid.save();

    return {
      user: {
        id: kid._id,
        parentId: kid.userId,
        name: kid.name,
        avatar: kid.avatar,
        age: kid.age,
        level: kid.level,
        xp: kid.xp,
        petParts: kid.petParts,
      },
    };
  }

  /**
   * Get kids by parent (only return kids belonging to this parent)
   */
  async getKidsByParent(parentId: string): Promise<ChildProfile[]> {
    return this.childProfileModel
      .find({ 
        userId: parentId, // ✅ Filter by parent
        isActive: true 
      })
      .select('-__v')
      .exec();
  }

  /**
   * Delete kid profile (Parent can ONLY delete their own kids)
   */
  async deleteKidProfile(parentId: string, kidId: string): Promise<{ message: string; kidId: string }> {
    // Find kid and verify parent ownership
    const kid = await this.childProfileModel.findOne({ 
      _id: kidId,
      userId: parentId, // ✅ Verify parent owns this kid
      isActive: true
    }).exec();

    if (!kid) {
      throw new ForbiddenException('Kid not found or you do not have permission to delete this profile');
    }

    // Soft delete - set isActive to false
    kid.isActive = false;
    await kid.save();

    // Alternative: Hard delete (permanent removal)
    // await this.childProfileModel.findByIdAndDelete(kidId);

    return { 
      message: 'Kid profile deleted successfully',
      kidId: kidId
    };
  }

  /**
   * Check if email exists in the system
   */
  async checkEmailExists(checkEmailDto: CheckEmailDto): Promise<{ exists: boolean; message: string }> {
    const { email } = checkEmailDto;

    const user = await this.userModel.findOne({ email }).exec();

    if (user) {
      return {
        exists: true,
        message: 'Email is registered in the system'
      };
    }

    return {
      exists: false,
      message: 'Email is not registered'
    };
  }
}