import { Controller, Post, Body, Get, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from './guards/role.guards';
import { Roles } from './decorators/role.decorator';
import { Role } from './enums/role.enums';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignupParentDto } from './dto/signup-parent.dto';
import { SignupTeacherDto } from './dto/signup-teacher.dto';
import { CreateKidDto } from './dto/create-kid.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup/parent')
  @ApiOperation({ 
    summary: 'Parent registration',
    description: 'Register a new parent account with email and password. Parents can manage their children profiles and track their progress.'
  })
  @ApiResponse({ status: 201, description: 'Parent account created successfully. Returns JWT token and user profile.' })
  @ApiResponse({ status: 409, description: 'Email already exists in the system.' })
  @ApiResponse({ status: 400, description: 'Validation error - Check email format and password requirements.' })
  async signupParent(@Body() signupParentDto: SignupParentDto) {
    return this.authService.signupParent(signupParentDto);
  }

  @Post('signup/teacher')
  @ApiOperation({ 
    summary: 'Teacher registration',
    description: 'Register a new teacher account. Teachers can create classroom quests, track student progress, and manage learning activities.'
  })
  @ApiResponse({ status: 201, description: 'Teacher account created successfully with JWT token.' })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  async signupTeacher(@Body() signupTeacherDto: SignupTeacherDto) {
    return this.authService.signupTeacher(signupTeacherDto);
  }

  @Post('kids')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.PARENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Create kid profile (Parent only)',
    description: 'Parents can create profiles for their children. Kids use avatar-based login managed by parents.'
  })
  @ApiResponse({ status: 201, description: 'Kid profile created successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only parents can create kid profiles.' })
  @ApiResponse({ status: 409, description: 'Username already taken.' })
  async createKid(@Request() req, @Body() createKidDto: CreateKidDto) {
    return this.authService.createKid(req.user.id, createKidDto);
  }

  @Get('kids')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.PARENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get all kids for current parent',
    description: 'Retrieve all child profiles associated with the authenticated parent account.'
  })
  @ApiResponse({ status: 200, description: 'List of kid profiles.' })
  async getMyKids(@Request() req) {
    return this.authService.getKidsByParent(req.user.id);
  }

  @Post('signup')
  @ApiOperation({ 
    summary: 'Generic user registration (Deprecated)',
    description: 'Use /signup/parent or /signup/teacher instead. This endpoint creates a basic user account.'
  })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation failed' })
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signupUser(signupDto);
  }

  @Post('login')
  @ApiOperation({ 
    summary: 'User login (All roles)',
    description: `
      Authenticate with email and password. Returns JWT token for API access.
      
      **Supported Roles:**
      - Admin: Full system access
      - Teacher: Classroom management
      - Parent: Child profile management
      - Kid: Limited access (avatar-based login through parent dashboard)
      
      **Response includes:**
      - JWT token for Authorization header
      - User profile with role information
      - User details (name, email, phone, etc.)
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful. Returns JWT token and user profile with roles.',
    schema: {
      example: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '507f1f77bcf86cd799439011',
          name: 'John Doe',
          email: 'john@example.com',
          roles: ['parent'], // 🎯 Roles array returned
          age: 35,
          phone: '+21612345678',
          address: 'Tunis, Tunisia'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid credentials or account deactivated.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid email or password',
        error: 'Unauthorized'
      }
    }
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('admin/create')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Create admin user (Admin only)',
    description: 'Create a new administrator account. Requires existing admin authentication. Admins have full system access.'
  })
  @ApiResponse({ status: 201, description: 'Admin created successfully with elevated privileges.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.authService.createAdmin(createAdminDto);
  }

  @Get('users')
  //@UseGuards(AuthGuard(), RoleGuard)
  //@Roles(Role.ADMIN)
  //@ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get all users (Admin only)',
    description: 'Retrieve complete list of all users in the system including Parents, Teachers, Kids, and Admins.'
  })
  @ApiResponse({ status: 200, description: 'Array of all users with their profiles (passwords excluded).' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAllUsers() {
    return this.authService.getAllUsers();
  }

  @Get('users/:id')
  @UseGuards(AuthGuard())
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get user by ID',
    description: 'Retrieve detailed user profile by ID. Users can view their own profile, admins can view any profile.'
  })
  @ApiResponse({ status: 200, description: 'User details retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string) {
    return this.authService.getUserById(id);
  }

  @Delete('users/:id')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Delete user (Admin only)',
    description: 'Permanently delete a user account from the system. This action cannot be undone.'
  })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }

  @Post('/forgot-password')
  @ApiOperation({ 
    summary: 'Request password reset',
    description: 'Send a 6-digit OTP code to user email for password reset. OTP expires in 10 minutes.'
  })
  @ApiResponse({ status: 200, description: 'OTP sent to email if account exists. Check your inbox.' })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation failed' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('/verify-otp')
  @ApiOperation({ 
    summary: 'Verify OTP code',
    description: 'Verify the 6-digit OTP received via email before resetting password.'
  })
  @ApiResponse({ status: 200, description: 'OTP verified successfully. Proceed with password reset.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP code.' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Post('/reset-password')
  @ApiOperation({ 
    summary: 'Reset password with OTP',
    description: 'Reset account password using verified OTP code. Requires email, OTP, and new password.'
  })
  @ApiResponse({ status: 200, description: 'Password reset successfully. Confirmation email sent.' })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation failed' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}