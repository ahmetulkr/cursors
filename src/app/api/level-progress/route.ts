import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Kullanıcının seviye ilerlemesini al
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Kullanıcı ID gerekli' },
        { status: 400 }
      );
    }

    const progress = await prisma.levelProgress.findMany({
      where: { userId: parseInt(userId) },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error('İlerleme getirme hatası:', error);
    return NextResponse.json(
      { error: 'İlerleme bilgisi alınamadı' },
      { status: 500 }
    );
  }
}

// Seviye tamamlandığında kaydet
export async function POST(request: NextRequest) {
  try {
    const { userId, level, score, completed } = await request.json();

    if (!userId || !level) {
      return NextResponse.json(
        { error: 'Kullanıcı ID ve seviye gerekli' },
        { status: 400 }
      );
    }

    const progress = await prisma.levelProgress.upsert({
      where: {
        userId_level: {
          userId: parseInt(userId),
          level,
        },
      },
      update: {
        score: score || 0,
        completed: completed || false,
        completedAt: completed ? new Date() : null,
      },
      create: {
        userId: parseInt(userId),
        level,
        score: score || 0,
        completed: completed || false,
        completedAt: completed ? new Date() : null,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error('İlerleme kaydetme hatası:', error);
    return NextResponse.json(
      { error: 'İlerleme kaydedilemedi' },
      { status: 500 }
    );
  }
}

