import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Validate SMTP configuration
    const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
    const missingVars = requiredEnvVars.filter(varName => !this.configService.get(varName));
    
    if (missingVars.length > 0) {
      console.warn(`⚠️ Missing SMTP configuration: ${missingVars.join(', ')}`);
    }

    // Configuration du transporteur email
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: false, // true pour 465, false pour les autres ports
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  /**
   * Envoyer l'OTP par email
   */
  async sendOtpEmail(email: string, otp: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('SMTP_FROM') || 'noreply@yourapp.com',
      to: email,
      subject: 'Password Reset OTP - DAM User Management',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #4CAF50;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 5px 5px;
            }
            .otp-code {
              font-size: 32px;
              font-weight: bold;
              color: #4CAF50;
              text-align: center;
              padding: 20px;
              background-color: #f0f0f0;
              border-radius: 5px;
              letter-spacing: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #777;
            }
            .warning {
              color: #ff6b6b;
              font-size: 14px;
              margin-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>You have requested to reset your password. Use the OTP code below to complete the process:</p>
              
              <div class="otp-code">${otp}</div>
              
              <p><strong>This code is valid for 10 minutes.</strong></p>
              
              <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
              
              <div class="warning">
                ⚠️ Never share this code with anyone. Our team will never ask for your OTP.
              </div>
            </div>
            <div class="footer">
              <p>&copy; 2024 DAM User Management. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Request
        
        Your OTP code is: ${otp}
        
        This code is valid for 10 minutes.
        
        If you didn't request this, please ignore this email.
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ OTP email sent successfully to ${email}`);
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw new Error('Failed to send OTP email');
    }
  }

  /**
   * Envoyer email de confirmation d'inscription
   */
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('SMTP_FROM') || 'noreply@yourapp.com',
      to: email,
      subject: 'Welcome to DAM User Management!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #4CAF50;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 5px 5px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to DAM!</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Welcome to DAM User Management! Your account has been successfully created.</p>
              <p>You can now log in and start using our services.</p>
              <p>If you have any questions, feel free to contact our support team.</p>
              <p>Best regards,<br>The DAM Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Welcome email sent to ${email}`);
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
    }
  }

  /**
   * Envoyer email de confirmation de changement de mot de passe
   */
  async sendPasswordChangedEmail(email: string, name: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('SMTP_FROM') || 'noreply@yourapp.com',
      to: email,
      subject: 'Password Changed Successfully',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #4CAF50;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 5px 5px;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Changed</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Your password has been successfully changed.</p>
              <div class="warning">
                <strong>⚠️ Security Alert:</strong> If you didn't make this change, please contact our support team immediately.
              </div>
              <p>Best regards,<br>The DAM Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Password changed email sent to ${email}`);
    } catch (error) {
      console.error('❌ Error sending password changed email:', error);
    }
  }
}