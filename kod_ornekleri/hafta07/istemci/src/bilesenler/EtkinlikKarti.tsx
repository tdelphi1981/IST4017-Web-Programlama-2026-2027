import { Link } from 'react-router';
import type { Etkinlik } from '../tipler.ts';

// BEGIN props_etkinlik_karti
interface EtkinlikKartiProps {
  etkinlik: Etkinlik;
}
// END props_etkinlik_karti

// BEGIN bilesen_etkinlik_karti
// Hf.2'nin article.etkinlik-karti HTML yapısının React karşılığı;
// biletFiyati 0 ise üçlü operatörle "Ücretsiz" rozeti gösterilir. Başlık
// artık bir Link'tir (Hf.7): tıklandığında sunucuya YENİ bir HTTP isteği
// GİTMEZ, yalnızca adres çubuğu /etkinlikler/{id}'ye GÜNCELLENİR ve
// EtkinlikDetaySayfasi render edilir.
export function EtkinlikKarti({ etkinlik }: EtkinlikKartiProps) {
  return (
    <article className="etkinlik-karti">
      <h3>
        <Link to={`/etkinlikler/${etkinlik.id}`}>{etkinlik.baslik}</Link>
      </h3>
      <p>
        {etkinlik.tarih} · {etkinlik.mekan}
      </p>
      <p>
        Kapasite: {etkinlik.kapasite} ·{' '}
        {etkinlik.biletFiyati === 0 ? (
          <span className="rozet-ucretsiz">Ücretsiz</span>
        ) : (
          `Bilet: ${etkinlik.biletFiyati} TL`
        )}
      </p>
    </article>
  );
}
// END bilesen_etkinlik_karti
