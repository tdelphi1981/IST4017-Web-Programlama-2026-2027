import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useOturum } from '../hooks/useOturum.ts';
import { ApiHatasi } from '../api/istemci.ts';

// BEGIN giris_sayfasi
export function GirisSayfasi() {
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [sifre, setSifre] = useState('');
  const [hata, setHata] = useState<string | null>(null);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  // BEGIN giris_sayfasi_submit
  const { girisYap } = useOturum();
  const navigate = useNavigate();

  async function submitEt(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHata(null);
    setGonderiliyor(true);
    try {
      await girisYap(kullaniciAdi, sifre);
      navigate('/');
    } catch (e) {
      if (e instanceof ApiHatasi && e.status === 401) {
        setHata('Kullanıcı adı ya da şifre hatalı.');
      } else {
        setHata('Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setGonderiliyor(false);
    }
  }
  // END giris_sayfasi_submit

  return (
    <section className="bolum">
      <h2>Giriş Yap</h2>
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
          Şifre
          <input
            type="password"
            value={sifre}
            onChange={(e) => setSifre(e.target.value)}
          />
        </label>
        {hata && <p className="hata">{hata}</p>}
        <button type="submit" disabled={gonderiliyor}>
          Giriş Yap
        </button>
      </form>
    </section>
  );
}
// END giris_sayfasi
