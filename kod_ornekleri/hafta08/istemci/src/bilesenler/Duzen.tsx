import { Link, Outlet } from 'react-router';

// BEGIN duzen_bilesen
// Tüm sayfaların ORTAK çerçevesi: bir nav çubuğu (her zaman görünür) ve
// altında <Outlet /> — o ANDA eşleşen alt rotanın (EtkinliklerSayfasi,
// EtkinlikDetaySayfasi, BiletlerimSayfasi, BulunamadiSayfasi) render
// EDİLECEĞİ yer tutucu. Link, normal bir <a> etiketinin AKSİNE tıklandığında
// sunucuya YENİ bir HTTP isteği göndertmez — yalnızca adres çubuğunu
// güncelleyip eşleşen bileşeni render eder.
export function Duzen() {
  return (
    <div className="duzen">
      <nav className="duzen-nav">
        <span className="duzen-baslik">KTÜ Etkinlik ve Bilet Sistemi</span>
        <Link to="/">Etkinlikler</Link>
        <Link to="/biletlerim">Biletlerim</Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
// END duzen_bilesen
