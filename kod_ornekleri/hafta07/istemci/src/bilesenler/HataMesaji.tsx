// BEGIN hata_mesaji_bilesen
// VeriDurumu<T>'nin 'hata' dalı için gösterilen kırmızı vurgulu kutu.
interface HataMesajiProps {
  mesaj: string;
}

export function HataMesaji({ mesaj }: HataMesajiProps) {
  return <p className="sayfa-hata">{mesaj}</p>;
}
// END hata_mesaji_bilesen
