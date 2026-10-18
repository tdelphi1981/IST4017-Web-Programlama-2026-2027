import { useEffect, useState } from 'react';
import { etkinlikler, koltuklar as ilkKoltuklar } from './veri.ts';
import type { Bilet, Koltuk as KoltukTipi } from './tipler.ts';
import { Bolum } from './bilesenler/Bolum.tsx';
import { EtkinlikListesi } from './bilesenler/EtkinlikListesi.tsx';
import { KoltukPlani } from './bilesenler/KoltukPlani.tsx';
import { SepetOzeti } from './bilesenler/SepetOzeti.tsx';
import { GeriSayim } from './bilesenler/GeriSayim.tsx';
import { BiletFormu } from './bilesenler/BiletFormu.tsx';
import { SepetProvider } from './context/SepetContext.tsx';
import { useSepet } from './hooks/useSepet.ts';

const AKTIF_ETKINLIK = etkinlikler[0];

// BEGIN app_bilesen
// App artık yalnızca hangi etkinliğin bilet fiyatını kullanacağını
// belirleyip SepetProvider'ı kurar; asıl sayfa içeriği AppIcerik'tedir.
// AppIcerik, SepetProvider'ın İÇİNDE (bir alt bileşen olarak) durmak
// ZORUNDADIR — bir bileşen kendi sağladığı Context'i doğrudan okuyamaz,
// yalnızca alt'ları okuyabilir.
export function App() {
  return (
    <SepetProvider biletFiyati={AKTIF_ETKINLIK.biletFiyati}>
      <AppIcerik />
    </SepetProvider>
  );
}
// END app_bilesen

function AppIcerik() {
  // BEGIN app_icerik_state
  // Koltukların GÜNCEL durum listesi (bos/dolu) ve oluşturulan biletler
  // burada, App/AppIcerik düzeyinde tutulur (sunucu yok, bu yüzden
  // kalıcılık yok — sayfa yenilenince ikisi de kaybolur).
  const [koltuklar, setKoltuklar] = useState<KoltukTipi[]>(ilkKoltuklar);
  const [biletler, setBiletler] = useState<Bilet[]>([]);
  const { secilenKoltuklar } = useSepet();
  // END app_icerik_state

  // BEGIN app_baslik_efekti
  // Sekme başlığını seçili koltuk sayısına göre güncelleyen yan etki.
  // secilenKoltuklar'ın NEREDEN geldiğini (SepetContext) durum
  // kaldırma/Context ünitesinde göreceksiniz — bu efekt yalnızca
  // useEffect'in kendisine (biçimine, bağımlılık dizisine) odaklanır.
  useEffect(() => {
    document.title =
      secilenKoltuklar.length > 0
        ? `(${secilenKoltuklar.length}) KTÜ Etkinlik ve Bilet Sistemi`
        : 'KTÜ Etkinlik ve Bilet Sistemi';
  }, [secilenKoltuklar.length]);
  // END app_baslik_efekti

  // BEGIN app_bilet_olustur
  // BiletFormu'ndan gelen yeni biletleri listeye ekler ve ilgili
  // koltukları 'dolu' durumuna geçirir; bu işlev BiletFormu'ya prop
  // olarak geçirilir.
  function biletleriOlustur(yeniBiletler: Bilet[]) {
    setBiletler((onceki) => [...onceki, ...yeniBiletler]);

    const doluKoltukIdleri = new Set(yeniBiletler.map((bilet) => bilet.koltukId));
    setKoltuklar((onceki) =>
      onceki.map((koltuk) =>
        doluKoltukIdleri.has(koltuk.id) ? { ...koltuk, durum: 'dolu' } : koltuk,
      ),
    );
  }
  // END app_bilet_olustur

  // BEGIN app_icerik_render
  return (
    <>
      <Bolum baslik="Etkinlikler">
        <EtkinlikListesi etkinlikler={etkinlikler} />
      </Bolum>
      <Bolum baslik="Koltuk Planı">
        <KoltukPlani koltuklar={koltuklar} />
      </Bolum>
      <Bolum baslik="Sepet">
        <SepetOzeti />
        <GeriSayim />
        <BiletFormu onBiletlerOlustu={biletleriOlustur} />
        {biletler.length > 0 && (
          <p className="bilet-ozet">Oluşturulan bilet sayısı: {biletler.length}</p>
        )}
      </Bolum>
    </>
  );
  // END app_icerik_render
}
