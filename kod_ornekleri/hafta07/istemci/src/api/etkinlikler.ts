// Hf.6'nın app/rotalar/etkinlikler.py rotalarına karşılık gelen ön yüz
// fonksiyonları.

import type { Etkinlik } from '../tipler.ts';
import { apiGet } from './istemci.ts';

// BEGIN etkinlikler_api
// GET /etkinlikler → Etkinlik[]; mekan verilirse sunucu tarafında filtrelenir.
export function etkinlikleriGetir(
  mekan?: string,
  signal?: AbortSignal,
): Promise<Etkinlik[]> {
  const sorgu = mekan ? `?mekan=${encodeURIComponent(mekan)}` : '';
  return apiGet<Etkinlik[]>(`/etkinlikler${sorgu}`, { signal });
}

// GET /etkinlikler/{id} → Etkinlik; bulunamazsa apiGet bir ApiHatasi (404) fırlatır.
export function etkinlikGetir(id: number, signal?: AbortSignal): Promise<Etkinlik> {
  return apiGet<Etkinlik>(`/etkinlikler/${id}`, { signal });
}
// END etkinlikler_api
