// Hf.10'un app/rotalar/biletler.py rotalarına karşılık gelen ön yüz
// fonksiyonları.

import type { Bilet } from '../tipler.ts';
import { apiGet, apiPost } from './istemci.ts';

// BEGIN biletler_api
// POST /biletler gövdesi — sunucunun BiletOlustur modeliyle (yalnızca
// koltukId) birebir örtüşür; kullaniciAdi KALKMIŞTIR, kim aldığı token'dan
// çıkarılır.
export interface BiletOlusturGirdisi {
  koltukId: number;
}

// POST /biletler → Bilet (201); koltuk zaten doluysa sunucu 409 döner,
// apiPost bunu bir ApiHatasi olarak fırlatır (çağıran kod BiletFormu'nda
// yakalanır).
export function biletOlustur(
  girdi: BiletOlusturGirdisi,
  token: string | null,
): Promise<Bilet> {
  return apiPost<BiletOlusturGirdisi, Bilet>('/biletler', girdi, { token });
}

// GET /biletlerim → giriş yapmış kullanıcının YALNIZ kendi biletleri;
// sorgu parametresi YOKTUR, kimin biletleri isteniyorsa token belirler.
export function biletleriGetir(
  token: string | null,
  signal?: AbortSignal,
): Promise<Bilet[]> {
  return apiGet<Bilet[]>('/biletlerim', { signal, token });
}
// END biletler_api
