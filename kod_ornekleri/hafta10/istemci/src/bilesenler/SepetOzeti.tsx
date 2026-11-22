import { useSepet } from '../hooks/useSepet.ts';

// BEGIN sepet_ozeti_bilesen
// useSepet()'ten seçili koltuk sayısını ve toplam tutarı okuyup gösteren
// küçük bir bileşen; kendi state'i yoktur, tamamen Context'e dayanır.
export function SepetOzeti() {
  const { secilenKoltuklar, toplamTutar } = useSepet();

  return (
    <div className="sepet-ozeti">
      <p>Seçili koltuk: {secilenKoltuklar.length}</p>
      <p>Toplam tutar: {toplamTutar} TL</p>
    </div>
  );
}
// END sepet_ozeti_bilesen
