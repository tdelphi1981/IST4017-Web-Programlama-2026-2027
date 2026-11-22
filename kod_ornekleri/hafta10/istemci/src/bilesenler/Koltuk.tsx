import type { Koltuk as KoltukTipi } from '../tipler.ts';
import { useSepet } from '../hooks/useSepet.ts';

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
  // BEGIN koltuk_context_ve_tiklama
  // Koltuğun seçili olup olmadığı artık kendi yerel state'inde değil,
  // ortak SepetContext'teki secilenKoltuklar dizisinde tutulur; App/
  // KoltukPlani'nın haberi olmadan bu bileşen doğrudan Context'ten okur.
  // Tıklama koltukSec'i çağırıp koltuğu sepete ekler/çıkarır; dolu bir
  // koltuk (veri.ts'ten gelen kalıcı durum) hiç tıklanamaz.
  const { secilenKoltuklar, koltukSec } = useSepet();
  const seciliMi = secilenKoltuklar.some((k) => k.id === koltuk.id);
  const durum = koltuk.durum === 'dolu' ? 'dolu' : seciliMi ? 'secili' : 'bos';

  function tikla() {
    if (koltuk.durum === 'dolu') return;
    koltukSec(koltuk);
  }
  // END koltuk_context_ve_tiklama

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
