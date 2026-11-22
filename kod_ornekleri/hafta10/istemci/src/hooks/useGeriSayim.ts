import { useEffect, useState } from 'react';

// BEGIN use_geri_sayim_hook
// baslangicSaniye'den geriye sayar: useState ile kalanSaniye tutulur,
// useEffect içindeki setInterval her saniye setKalanSaniye'yi çağırır.
// Süre bitince (bittiMi) zamanlayıcı YENİDEN kurulmaz; efekt her
// çalıştığında (ve bileşen ekrandan kalktığında) döndürdüğü temizleme
// fonksiyonuyla clearInterval çağrılır — bu olmasaydı bileşen unmount
// olsa bile zamanlayıcı arka planda çalışmaya devam ederdi.
export function useGeriSayim(baslangicSaniye: number) {
  const [kalanSaniye, setKalanSaniye] = useState(baslangicSaniye);
  const bittiMi = kalanSaniye <= 0;

  useEffect(() => {
    if (bittiMi) return;

    const id = setInterval(() => {
      setKalanSaniye((onceki) => (onceki <= 1 ? 0 : onceki - 1));
    }, 1000);

    return () => clearInterval(id);
  }, [bittiMi]);

  return { kalanSaniye, bittiMi };
}
// END use_geri_sayim_hook
