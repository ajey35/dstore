import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { serializeData } from '@/lib/file-service';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  return NextResponse.json(
    serializeData({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
        quotaBytes: user.quotaBytesNumber,
        createdAt: user.createdAt,
      },
    })
  );
}
