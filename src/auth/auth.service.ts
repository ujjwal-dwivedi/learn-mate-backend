import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { db, users, User } from '../database';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { eq } from 'drizzle-orm';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ access_token: string; user: Omit<User, 'password'> }> {
    const { email, password, firstName, lastName } = registerDto;

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [newUser] = await db.insert(users).values({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    }).returning();

    // Generate JWT token
    const payload = { 
      email: newUser.email, 
      sub: newUser.id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
    };
    const access_token = this.jwtService.sign(payload);

    // Return user without password
    const { password: _, ...userResponse } = newUser;
    return {
      access_token,
      user: userResponse,
    };
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string; user: Omit<User, 'password'> }> {
    const { email, password } = loginDto;

    // Find user by email
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { 
      email: user.email, 
      sub: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    const access_token = this.jwtService.sign(payload);

    // Return user without password
    const { password: _, ...userResponse } = user;
    return {
      access_token,
      user: userResponse,
    };
  }

  async validateUser(userId: string): Promise<Omit<User, 'password'> | null> {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      return null;
    }
    
    const { password: _, ...userResponse } = user;
    return userResponse;
  }
}
