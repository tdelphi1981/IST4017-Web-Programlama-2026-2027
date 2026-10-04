import type { Etkinlik, Koltuk } from './tipler.ts';

// BEGIN veri_etkinlikler
export const etkinlikler: Etkinlik[] = [
  // BEGIN veri_etkinlikler_ilk_iki
  {
    id: 1,
    baslik: 'Bahar Konseri',
    tarih: '2026-05-15',
    mekan: 'Açık Hava Amfisi',
    kapasite: 500,
    biletFiyati: 150,
  },
  {
    id: 2,
    baslik: 'Kariyer Günleri',
    tarih: '2026-05-22',
    mekan: 'Kongre Merkezi',
    kapasite: 800,
    biletFiyati: 0,
  },
  // END veri_etkinlikler_ilk_iki
  {
    id: 3,
    baslik: 'Tiyatro Gecesi',
    tarih: '2026-05-29',
    mekan: 'Kültür Merkezi',
    kapasite: 250,
    biletFiyati: 200,
  },
];
// END veri_etkinlikler

// BEGIN veri_koltuklar
// Bahar Konseri (id: 1) için 3 sıra x 4 koltuklu örnek ızgara; B2 ve C4
// önceden "dolu" olarak işaretlenmiştir (tıklanamaz).
export const koltuklar: Koltuk[] = [
  { id: 1, etkinlikId: 1, sira: 1, koltukNo: 1, durum: 'bos' },
  { id: 2, etkinlikId: 1, sira: 1, koltukNo: 2, durum: 'bos' },
  { id: 3, etkinlikId: 1, sira: 1, koltukNo: 3, durum: 'bos' },
  { id: 4, etkinlikId: 1, sira: 1, koltukNo: 4, durum: 'bos' },
  { id: 5, etkinlikId: 1, sira: 2, koltukNo: 1, durum: 'bos' },
  { id: 6, etkinlikId: 1, sira: 2, koltukNo: 2, durum: 'dolu' },
  { id: 7, etkinlikId: 1, sira: 2, koltukNo: 3, durum: 'bos' },
  { id: 8, etkinlikId: 1, sira: 2, koltukNo: 4, durum: 'bos' },
  { id: 9, etkinlikId: 1, sira: 3, koltukNo: 1, durum: 'bos' },
  { id: 10, etkinlikId: 1, sira: 3, koltukNo: 2, durum: 'bos' },
  { id: 11, etkinlikId: 1, sira: 3, koltukNo: 3, durum: 'bos' },
  { id: 12, etkinlikId: 1, sira: 3, koltukNo: 4, durum: 'dolu' },
];
// END veri_koltuklar
