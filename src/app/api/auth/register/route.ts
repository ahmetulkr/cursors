import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Kullanıcı adı ve şifre gerekli' },
        { status: 400 }
      );
    }

    // Kullanıcı var mı kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu kullanıcı adı zaten kullanılıyor' },
        { status: 400 }
      );
    }

    // Yeni kullanıcı oluştur (şifre hash'lenmeli ama basitlik için düz saklıyoruz)
    const user = await prisma.user.create({
      data: {
        username,
        password, // Production'da bcrypt kullanın!
      },
    });

    return NextResponse.json({
      id: user.id,
      username: user.username,
    });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    return NextResponse.json(
      { error: 'Kayıt işlemi başarısız' },
      { status: 500 }
    );
  }
}

