// Hf.6'nın app/rotalar/biletler.py rotalarına karşılık gelen ön yüz
// fonksiyonları.

import type { Bilet } from '../tipler.ts';
import { apiGet, apiPost } from './istemci.ts';

// BEGIN biletler_api
// POST /biletler gövdesi — sunucunun BiletOlustur modeliyle (koltukId,
// kullaniciAdi) birebir örtüşür.
export interface BiletOlusturGirdisi {
  koltukId: number;
  kullaniciAdi: string;
}

// POST /biletler → Bilet (201); koltuk zaten doluysa sunucu 409 döner,
// apiPost bunu bir ApiHatasi olarak fırlatır (çağıran kod BiletFormu'nda
// yakalanır).
export function biletOlustur(girdi: BiletOlusturGirdisi): Promise<Bilet> {
  return apiPost<BiletOlusturGirdisi, Bilet>('/biletler', girdi);
}

// GET /biletler?kullaniciAdi=... → o kullanıcının biletleri.
export function biletleriGetir(
  kullaniciAdi: string,
  signal?: AbortSignal,
): Promise<Bilet[]> {
  return apiGet<Bilet[]>(
    `/biletler?kullaniciAdi=${encodeURIComponent(kullaniciAdi)}`,
    { signal },
  );
}
// END biletler_api
