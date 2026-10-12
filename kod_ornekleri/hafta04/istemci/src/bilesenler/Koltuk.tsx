import { useState } from 'react';
import type { Koltuk as KoltukTipi, KoltukDurumu } from '../tipler.ts';

// BEGIN props_koltuk
interface KoltukProps {
  koltuk: KoltukTipi;
}
// END props_koltuk

const SIRA_HARFLERI = ['A', 'B', 'C', 'D', 'E'];

function koltukEtiketi(koltuk: KoltukTipi): string {
  return `${SIRA_HARFLERI[koltuk.sira - 1]}${koltuk.koltukNo}`;
}

export function Koltuk({ koltuk }: KoltukProps) {
  // BEGIN koltuk_state_ve_tiklama
  // Koltuğun kendi durumu, koltuk.durum başlangıç değeriyle yerel bir
  // useState'te tutulur; App ya da KoltukPlani bu değeri GÖRMEZ.
  const [durum, setDurum] = useState<KoltukDurumu>(koltuk.durum);

  function tikla() {
    if (durum === 'dolu') return;
    setDurum((onceki) => (onceki === 'bos' ? 'secili' : 'bos'));
  }
  // END koltuk_state_ve_tiklama

  // BEGIN koltuk_render
  return (
    <button
      type="button"
      className={`koltuk ${durum}`}
      onClick={tikla}
      disabled={durum === 'dolu'}
      aria-disabled={durum === 'dolu'}
    >
      {koltukEtiketi(koltuk)}
      {durum === 'dolu' && <span className="koltuk-rozet">Dolu</span>}
    </button>
  );
  // END koltuk_render
}
