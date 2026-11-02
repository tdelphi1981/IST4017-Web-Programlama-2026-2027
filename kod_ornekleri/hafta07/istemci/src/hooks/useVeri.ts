import { useEffect, useState } from 'react';
import { ApiHatasi } from '../api/istemci.ts';

// BEGIN veri_durumu_tipi
// Ortak bir 'tur' alanıyla ayırt edilen, her dalın FARKLI ek alanlar
// taşıdığı bir discriminated union: durum.tur === 'basarili' kontrolünden
// SONRA durum.veri'ye erişmek güvenlidir, 'yukleniyor' dalında durum.veri
// HİÇ YOKTUR — TypeScript bunu derleme zamanında denetler.
export type VeriDurumu<T> =
  | { tur: 'yukleniyor' }
  | { tur: 'hata'; mesaj: string }
  | { tur: 'basarili'; veri: T };
// END veri_durumu_tipi

// BEGIN use_veri_hook
// cagri, AbortController'ın signal'ini ALAN ve bir Promise<T> DÖNDÜREN bir
// fonksiyondur (ör. (signal) => etkinlikleriGetir(undefined, signal)).
// bagimliliklar değiştiğinde (ör. yeni bir :id) efekt YENİDEN çalışır;
// önceki istek controller.abort() ile İPTAL edilir — bu sayede yarış
// durumunda (eski cevap yeni cevaptan GEÇ gelirse) state artık ESKİ
// veriyle GÜNCELLENMEZ.
// BEGIN use_veri_hook_istek
export function useVeri<T>(
  cagri: (signal: AbortSignal) => Promise<T>,
  bagimliliklar: unknown[],
): VeriDurumu<T> {
  const [durum, setDurum] = useState<VeriDurumu<T>>({ tur: 'yukleniyor' });

  useEffect(() => {
    const controller = new AbortController();
    setDurum({ tur: 'yukleniyor' });

    // useEffect'in kendisi async OLAMAZ (bir Promise döndüremez); bu
    // yüzden efekt içinde AYRI bir async fonksiyon tanımlanıp HEMEN
    // çağrılır.
    async function veriyiGetir() {
      try {
        const veri = await cagri(controller.signal);
        setDurum({ tur: 'basarili', veri });
        // END use_veri_hook_istek
      } catch (hata) {
        // BEGIN use_veri_hook_hata
        if (hata instanceof DOMException && hata.name === 'AbortError') {
          // İstek bilinçli olarak iptal edildi (yeni bağımlılık ya da
          // unmount) — state'i GÜNCELLEMEDEN sessizce çık.
          return;
        }
        const mesaj =
          hata instanceof ApiHatasi
            ? typeof hata.detail === 'string'
              ? hata.detail
              : hata.message
            : hata instanceof Error
              ? hata.message
              : 'Bilinmeyen bir hata oluştu.';
        setDurum({ tur: 'hata', mesaj });
        // END use_veri_hook_hata
      }
    }

    // BEGIN use_veri_hook_kapanis
    veriyiGetir();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, bagimliliklar);

  return durum;
}
// END use_veri_hook_kapanis
// END use_veri_hook
