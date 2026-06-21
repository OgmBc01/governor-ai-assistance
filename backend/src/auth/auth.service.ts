import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly adminCredentials = {
    email: process.env.ADMIN_EMAIL || 'admin@bauchi.gov.ng',
    passwordHash: process.env.ADMIN_PASSWORD_HASH || '$2b$10$YourHashedPasswordHere',
  };

  constructor(private readonly jwtService: JwtService) {}

  async validateAdmin(email: string, password: string): Promise<any> {
    if (email !== this.adminCredentials.email) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // In production, get from database
    // For now, check against environment variable
    try {
      const isValid = await bcrypt.compare(password, this.adminCredentials.passwordHash);
      if (!isValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
    } catch {
      throw new UnauthorizedException('Invalid credentials');
    }

    return { email, role: 'admin' };
  }

  async login(email: string, password: string): Promise<{ access_token: string }> {
    try {
      const user = await this.validateAdmin(email, password);
      const payload = { email: user.email, sub: user.email, role: user.role };
      return {
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}