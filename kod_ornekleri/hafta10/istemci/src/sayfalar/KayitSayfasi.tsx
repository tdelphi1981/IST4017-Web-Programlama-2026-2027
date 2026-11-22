import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useOturum } from '../hooks/useOturum.ts';
import { ApiHatasi } from '../api/istemci.ts';

// BEGIN kayit_sayfasi
export function KayitSayfasi() {
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [eposta, setEposta] = useState('');
  const [sifre, setSifre] = useState('');
  const [hata, setHata] = useState<string | null>(null);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const { kayitOl } = useOturum();
  const navigate = useNavigate();

  async function submitEt(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHata(null);
    setGonderiliyor(true);
    try {
      await kayitOl(kullaniciAdi, eposta, sifre);
      navigate('/');
    } catch (e) {
      if (e instanceof ApiHatasi && e.status === 409) {
        setHata('Bu kullanıcı adı zaten alınmış.');
      } else {
        setHata('Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setGonderiliyor(false);
    }
  }

  return (
    <section className="bolum">
      <h2>Kayıt Ol</h2>
      <form className="oturum-form" onSubmit={submitEt}>
        <label>
          Kullanıcı adı
          <input
            type="text"
            value={kullaniciAdi}
            onChange={(e) => setKullaniciAdi(e.target.value)}
          />
        </label>
        <label>
          E-posta
          <input
            type="email"
            value={eposta}
            onChange={(e) => setEposta(e.target.value)}
          />
        </label>
        <label>
          Şifre
          <input
            type="password"
            value={sifre}
            onChange={(e) => setSifre(e.target.value)}
          />
        </label>
        {hata && <p className="hata">{hata}</p>}
        <button type="submit" disabled={gonderiliyor}>
          Kayıt Ol
        </button>
      </form>
    </section>
  );
}
// END kayit_sayfasi
