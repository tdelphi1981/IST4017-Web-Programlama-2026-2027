import './style.css';
import { etkinlikler, koltuklar } from './veri.ts';
import { etkinlikListesiUret } from './etkinlikListesi.ts';
import { koltukPlaniUret } from './koltukPlani.ts';
import { secimOzetiGuncelle } from './secimOzeti.ts';
import { biletFormBaglan } from './biletForm.ts';

// BEGIN main_giris
// Tüm modülleri içe aktarıp sayfayı ilk kez oluşturan giriş noktası.
const etkinlikListesiElemani = document.querySelector<HTMLDivElement>('#etkinlik-listesi')!;
const koltukPlaniElemani = document.querySelector<HTMLDivElement>('#koltuk-plani')!;
const secimOzetiElemani = document.querySelector<HTMLParagraphElement>('#secim-ozeti')!;
const biletFormuElemani = document.querySelector<HTMLFormElement>('#bilet-formu')!;
const adSoyadElemani = document.querySelector<HTMLInputElement>('#ad-soyad')!;

// Koltuk planı, index 0'daki etkinliğin biletFiyati'nı kullanır (Bahar
// Konseri) — koltuklar dizisindeki tüm koltuklar bu etkinliğe aittir.
const seciliEtkinlik = etkinlikler.find((e) => e.id === koltuklar[0].etkinlikId)!;

function ozetiYenile(): void {
  secimOzetiGuncelle(secimOzetiElemani, koltuklar, seciliEtkinlik.biletFiyati);
}

etkinlikListesiUret(etkinlikListesiElemani, etkinlikler);
koltukPlaniUret(koltukPlaniElemani, koltuklar, ozetiYenile);
biletFormBaglan(biletFormuElemani, adSoyadElemani, koltuklar);

ozetiYenile();
// END main_giris
