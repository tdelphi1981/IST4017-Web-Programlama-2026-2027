import { Link, Outlet, useNavigate } from 'react-router';
import { useOturum } from '../hooks/useOturum.ts';

// BEGIN duzen_bilesen
// Tüm sayfaların ORTAK çerçevesi: bir nav çubuğu (her zaman görünür) ve
// altında <Outlet /> — o ANDA eşleşen alt rotanın render EDİLECEĞİ yer
// tutucu. Nav useOturum()'a göre KOŞULLU render EDER: giriş YAPILMAMIŞSA
// "Giriş Yap"/"Kayıt Ol" bağlantıları, GİRİŞ YAPILMIŞSA kullanıcı adı +
// "Çıkış Yap" düğmesi (ve rol 'yonetici' İSE AYRICA bir "Yönetici Paneli"
// bağlantısı) GÖRÜNÜR.
export function Duzen() {
  const { kullanici, cikisYap } = useOturum();
  const navigate = useNavigate();

  function cikisYapVeYonlendir() {
    cikisYap();
    navigate('/');
  }

  return (
    <div className="duzen">
      <nav className="duzen-nav">
        <span className="duzen-baslik">KTÜ Etkinlik ve Bilet Sistemi</span>
        <Link to="/">Etkinlikler</Link>
        {kullanici && <Link to="/biletlerim">Biletlerim</Link>}
        {kullanici && kullanici.rol === 'yonetici' && (
          <Link to="/yonetici">Yönetici Paneli</Link>
        )}
        <span className="nav-oturum">
          {kullanici ? (
            <>
              <span>{kullanici.kullaniciAdi}</span>
              <button type="button" onClick={cikisYapVeYonlendir}>
                Çıkış Yap
              </button>
            </>
          ) : (
            <>
              <Link to="/giris">Giriş Yap</Link>
              <Link to="/kayit">Kayıt Ol</Link>
            </>
          )}
        </span>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
// END duzen_bilesen
