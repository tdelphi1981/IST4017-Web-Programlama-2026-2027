import type { Etkinlik } from '../tipler.ts';
import { EtkinlikKarti } from './EtkinlikKarti.tsx';

// BEGIN props_etkinlik_listesi
interface EtkinlikListesiProps {
  etkinlikler: Etkinlik[];
}
// END props_etkinlik_listesi

export function EtkinlikListesi({ etkinlikler }: EtkinlikListesiProps) {
  // BEGIN liste_bos_kontrolu
  // Erken dönüş: boş dizi özel bir durumdur, geri kalan JSX'ten önce
  // ayrı ele alınır.
  if (etkinlikler.length === 0) {
    return <p>Henüz etkinlik yok.</p>;
  }
  // END liste_bos_kontrolu

  // BEGIN liste_map_key
  // map ile diziden bileşen listesi üretme; her karta veriden gelen
  // kararlı bir key (etkinlik.id) verilir.
  return (
    <div className="etkinlik-listesi">
      {etkinlikler.map((etkinlik) => (
        <EtkinlikKarti key={etkinlik.id} etkinlik={etkinlik} />
      ))}
    </div>
  );
  // END liste_map_key
}
