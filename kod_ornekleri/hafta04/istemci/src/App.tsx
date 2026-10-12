import { etkinlikler, koltuklar } from './veri.ts';
import { Bolum } from './bilesenler/Bolum.tsx';
import { EtkinlikListesi } from './bilesenler/EtkinlikListesi.tsx';
import { KoltukPlani } from './bilesenler/KoltukPlani.tsx';

// BEGIN app_bilesen
// veri.ts'ten gelen sabit dizileri, Bolum (children) ile sarmalanmış iki
// bölümde EtkinlikListesi/KoltukPlani'ya prop olarak geçirir.
export function App() {
  return (
    <>
      <Bolum baslik="Etkinlikler">
        <EtkinlikListesi etkinlikler={etkinlikler} />
      </Bolum>
      <Bolum baslik="Koltuk Planı">
        <KoltukPlani koltuklar={koltuklar} />
      </Bolum>
    </>
  );
}
// END app_bilesen
