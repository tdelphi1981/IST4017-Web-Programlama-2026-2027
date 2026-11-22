import { useVeri } from '../hooks/useVeri.ts';
import { etkinlikleriGetir } from '../api/etkinlikler.ts';
import type { Etkinlik } from '../tipler.ts';
import { Yukleniyor } from '../bilesenler/Yukleniyor.tsx';
import { HataMesaji } from '../bilesenler/HataMesaji.tsx';
import { EtkinlikListesi } from '../bilesenler/EtkinlikListesi.tsx';

// BEGIN etkinlikler_sayfasi
// '/' rotası — useVeri<Etkinlik[]> ile Hf.6'nın GET /etkinlikler'ini
// çeker; üç durumdan hangisindeyse (yukleniyor/hata/basarili) ona göre
// render eder. Boş liste durumu EtkinlikListesi'nin KENDİ İÇİNDE (Hf.4'ten
// aynen) ele alınır ("Henüz etkinlik yok.").
export function EtkinliklerSayfasi() {
  const durum = useVeri<Etkinlik[]>(
    (signal) => etkinlikleriGetir(undefined, signal),
    [],
  );

  if (durum.tur === 'yukleniyor') {
    return <Yukleniyor />;
  }
  if (durum.tur === 'hata') {
    return <HataMesaji mesaj={durum.mesaj} />;
  }

  return (
    <section className="bolum">
      <h2>Etkinlikler</h2>
      <EtkinlikListesi etkinlikler={durum.veri} />
    </section>
  );
}
// END etkinlikler_sayfasi
