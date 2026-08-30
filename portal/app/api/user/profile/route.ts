import { NextResponse } from 'next/server';
import { getCurrentUser, hashPassword, verifyPassword } from '@/lib/auth';
import { db } from '@/lib/db';
import { updateProfileSchema, changePasswordSchema } from '@/lib/validations';
import { serializeData } from '@/lib/file-service';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const fileCount = await db.fileRecord.count({ where: { userId: user.id } });
  const downloadCount = await db.downloadEvent.count({ where: { userId: user.id } });

  return NextResponse.json(
    serializeData({
      user,
      stats: {
        fileCount,
        downloadCount,
      },
    })
  );
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (body.type === 'PASSWORD_CHANGE') {
      const result = changePasswordSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json({ error: 'Invalid password input' }, { status: 400 });
      }

      const fullUser = await db.user.findUnique({ where: { id: user.id } });
      if (!fullUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      const isValid = await verifyPassword(result.data.currentPassword, fullUser.passwordHash);
      if (!isValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      const newHash = await hashPassword(result.data.newPassword);
      await db.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });

      return NextResponse.json({ success: true, message: 'Password updated successfully' });
    }

    // Default: Profile update (name, avatar)
    const result = updateProfileSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid profile data' }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        ...(result.data.name && { name: result.data.name }),
        ...(result.data.avatarUrl !== undefined && { avatarUrl: result.data.avatarUrl }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
      },
    });

    return NextResponse.json(serializeData({ success: true, user: updatedUser }));
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
