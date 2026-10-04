import type { Koltuk } from './tipler.ts';

// BEGIN secim_ozeti_guncelle
// Seçili koltuk sayısını ve toplam tutarı (biletFiyati x sayı) hesaplayıp
// ilgili DOM öğesini günceller.
export function secimOzetiGuncelle(
  eleman: HTMLElement,
  koltuklar: Koltuk[],
  biletFiyati: number
): number {
  const seciliSayisi = koltuklar.filter((k) => k.durum === 'secili').length;
  const toplamTutar = seciliSayisi * biletFiyati;

  eleman.textContent = `Seçili koltuk: ${seciliSayisi}, Toplam: ${toplamTutar} TL`;

  return seciliSayisi;
}
// END secim_ozeti_guncelle
