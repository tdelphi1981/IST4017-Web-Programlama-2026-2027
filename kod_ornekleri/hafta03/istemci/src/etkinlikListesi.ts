import type { Etkinlik } from './tipler.ts';

// BEGIN etkinlik_listesi_uret
// etkinlikler dizisinden DOM ile kart listesi üretir; HTML'e elle
// kart yazmak yerine, her etkinlik için createElement ile bir
// article.etkinlik-karti oluşturup kapsayıcıya ekler (forEach).
// BEGIN etkinlik_listesi_uret_disi
export function etkinlikListesiUret(
  kapsayici: HTMLElement,
  etkinlikler: Etkinlik[]
): void {
  kapsayici.innerHTML = '';

  etkinlikler.forEach((etkinlik) => {
  // END etkinlik_listesi_uret_disi
    // BEGIN etkinlik_karti_olustur
    const kart = document.createElement('article');
    kart.className = 'etkinlik-karti';

    const baslik = document.createElement('h3');
    baslik.textContent = etkinlik.baslik;

    const bilgi = document.createElement('p');
    bilgi.textContent = `${etkinlik.tarih} · ${etkinlik.mekan}`;

    const kapasite = document.createElement('p');
    kapasite.textContent = `Kapasite: ${etkinlik.kapasite} · Bilet: ${etkinlik.biletFiyati} TL`;

    kart.append(baslik, bilgi, kapasite);
    kapsayici.appendChild(kart);
    // END etkinlik_karti_olustur
  });
}
// END etkinlik_listesi_uret
