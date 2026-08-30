import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, signToken, setSessionCookie } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input fields', details: result.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await setSessionCookie(token);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration' },
      { status: 500 }
    );
  }
}
