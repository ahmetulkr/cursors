import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ level: string }> }
) {
  try {
    const { level } = await params;
    
    // Seviye kontrolü
    if (!['A1', 'A2', 'B1'].includes(level.toUpperCase())) {
      return NextResponse.json(
        { error: 'Geçersiz seviye. A1, A2 veya B1 olmalı.' },
        { status: 400 }
      );
    }

    // Kelimeleri getir
    const words = await prisma.word.findMany({
      where: {
        level: level.toUpperCase(),
      },
      orderBy: {
        id: 'asc',
      },
    });

    return NextResponse.json(words);
  } catch (error) {
    console.error('Kelimeler getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Kelimeler getirilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

