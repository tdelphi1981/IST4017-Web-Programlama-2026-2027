import type { Koltuk as KoltukTipi } from '../tipler.ts';
import { Koltuk } from './Koltuk.tsx';

// BEGIN props_koltuk_plani
interface KoltukPlaniProps {
  koltuklar: KoltukTipi[];
}
// END props_koltuk_plani

// BEGIN koltuk_plani_render
// Boş dizi için üçlü operatörle mesaj; aksi halde map+key ile Koltuk
// ızgarası üretilir.
export function KoltukPlani({ koltuklar }: KoltukPlaniProps) {
  return koltuklar.length === 0 ? (
    <p>Bu etkinlik için koltuk tanımlı değil.</p>
  ) : (
    <div className="koltuk-plani">
      {koltuklar.map((koltuk) => (
        <Koltuk key={koltuk.id} koltuk={koltuk} />
      ))}
    </div>
  );
}
// END koltuk_plani_render
