// Hf.6'nın app/rotalar/koltuklar.py rotalarına karşılık gelen ön yüz
// fonksiyonları.

import type { Koltuk, KoltukDurumu } from '../tipler.ts';
import { apiGet, apiPatch } from './istemci.ts';

// BEGIN koltuklar_api
// GET /etkinlikler/{etkinlikId}/koltuklar → Koltuk[]; durum verilirse
// sunucu tarafında filtrelenir (ör. yalnızca boş koltuklar).
export function koltuklariGetir(
  etkinlikId: number,
  durum?: KoltukDurumu,
  signal?: AbortSignal,
): Promise<Koltuk[]> {
  const sorgu = durum ? `?durum=${durum}` : '';
  return apiGet<Koltuk[]>(`/etkinlikler/${etkinlikId}/koltuklar${sorgu}`, {
    signal,
  });
}

// PATCH /koltuklar/{id} — yalnızca durum alanını günceller; Hf.10'dan
// itibaren bir Depends(get_current_user) gerektirir, bu yüzden bir token
// parametresi ALIR. Koltuk başka biri tarafından zaten alınmışsa sunucu
// bir 404/409 dönebilir (bu dosyanın kendisi bunu YAKALAMAZ, çağıran kod —
// EtkinlikDetaySayfasi — ApiHatasi'nı yakalayıp iyimser değişikliği geri
// alır).
export function koltukGuncelle(
  id: number,
  durum: KoltukDurumu,
  token: string | null,
): Promise<Koltuk> {
  return apiPatch<{ durum: KoltukDurumu }, Koltuk>(
    `/koltuklar/${id}`,
    { durum },
    { token },
  );
}
// END koltuklar_api
