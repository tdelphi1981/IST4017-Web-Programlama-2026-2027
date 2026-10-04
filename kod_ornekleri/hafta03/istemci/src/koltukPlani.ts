import type { Koltuk } from './tipler.ts';

const SIRA_HARFLERI = ['A', 'B', 'C', 'D', 'E'];

function koltukEtiketi(koltuk: Koltuk): string {
  return `${SIRA_HARFLERI[koltuk.sira - 1]}${koltuk.koltukNo}`;
}

// BEGIN koltuk_tiklama
// Bir koltuğa tıklandığında durum geçişini uygular: bos -> secili ya da
// secili -> bos. dolu koltuklar tıklanamaz (hiçbir şey yapılmaz).
function koltukTiklamaIsleyici(
  koltuk: Koltuk,
  eleman: HTMLDivElement,
  degisiklikOldu: () => void
): void {
  if (koltuk.durum === 'dolu') {
    return;
  }

  koltuk.durum = koltuk.durum === 'bos' ? 'secili' : 'bos';
  eleman.classList.toggle('secili', koltuk.durum === 'secili');
  degisiklikOldu();
}
// END koltuk_tiklama

// BEGIN koltuk_plani_uret
// koltuklar dizisinden koltuk ızgarasını DOM ile üretir; her koltuğa
// bir click dinleyicisi ekler.
// BEGIN koltuk_plani_uret_disi
export function koltukPlaniUret(
  kapsayici: HTMLElement,
  koltuklar: Koltuk[],
  degisiklikOldu: () => void
): void {
  kapsayici.innerHTML = '';

  koltuklar.forEach((koltuk) => {
  // END koltuk_plani_uret_disi
    // BEGIN koltuk_eleman_olustur
    const eleman = document.createElement('div');
    eleman.className = 'koltuk';
    eleman.textContent = koltukEtiketi(koltuk);

    if (koltuk.durum === 'dolu') {
      eleman.classList.add('dolu');
    }

    eleman.addEventListener('click', () => {
      koltukTiklamaIsleyici(koltuk, eleman, degisiklikOldu);
    });

    kapsayici.appendChild(eleman);
    // END koltuk_eleman_olustur
  });
}
// END koltuk_plani_uret
