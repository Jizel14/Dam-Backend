import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
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
import { Role } from './enums/role.enums';
import { MailService } from './mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Otp.name) private otpModel: Model<Otp>,
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
    const { username, age, ...rest } = createKidDto;

    // Check if username exists
    const existingKid = await this.userModel.findOne({ email: `${username}@kid.local` });
    if (existingKid) {
      throw new ConflictException('Username already taken');
    }

    // Create kid account (no password, parent manages)
    const kid = await this.userModel.create({
      ...rest,
      age,
      email: `${username}@kid.local`, // Internal email
      password: await bcrypt.hash(Math.random().toString(36), 10), // Random password
      roles: [Role.KID],
    });

    return {
      user: {
        id: kid._id,
        name: kid.name,
        username,
        avatar: kid.avatar,
        age: kid.age,
        level: createKidDto.level,
        roles: kid.roles,
      },
    };
  }

  async getKidsByParent(parentId: string): Promise<User[]> {
    // In a real app, you'd have a relation between parent and kids
    // For now, return all kids (you should add parentId to User schema)
    return this.userModel.find({ roles: Role.KID }).select('-password').exec();
  }
}