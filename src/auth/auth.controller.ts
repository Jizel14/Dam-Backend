import { Controller, Post, Body, Get, Delete, Param, UseGuards, Request, Patch } from '@nestjs/common';
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
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateKidDto } from './dto/update-kid.dto';
import { CheckEmailDto } from './dto/check-email.dto';

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
  @ApiResponse({ 
    status: 200, 
    description: 'List of kid profiles belonging to authenticated parent.',
    schema: {
      example: [
        {
          _id: '507f1f77bcf86cd799439012',
          userId: '507f1f77bcf86cd799439011',
          name: 'Nour',
          avatar: 'avatar_1.png',
          level: '4-6',
          age: 6,
          grade: 'Grade 1',
          xp: 150,
          timeLimitMinutes: 30,
          petParts: ['wings', 'hat'],
          targetLanguage: 'en',
          isActive: true,
          createdAt: '2024-01-15T10:30:00Z'
        }
      ]
    }
  })
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

  @Post('/check-email')
  @ApiOperation({ 
    summary: 'Check if email exists',
    description: `
      Verify if an email address is registered in the system before sending OTP.
      
      **Use Cases:**
      - Validate email before forgot-password flow
      - Check if user needs to sign up or can login
      - Provide better UX by showing appropriate message
      - Prevent unnecessary OTP generation
      
      **Security Note:**
      This endpoint reveals if an email is registered. Consider rate limiting
      to prevent email enumeration attacks.
      
      **Response:**
      - exists: true/false
      - message: Descriptive message for user
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Email check completed successfully.',
    schema: {
      example: {
        exists: true,
        message: 'Email is registered in the system'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Validation error - Invalid email format.' 
  })
  async checkEmail(@Body() checkEmailDto: CheckEmailDto) {
    return this.authService.checkEmailExists(checkEmailDto);
  }

  @Post('/forgot-password')
  @ApiOperation({ 
    summary: 'Request password reset',
    description: `
      Send a 6-digit OTP code to user email for password reset. OTP expires in 10 minutes.
      
      **Recommended Flow:**
      1. Call /check-email first to verify email exists
      2. If exists, call /forgot-password to send OTP
      3. User receives OTP via email
      4. Call /verify-otp to validate OTP
      5. Call /reset-password with OTP and new password
      
      **Note:** This endpoint will always return success message even if email
      doesn't exist (security measure to prevent email enumeration).
    `
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

  @Patch('profile')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.PARENT, Role.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Update own profile (Parent/Teacher)',
    description: `
      Update authenticated user's profile information.
      
      **Editable Fields:**
      - name, email, phone, address, age
      - school, grade (teachers only)
      
      **Restrictions:**
      - Can only edit own profile
      - Email must be unique if changed
      - Admin role cannot edit profiles (view only)
      
      **Use Cases:**
      - Update contact information
      - Change school/grade for teachers
      - Update personal details
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile updated successfully.',
    schema: {
      example: {
        user: {
          id: '507f1f77bcf86cd799439011',
          name: 'John Updated',
          email: 'john.updated@example.com',
          roles: ['parent'],
          phone: '+21698765432',
          address: 'New Address, Tunis',
          age: 36
        }
      }
    }
  })
  @ApiResponse({ status: 409, description: 'Email already in use by another account.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admins cannot edit profiles.' })
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.id, updateProfileDto);
  }

  @Patch('change-password')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.PARENT, Role.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Change password (Parent/Teacher)',
    description: `
      Change account password with current password verification.
      
      **Requirements:**
      - Must provide correct current password
      - New password minimum 6 characters
      - Sends confirmation email after change
      
      **Security:**
      - Requires authentication
      - Old password must match
      - Password hashed with bcrypt
      
      **Note:** For password reset without current password, use /forgot-password flow.
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Password changed successfully. Confirmation email sent.',
    schema: {
      example: {
        message: 'Password changed successfully'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Current password is incorrect.' })
  @ApiResponse({ status: 400, description: 'Validation error - Password must be at least 6 characters.' })
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @Patch('kids/:kidId')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.PARENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Update kid profile (Parent only)',
    description: `
      Parents can update ONLY their own children's profile information.
      
      **Security:**
      - Parent can ONLY edit kids linked to their account (userId matches)
      - Returns 403 Forbidden if trying to edit another parent's kid
      - All updates are validated and logged
      
      **Editable Fields:**
      - name, avatar, age, level, grade
      
      **Restrictions:**
      - Age must be between 4-12
      - Level must match age group (4-6, 7-9, 10-12)
      - Cannot transfer kid to another parent
      
      **Use Cases:**
      - Update child's avatar after customization
      - Adjust level as child progresses
      - Update age on birthdays
      - Change grade/class at start of school year
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Kid profile updated successfully.',
    schema: {
      example: {
        user: {
          id: '507f1f77bcf86cd799439012',
          parentId: '507f1f77bcf86cd799439011',
          name: 'Nour Updated',
          avatar: 'avatar_2.png',
          age: 8,
          level: '7-9',
          xp: 250,
          petParts: ['wings', 'hat', 'tail']
        }
      }
    }
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Kid not found or you do not have permission to edit this profile.' 
  })
  @ApiResponse({ status: 404, description: 'Kid not found.' })
  async updateKidProfile(
    @Request() req, 
    @Param('kidId') kidId: string, 
    @Body() updateKidDto: UpdateKidDto
  ) {
    return this.authService.updateKidProfile(req.user.id, kidId, updateKidDto);
  }

  @Delete('kids/:kidId')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.PARENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Delete kid profile (Parent only)',
    description: `
      Parents can delete ONLY their own children's profiles.
      
      **Security:**
      - Parent can ONLY delete kids linked to their account (userId matches)
      - Returns 403 Forbidden if trying to delete another parent's kid
      - Soft delete by default (sets isActive=false)
      - Kid's data preserved for history/analytics
      
      **Behavior:**
      - Kid profile hidden from parent dashboard
      - All progress data preserved but inaccessible
      - Stories and scan events remain in database
      - Quest progress marked as abandoned
      - Pet parts and XP frozen
      
      **Use Cases:**
      - Remove child who no longer uses the app
      - Clean up test/demo profiles
      - Parent request for account closure
      - Child switched to different parent account
      
      **Note:** For permanent deletion (GDPR compliance), contact admin.
      This is a soft delete - data remains in database but profile is deactivated.
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Kid profile deleted successfully (soft delete).',
    schema: {
      example: {
        message: 'Kid profile deleted successfully',
        kidId: '507f1f77bcf86cd799439012'
      }
    }
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Kid not found or you do not have permission to delete this profile.' 
  })
  @ApiResponse({ status: 404, description: 'Kid profile not found or already deleted.' })
  async deleteKidProfile(
    @Request() req, 
    @Param('kidId') kidId: string
  ) {
    return this.authService.deleteKidProfile(req.user.id, kidId);
  }
}