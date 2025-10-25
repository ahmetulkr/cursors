import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, wordId, isCorrect, userAnswer } = body;

    if (!userId || typeof wordId !== 'number' || typeof isCorrect !== 'boolean') {
      return NextResponse.json(
        { error: 'Geçersiz veri formatı.' },
        { status: 400 }
      );
    }

    // Progress kaydet
    const progress = await prisma.cardProgress.create({
      data: {
        userId: parseInt(userId),
        wordId,
        isCorrect,
        userAnswer: userAnswer || null,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Progress kaydedilirken hata:', error);
    return NextResponse.json(
      { error: 'Progress kaydedilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId gerekli' },
        { status: 400 }
      );
    }

    // Kullanıcıya ait istatistikleri getir
    const totalCorrect = await prisma.cardProgress.count({
      where: { 
        userId: parseInt(userId),
        isCorrect: true 
      },
    });
    
    const totalIncorrect = await prisma.cardProgress.count({
      where: { 
        userId: parseInt(userId),
        isCorrect: false 
      },
    });

    return NextResponse.json({
      correct: totalCorrect,
      incorrect: totalIncorrect,
      total: totalCorrect + totalIncorrect,
    });
  } catch (error) {
    console.error('İstatistikler getirilirken hata:', error);
    return NextResponse.json(
      { error: 'İstatistikler getirilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

