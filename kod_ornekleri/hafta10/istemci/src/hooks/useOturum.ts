import { useContext } from 'react';
import { OturumContext } from '../context/OturumContext.tsx';

// BEGIN use_oturum_hook
// useContext(OturumContext)'i sarar — Hf.5 Ünite 4'ün useSepet deseninin
// AYNISI: Provider DIŞINDA çağrılırsa belirsiz bir çalışma zamanı hatası
// yerine AÇIK, anlaşılır bir hata fırlatır.
export function useOturum() {
  const baglam = useContext(OturumContext);
  if (!baglam) {
    throw new Error('useOturum() yalnızca OturumProvider içinde kullanılabilir.');
  }
  return baglam;
}
// END use_oturum_hook
