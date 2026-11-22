// BEGIN tip_etkinlik
export interface Etkinlik {
  id: number;
  baslik: string;
  tarih: string; // ISO 8601 tarih dizesi, ör. "2026-11-14"
  mekan: string;
  kapasite: number;
  biletFiyati: number; // TL cinsinden birim koltuk fiyatı
}
// END tip_etkinlik

// BEGIN tip_kullanici
export interface Kullanici {
  id: number;
  kullaniciAdi: string;
  eposta: string;
  rol: 'musteri' | 'yonetici';
}
// END tip_kullanici

// BEGIN tip_koltuk
export type KoltukDurumu = 'bos' | 'secili' | 'dolu';

export interface Koltuk {
  readonly id: number;
  readonly etkinlikId: number;
  sira: number;
  koltukNo: number;
  durum: KoltukDurumu;
}
// END tip_koltuk

// BEGIN tip_bilet
export type BiletDurumu = 'olusturuldu' | 'iptal';

export interface Bilet {
  readonly id: number;
  readonly koltukId: number;
  readonly kullaniciId: number; // Hf.10: gerçek bir Kullanici'ye bağlanır
  satinAlmaZamani: string; // ISO 8601 zaman damgası
  durum: BiletDurumu;
}
// END tip_bilet

// BEGIN tip_liste_generic
// YG I'in kendi Liste<T> şablon sınıfıyla doğrudan kıyas: bu arayüz de
// hangi tip için çalışacağını KULLANIM ANINDA (Liste<Etkinlik>,
// Liste<Koltuk> gibi) belirleyen bir kalıptır.
export interface Liste<T> {
  elemanlar: T[];
  ekle(eleman: T): void;
  bul(id: number): T | undefined;
}
// END tip_liste_generic
