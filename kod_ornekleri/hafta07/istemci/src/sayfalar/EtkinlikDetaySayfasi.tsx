import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import type { Bilet, Etkinlik, Koltuk as KoltukTipi } from '../tipler.ts';
import { useVeri } from '../hooks/useVeri.ts';
import { etkinlikGetir } from '../api/etkinlikler.ts';
import { koltuklariGetir, koltukGuncelle } from '../api/koltuklar.ts';
import { ApiHatasi } from '../api/istemci.ts';
import { SepetProvider } from '../context/SepetContext.tsx';
import { useSepet } from '../hooks/useSepet.ts';
import { Yukleniyor } from '../bilesenler/Yukleniyor.tsx';
import { HataMesaji } from '../bilesenler/HataMesaji.tsx';
import { KoltukPlani } from '../bilesenler/KoltukPlani.tsx';
import { SepetOzeti } from '../bilesenler/SepetOzeti.tsx';
import { GeriSayim } from '../bilesenler/GeriSayim.tsx';
import { BiletFormu } from '../bilesenler/BiletFormu.tsx';

interface EtkinlikDetayVerisi {
  etkinlik: Etkinlik;
  koltuklar: KoltukTipi[];
}

// BEGIN etkinlik_detay_veri
// '/etkinlikler/:id' rotası — useParams'tan gelen id HER ZAMAN bir string'dir
// (URL bir metindir), apiGet'e geçirilmeden önce Number(id) ile sayıya
// çevrilir. useVeri, etkinlik VE koltuk verisini TEK bir çağrıda
// (Promise.all) BİRLİKTE çeker; bagimliliklar dizisindeki etkinlikId
// SAYESİNDE /etkinlikler/3'ten /etkinlikler/7'ye HIZLICA geçildiğinde efekt
// YENİDEN çalışır, önceki istek AbortController ile İPTAL edilir (yarış
// durumu önlenir).
// BEGIN etkinlik_detay_veri_getirme
export function EtkinlikDetaySayfasi() {
  const { id } = useParams<{ id: string }>();
  const etkinlikId = Number(id);

  const durum = useVeri<EtkinlikDetayVerisi>(
    async (signal) => {
      const [etkinlik, koltuklar] = await Promise.all([
        etkinlikGetir(etkinlikId, signal),
        koltuklariGetir(etkinlikId, undefined, signal),
      ]);
      return { etkinlik, koltuklar };
    },
    [etkinlikId],
  );
  // END etkinlik_detay_veri_getirme

  // BEGIN etkinlik_detay_veri_render
  if (durum.tur === 'yukleniyor') {
    return <Yukleniyor />;
  }
  if (durum.tur === 'hata') {
    return <HataMesaji mesaj={durum.mesaj} />;
  }

  return (
    <SepetProvider biletFiyati={durum.veri.etkinlik.biletFiyati}>
      <EtkinlikDetayIcerik
        etkinlik={durum.veri.etkinlik}
        ilkKoltuklar={durum.veri.koltuklar}
      />
    </SepetProvider>
  );
}
// END etkinlik_detay_veri_render
// END etkinlik_detay_veri

interface EtkinlikDetayIcerikProps {
  etkinlik: Etkinlik;
  ilkKoltuklar: KoltukTipi[];
}

// AppIcerik (Hf.5) örneğindeki gibi: SepetProvider'ın SAĞLADIĞI Context'i
// okuyabilmek için ayrı, SepetProvider'ın İÇİNDE duran bir bileşen gerekir.
function EtkinlikDetayIcerik({ etkinlik, ilkKoltuklar }: EtkinlikDetayIcerikProps) {
  const [koltuklar, setKoltuklar] = useState<KoltukTipi[]>(ilkKoltuklar);
  const [biletler, setBiletler] = useState<Bilet[]>([]);
  const [koltukHatasi, setKoltukHatasi] = useState<string | null>(null);
  const { secilenKoltuklar, koltukSec } = useSepet();
  const izlenenIdler = useRef<Set<number>>(new Set());

  // BEGIN etkinlik_detay_koltuk_secim
  // İyimser güncelleme: Koltuk bileşeni (Hf.5'ten aynen) bir koltuğa
  // tıklandığında koltukSec() ile onu SEPETE hemen ekler — kullanıcı bunu
  // ANINDA "seçili" olarak görür, sunucu cevabı BEKLENMEZ. Bu efekt sepete
  // YENİ eklenen koltuğu izleyip sunucuya bir PATCH /koltuklar/{id} isteği
  // (koltukGuncelle) gönderir: istek başarılıysa iyimser durum KORUNUR;
  // koltuk bu ARADA başka bir kullanıcı tarafından alınmışsa (409) koltuk
  // sepetten GERİ ÇIKARILIR (koltukSec tekrar çağrılarak) ve yerel koltuk
  // listesi "dolu" olarak GÜNCELLENİR.
  // BEGIN etkinlik_detay_koltuk_tespit
  useEffect(() => {
    const guncelIdler = new Set(secilenKoltuklar.map((k) => k.id));
    const yeniSecilen = secilenKoltuklar.find(
      (k) => !izlenenIdler.current.has(k.id),
    );
    izlenenIdler.current = guncelIdler;

    if (!yeniSecilen) return;
    // END etkinlik_detay_koltuk_tespit

    // BEGIN etkinlik_detay_koltuk_patch
    koltukGuncelle(yeniSecilen.id, 'secili')
      .then(() => setKoltukHatasi(null))
      .catch((hata) => {
        koltukSec(yeniSecilen); // tekrar çağırmak sepetten ÇIKARIR (toggle)
        if (hata instanceof ApiHatasi && hata.status === 409) {
          setKoltukHatasi('Bu koltuk bu arada başka bir kullanıcı tarafından alındı.');
          setKoltuklar((onceki) =>
            onceki.map((k) =>
              k.id === yeniSecilen.id ? { ...k, durum: 'dolu' } : k,
            ),
          );
        } else {
          setKoltukHatasi('Koltuk güncellenirken bir hata oluştu.');
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secilenKoltuklar]);
  // END etkinlik_detay_koltuk_patch
  // END etkinlik_detay_koltuk_secim

  // BEGIN etkinlik_detay_render
  return (
    <>
      <section className="bolum">
        <h2>{etkinlik.baslik}</h2>
        <p>
          {etkinlik.tarih} · {etkinlik.mekan}
        </p>
      </section>
      <section className="bolum">
        <h2>Koltuk Planı</h2>
        {koltukHatasi && <HataMesaji mesaj={koltukHatasi} />}
        <KoltukPlani koltuklar={koltuklar} />
      </section>
      <section className="bolum">
        <h2>Sepet</h2>
        <SepetOzeti />
        <GeriSayim />
        <BiletFormu
          onBiletlerOlustu={(yeniBiletler) =>
            setBiletler((onceki) => [...onceki, ...yeniBiletler])
          }
        />
        {biletler.length > 0 && (
          <p className="bilet-ozet">Oluşturulan bilet sayısı: {biletler.length}</p>
        )}
      </section>
    </>
  );
  // END etkinlik_detay_render
}
