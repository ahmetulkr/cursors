import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wordId, isCorrect } = body;

    if (typeof wordId !== 'number' || typeof isCorrect !== 'boolean') {
      return NextResponse.json(
        { error: 'Geçersiz veri formatı.' },
        { status: 400 }
      );
    }

    // Progress kaydet
    const progress = await prisma.cardProgress.create({
      data: {
        wordId,
        isCorrect,
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

export async function GET() {
  try {
    // Toplam istatistikleri getir
    const totalCorrect = await prisma.cardProgress.count({
      where: { isCorrect: true },
    });
    
    const totalIncorrect = await prisma.cardProgress.count({
      where: { isCorrect: false },
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

