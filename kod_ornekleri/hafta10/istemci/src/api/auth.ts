// Hf.10'un app/rotalar/auth.py rotalarına karşılık gelen ön yüz fonksiyonları.

import type { Kullanici } from '../tipler.ts';
import { apiPost, ApiHatasi, TABAN_URL } from './istemci.ts';

// BEGIN auth_giris_api
export interface TokenCevabi {
  accessToken: string;
  tokenType: string;
}

// POST /auth/token — OAuth2 standardı gereği gövde FORM-ENCODED'DIR (JSON
// DEĞİL), bu yüzden apiPost KULLANILMAZ; URLSearchParams gövdeyi
// application/x-www-form-urlencoded biçiminde ÜRETİR. Sunucu cevabı
// snake_case'dir (access_token/token_type — Token modeli KamelModel'den
// TÜREMEZ, bkz. brif Ünite 2), burada camelCase'e ELLE çevrilir.
export async function girisYap(
  kullaniciAdi: string,
  sifre: string,
): Promise<TokenCevabi> {
  // BEGIN auth_giris_api_istek
  const govde = new URLSearchParams({ username: kullaniciAdi, password: sifre });
  const response = await fetch(`${TABAN_URL}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: govde,
  });
  // END auth_giris_api_istek
  // BEGIN auth_giris_api_cevap
  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw new ApiHatasi(response.status, detail);
  }
  const veri = (await response.json()) as { access_token: string; token_type: string };
  return { accessToken: veri.access_token, tokenType: veri.token_type };
  // END auth_giris_api_cevap
}
// END auth_giris_api

// BEGIN auth_kayit_api
export interface KullaniciKayitGirdisi {
  kullaniciAdi: string;
  eposta: string;
  sifre: string;
}

// POST /auth/kayit → Kullanici (201); kullanıcı adı zaten VARSA sunucu 409
// döner, apiPost bunu bir ApiHatasi olarak fırlatır.
export function kayitOl(girdi: KullaniciKayitGirdisi): Promise<Kullanici> {
  return apiPost<KullaniciKayitGirdisi, Kullanici>('/auth/kayit', girdi);
}
// END auth_kayit_api
