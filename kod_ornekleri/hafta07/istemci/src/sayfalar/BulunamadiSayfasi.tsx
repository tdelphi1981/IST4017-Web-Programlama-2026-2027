import { Link } from 'react-router';

// BEGIN bulunamadi_sayfasi
// Routes içindeki HİÇBİR yolla eşleşmeyen (path="*") her URL için render
// edilir — adres YAZIM olarak geçerlidir, ama orada tanımlı bir rota YOKTUR.
export function BulunamadiSayfasi() {
  return (
    <section className="bulunamadi">
      <h2>404 — Sayfa bulunamadı</h2>
      <p>Aradığınız adres için tanımlı bir sayfa yok.</p>
      <Link to="/">Anasayfaya dön</Link>
    </section>
  );
}
// END bulunamadi_sayfasi
