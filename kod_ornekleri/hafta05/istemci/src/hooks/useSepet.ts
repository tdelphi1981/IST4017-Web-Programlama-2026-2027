import { useContext } from 'react';
import { SepetContext } from '../context/SepetContext.tsx';

// BEGIN use_sepet_hook
// useContext(SepetContext)'i sarar; her bileşenin kendi başına
// useContext + null kontrolü yazması yerine yalnızca useSepet() çağırması
// yeter. baglam null dönerse (SepetProvider dışında kullanılmışsa)
// belirsiz bir çalışma zamanı hatası yerine AÇIK, anlaşılır bir hata
// fırlatır.
export function useSepet() {
  const baglam = useContext(SepetContext);
  if (!baglam) {
    throw new Error('useSepet() yalnızca SepetProvider içinde kullanılabilir.');
  }
  return baglam;
}
// END use_sepet_hook
