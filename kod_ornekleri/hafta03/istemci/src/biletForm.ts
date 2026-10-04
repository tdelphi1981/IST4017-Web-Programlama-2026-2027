import type { Bilet, Koltuk } from './tipler.ts';

interface SecimOzeti {
  kullaniciAdi: string;
  koltukIdleri: number[];
}

// BEGIN bilet_olustur_async
// setTimeout ile sarılmış bir Promise, "bilet oluşturuluyor" gecikmesini
// simüle eder; async/await ile senkron görünümlü biçimde tüketilir.
async function biletOlustur(ozet: SecimOzeti): Promise<Bilet> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Date.now(),
        koltukId: ozet.koltukIdleri[0] ?? 0,
        kullaniciAdi: ozet.kullaniciAdi,
        satinAlmaZamani: new Date().toISOString(),
        durum: 'olusturuldu',
      });
    }, 1000);
  });
}
// END bilet_olustur_async

// BEGIN form_onSubmit
// Formun submit olayında preventDefault() çağrılır (sayfa yenilenmez);
// seçim özeti konsola basılır, ardından async biletOlustur() çağrılıp
// sonucu bekleyen bir onay logu yazılır.
// BEGIN form_onSubmit_baglan
export function biletFormBaglan(
  form: HTMLFormElement,
  adSoyadGirdi: HTMLInputElement,
  koltuklar: Koltuk[]
): void {
  form.addEventListener('submit', (olay) => {
    olay.preventDefault();
  // END form_onSubmit_baglan

    // BEGIN form_onSubmit_ozet
    const seciliKoltuklar = koltuklar.filter((k) => k.durum === 'secili');
    const ozet: SecimOzeti = {
      kullaniciAdi: adSoyadGirdi.value,
      koltukIdleri: seciliKoltuklar.map((k) => k.id),
    };

    console.log('Bilet özeti:', ozet);
    // END form_onSubmit_ozet

    // BEGIN form_onSubmit_cagri
    biletOlustur(ozet).then((bilet) => {
      console.log('Bilet oluşturuldu:', bilet);
    });
    // END form_onSubmit_cagri
  });
}
// END form_onSubmit
