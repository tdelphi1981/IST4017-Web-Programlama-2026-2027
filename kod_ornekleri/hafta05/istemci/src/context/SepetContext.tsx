import { createContext, useState, type ReactNode } from 'react';
import type { Koltuk } from '../tipler.ts';

// BEGIN sepet_baglam_tipi
// Sepetin dışa açtığı veri ve işlevler: seçili koltuklar, toplam tutar,
// bir koltuğu sepete ekleyip çıkaran ve sepeti boşaltan iki fonksiyon.
export interface SepetBaglami {
  secilenKoltuklar: Koltuk[];
  toplamTutar: number;
  koltukSec: (koltuk: Koltuk) => void;
  sepetiTemizle: () => void;
}
// END sepet_baglam_tipi

// BEGIN sepet_context_olustur
// Başlangıç değeri null: bir bileşen SepetProvider'ın DIŞINDA
// useContext çağırırsa bunu ayırt edebilmek için (bkz. hooks/useSepet.ts).
export const SepetContext = createContext<SepetBaglami | null>(null);
// END sepet_context_olustur

interface SepetProviderProps {
  biletFiyati: number;
  children: ReactNode;
}

// BEGIN sepet_provider
// Seçili koltukları tek bir useState ile tutar; koltukSec aynı koltuk
// zaten sepetteyse çıkarır, değilse ekler (değişmezlik ilkesiyle her
// zaman YENİ bir dizi üretir). toplamTutar her render'da
// secilenKoltuklar'dan yeniden hesaplanır, ayrıca saklanmaz.
// BEGIN sepet_provider_state
export function SepetProvider({ biletFiyati, children }: SepetProviderProps) {
  const [secilenKoltuklar, setSecilenKoltuklar] = useState<Koltuk[]>([]);

  function koltukSec(koltuk: Koltuk) {
    setSecilenKoltuklar((onceki) =>
      onceki.some((k) => k.id === koltuk.id)
        ? onceki.filter((k) => k.id !== koltuk.id)
        : [...onceki, koltuk],
    );
  }
  // END sepet_provider_state

  // BEGIN sepet_provider_deger
  function sepetiTemizle() {
    setSecilenKoltuklar([]);
  }

  const deger: SepetBaglami = {
    secilenKoltuklar,
    toplamTutar: secilenKoltuklar.length * biletFiyati,
    koltukSec,
    sepetiTemizle,
  };

  return <SepetContext.Provider value={deger}>{children}</SepetContext.Provider>;
}
// END sepet_provider_deger
// END sepet_provider

// BEGIN sepet_reducer_alternatifi
// OPSİYONEL alternatif: useReducer, birden çok İLİŞKİLİ eylemi (EKLE/
// ÇIKAR/TEMİZLE) tek bir fonksiyonda toplar. Burada yalnızca dışa
// aktarılır — SepetProvider'a BAĞLANMAZ; bu haftanın ÇALIŞAN sepet
// mantığı sadelik için yukarıdaki useState'i kullanmaya devam eder.
export type SepetEylemi =
  | { tur: 'EKLE'; koltuk: Koltuk }
  | { tur: 'CIKAR'; koltuk: Koltuk }
  | { tur: 'TEMIZLE' };

export function sepetReducer(durum: Koltuk[], eylem: SepetEylemi): Koltuk[] {
  switch (eylem.tur) {
    case 'EKLE':
      return [...durum, eylem.koltuk];
    case 'CIKAR':
      return durum.filter((k) => k.id !== eylem.koltuk.id);
    case 'TEMIZLE':
      return [];
  }
}
// END sepet_reducer_alternatifi
