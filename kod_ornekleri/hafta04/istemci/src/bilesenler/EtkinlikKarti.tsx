import type { Etkinlik } from '../tipler.ts';

// BEGIN props_etkinlik_karti
interface EtkinlikKartiProps {
  etkinlik: Etkinlik;
}
// END props_etkinlik_karti

// BEGIN bilesen_etkinlik_karti
// Hf.2'nin article.etkinlik-karti HTML yapısının React karşılığı;
// biletFiyati 0 ise üçlü operatörle "Ücretsiz" rozeti gösterilir.
export function EtkinlikKarti({ etkinlik }: EtkinlikKartiProps) {
  return (
    <article className="etkinlik-karti">
      <h3>{etkinlik.baslik}</h3>
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
