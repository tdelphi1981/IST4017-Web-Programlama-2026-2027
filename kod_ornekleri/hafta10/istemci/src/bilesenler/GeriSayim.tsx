import { useEffect } from 'react';
import { useGeriSayim } from '../hooks/useGeriSayim.ts';
import { useSepet } from '../hooks/useSepet.ts';

const BASLANGIC_SANIYE = 120;

export function GeriSayim() {
  // BEGIN geri_sayim_mantik
  // useGeriSayim(120) kalan saniyeyi/bittiMi'yi okur; süre bittiğinde
  // sepetiTemizle() çağıran ayrı bir efekt kurar — böylece kullanıcı
  // süresi içinde formu göndermezse sepet kendiliğinden boşalır.
  const { kalanSaniye, bittiMi } = useGeriSayim(BASLANGIC_SANIYE);
  const { sepetiTemizle } = useSepet();

  useEffect(() => {
    if (bittiMi) sepetiTemizle();
  }, [bittiMi]);
  // END geri_sayim_mantik

  // BEGIN geri_sayim_render
  const dakika = Math.floor(kalanSaniye / 60);
  const saniye = kalanSaniye % 60;
  const goruntu = `${dakika}:${saniye.toString().padStart(2, '0')}`;

  return (
    <div className="geri-sayim">
      {bittiMi ? (
        <p>Süre doldu, sepet temizlendi.</p>
      ) : (
        <p>Sepeti tamamlamak için kalan süre: {goruntu}</p>
      )}
    </div>
  );
  // END geri_sayim_render
}
