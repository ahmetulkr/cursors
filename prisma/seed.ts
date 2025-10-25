import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const wordsData = [
  // A1 Level
  { turkish: 'Merhaba', english: 'Hello', level: 'A1' },
  { turkish: 'Teşekkürler', english: 'Thank you', level: 'A1' },
  { turkish: 'Evet', english: 'Yes', level: 'A1' },
  { turkish: 'Hayır', english: 'No', level: 'A1' },
  { turkish: 'Lütfen', english: 'Please', level: 'A1' },
  { turkish: 'Günaydın', english: 'Good morning', level: 'A1' },
  { turkish: 'İyi akşamlar', english: 'Good evening', level: 'A1' },
  { turkish: 'Su', english: 'Water', level: 'A1' },
  { turkish: 'Yemek', english: 'Food', level: 'A1' },
  { turkish: 'Ev', english: 'House', level: 'A1' },
  { turkish: 'Araba', english: 'Car', level: 'A1' },
  { turkish: 'Kitap', english: 'Book', level: 'A1' },
  { turkish: 'Okul', english: 'School', level: 'A1' },
  { turkish: 'Aile', english: 'Family', level: 'A1' },
  { turkish: 'Arkadaş', english: 'Friend', level: 'A1' },
  
  // A2 Level
  { turkish: 'Düşünmek', english: 'To think', level: 'A2' },
  { turkish: 'Anlamak', english: 'To understand', level: 'A2' },
  { turkish: 'Öğrenmek', english: 'To learn', level: 'A2' },
  { turkish: 'Çalışmak', english: 'To work', level: 'A2' },
  { turkish: 'Yazmak', english: 'To write', level: 'A2' },
  { turkish: 'Konuşmak', english: 'To speak', level: 'A2' },
  { turkish: 'Dinlemek', english: 'To listen', level: 'A2' },
  { turkish: 'Görmek', english: 'To see', level: 'A2' },
  { turkish: 'Bilmek', english: 'To know', level: 'A2' },
  { turkish: 'Sevmek', english: 'To love', level: 'A2' },
  { turkish: 'İstemek', english: 'To want', level: 'A2' },
  { turkish: 'Gelmek', english: 'To come', level: 'A2' },
  { turkish: 'Gitmek', english: 'To go', level: 'A2' },
  { turkish: 'Yardım', english: 'Help', level: 'A2' },
  { turkish: 'Zaman', english: 'Time', level: 'A2' },
  
  // B1 Level
  { turkish: 'Başarı', english: 'Success', level: 'B1' },
  { turkish: 'Deneyim', english: 'Experience', level: 'B1' },
  { turkish: 'Gelecek', english: 'Future', level: 'B1' },
  { turkish: 'Hatırlamak', english: 'To remember', level: 'B1' },
  { turkish: 'Unutmak', english: 'To forget', level: 'B1' },
  { turkish: 'Geliştirmek', english: 'To develop', level: 'B1' },
  { turkish: 'Değiştirmek', english: 'To change', level: 'B1' },
  { turkish: 'Açıklamak', english: 'To explain', level: 'B1' },
  { turkish: 'Karşılaştırmak', english: 'To compare', level: 'B1' },
  { turkish: 'Tartışmak', english: 'To discuss', level: 'B1' },
  { turkish: 'Karar', english: 'Decision', level: 'B1' },
  { turkish: 'Sorumluluk', english: 'Responsibility', level: 'B1' },
  { turkish: 'Önemli', english: 'Important', level: 'B1' },
  { turkish: 'Güven', english: 'Trust', level: 'B1' },
  { turkish: 'Fırsat', english: 'Opportunity', level: 'B1' },
];

async function main() {
  console.log('Veritabanı seed işlemi başlıyor...');
  
  // Önce mevcut verileri temizle
  await prisma.cardProgress.deleteMany();
  await prisma.word.deleteMany();
  
  // Yeni verileri ekle
  for (const word of wordsData) {
    await prisma.word.create({
      data: word,
    });
  }
  
  console.log(`${wordsData.length} kelime başarıyla eklendi!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

