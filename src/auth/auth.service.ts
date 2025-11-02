import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { Role } from './enums/role.enums';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
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

    // Create user with USER role
    const user = await this.userModel.create({
      ...rest,
      email,
      password: hashedPassword,
      roles: [Role.USER],
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
        roles: user.roles,
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
}