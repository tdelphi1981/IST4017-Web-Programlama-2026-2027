import type { ReactNode } from 'react';

// BEGIN bilesen_bolum_children
// children örneği: Bolum, açılış/kapanış etiketleri arasına konan
// HERHANGİ bir JSX'i props.children olarak alıp bir başlığın altında
// gösteren küçük bir sarmalayıcı bileşendir.
interface BolumProps {
  baslik: string;
  children: ReactNode;
}

export function Bolum({ baslik, children }: BolumProps) {
  return (
    <section className="bolum">
      <h2>{baslik}</h2>
      {children}
    </section>
  );
}
// END bilesen_bolum_children
