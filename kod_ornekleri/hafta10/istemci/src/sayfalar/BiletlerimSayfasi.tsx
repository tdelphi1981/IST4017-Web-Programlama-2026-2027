import { useVeri } from '../hooks/useVeri.ts';
import { biletleriGetir } from '../api/biletler.ts';
import type { Bilet } from '../tipler.ts';
import { useOturum } from '../hooks/useOturum.ts';
import { ApiHatasi } from '../api/istemci.ts';
import { Yukleniyor } from '../bilesenler/Yukleniyor.tsx';
import { HataMesaji } from '../bilesenler/HataMesaji.tsx';

// BEGIN biletlerim_sayfasi
// '/biletlerim' rotası — sorgu parametresi KALKMIŞTIR (Hf.7'nin
// ?kullaniciAdi=... sorgu parametresi bu haftadan itibaren GEÇERSİZDİR);
// sayfa useOturum()'dan token OKUR, GET /biletlerim'i (biletleriGetir)
// ÇAĞIRIR. KorumaliRota İÇİNE alındığı için giriş YAPILMAMIŞ bir kullanıcı
// bu sayfaya HİÇ ULAŞAMAZ; token SUNUCU tarafında GEÇERSİZLEŞMİŞSE (401)
// otomatik ÇIKIŞ yapılır — kullanıcı "giriş yapmış GİBİ görünen ama hiçbir
// korumalı isteğin başarılı OLMADIĞI" bir durumda KALMAZ.
export function BiletlerimSayfasi() {
  // BEGIN biletlerim_sayfasi_401
  const { token, cikisYap } = useOturum();

  const durum = useVeri<Bilet[]>(
    async (signal) => {
      try {
        return await biletleriGetir(token, signal);
      } catch (e) {
        if (e instanceof ApiHatasi && e.status === 401) {
          cikisYap();
        }
        throw e;
      }
    },
    [token],
  );
  // END biletlerim_sayfasi_401

  return (
    <section className="bolum">
      <h2>Biletlerim</h2>

      {durum.tur === 'yukleniyor' && <Yukleniyor />}
      {durum.tur === 'hata' && <HataMesaji mesaj={durum.mesaj} />}
      {durum.tur === 'basarili' && (
        durum.veri.length === 0 ? (
          <p>Henüz bir biletiniz yok.</p>
        ) : (
          <ul className="biletlerim-liste">
            {durum.veri.map((bilet) => (
              <li key={bilet.id}>
                Bilet #{bilet.id} — koltuk {bilet.koltukId} — {bilet.durum} (
                {bilet.satinAlmaZamani})
              </li>
            ))}
          </ul>
        )
      )}
    </section>
  );
}
// END biletlerim_sayfasi
