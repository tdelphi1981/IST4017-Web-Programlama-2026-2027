import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import { useVeri } from '../hooks/useVeri.ts';
import { biletleriGetir } from '../api/biletler.ts';
import type { Bilet } from '../tipler.ts';
import { Yukleniyor } from '../bilesenler/Yukleniyor.tsx';
import { HataMesaji } from '../bilesenler/HataMesaji.tsx';

// BEGIN biletlerim_sayfasi
// '/biletlerim' rotası — kullaniciAdi URL sorgu parametresinden okunur
// (ör. BiletFormu'nun yönlendirdiği /biletlerim?kullaniciAdi=Ayşe%20Yılmaz);
// Hf.10'a kadar gerçek bir oturum YOKTUR, bu yüzden kullanıcı adı bir form
// ile de DEĞİŞTİRİLEBİLİR. kullaniciAdi boşken hiç istek ATILMAZ.
export function BiletlerimSayfasi() {
  const [searchParams, setSearchParams] = useSearchParams();
  const kullaniciAdi = searchParams.get('kullaniciAdi') ?? '';
  const [taslakAd, setTaslakAd] = useState(kullaniciAdi);

  function ara(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSearchParams(taslakAd.trim() ? { kullaniciAdi: taslakAd.trim() } : {});
  }

  const durum = useVeri<Bilet[]>(
    (signal) =>
      kullaniciAdi ? biletleriGetir(kullaniciAdi, signal) : Promise.resolve([]),
    [kullaniciAdi],
  );

  return (
    <section className="bolum">
      <h2>Biletlerim</h2>
      <form className="biletlerim-arama" onSubmit={ara}>
        <label>
          Kullanıcı adı
          <input
            type="text"
            value={taslakAd}
            onChange={(e) => setTaslakAd(e.target.value)}
          />
        </label>
        <button type="submit">Biletleri Göster</button>
      </form>

      {kullaniciAdi === '' && <p>Biletlerinizi görmek için kullanıcı adınızı girin.</p>}
      {kullaniciAdi !== '' && durum.tur === 'yukleniyor' && <Yukleniyor />}
      {kullaniciAdi !== '' && durum.tur === 'hata' && <HataMesaji mesaj={durum.mesaj} />}
      {kullaniciAdi !== '' && durum.tur === 'basarili' && (
        durum.veri.length === 0 ? (
          <p>Bu kullanıcı adına ait bilet bulunamadı.</p>
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
