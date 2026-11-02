// Genel amaçlı, tiplenmiş fetch sarmalayıcıları — HER varlık modülü
// (etkinlikler.ts, koltuklar.ts, biletler.ts) bu dosyadaki fonksiyonların
// ÜZERİNE kurulur, kendi başına fetch/response.ok/response.json() adımlarını
// TEKRARLAMAZ.

// BEGIN api_taban_url
// Hf.6 sunucusunun adresi tek bir sabitte tutulur; HER fetch çağrısı bu
// sabiti kullanır. (İpucu: gerçek projelerde bu adres bir .env dosyasından
// okunur — ortam değişkeni ile yapılandırma Hf.12'nin konusudur.)
export const TABAN_URL = 'http://127.0.0.1:8000';
// END api_taban_url

// BEGIN api_hata_sinifi
// response.ok false olduğunda apiGet/apiPost bu sınıftan bir örnek fırlatır;
// çağıran kod `e instanceof ApiHatasi && e.status === 409` gibi durum
// koduna göre ayrım yapabilir.
export class ApiHatasi extends Error {
  status: number;
  detail: unknown;

  constructor(status: number, detail: unknown) {
    super(`API hatası: ${status}`);
    this.name = 'ApiHatasi';
    this.status = status;
    this.detail = detail;
  }
}
// END api_hata_sinifi

interface IstekSecenekleri {
  signal?: AbortSignal;
}

async function cevabiIsle<T>(response: Response): Promise<T> {
  if (!response.ok) {
    // response.ok false olsa da bu bir AĞ hatası DEĞİLDİR — sunucu bir
    // cevap ÜRETMİŞTİR (404/409/422 vb.); gövdeyi hata detayı olarak okur.
    const detail = await response.json().catch(() => null);
    throw new ApiHatasi(response.status, detail);
  }
  if (response.status === 204) {
    // 204 No Content: gövde YOKTUR, response.json() çağırmak hata verir.
    return undefined as T;
  }
  return (await response.json()) as T;
}

// BEGIN api_get
export async function apiGet<T>(
  yol: string,
  { signal }: IstekSecenekleri = {},
): Promise<T> {
  const response = await fetch(`${TABAN_URL}${yol}`, { signal });
  return cevabiIsle<T>(response);
}
// END api_get

// BEGIN api_post
export async function apiPost<TIn, TOut>(
  yol: string,
  govde: TIn,
  { signal }: IstekSecenekleri = {},
): Promise<TOut> {
  const response = await fetch(`${TABAN_URL}${yol}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(govde),
    signal,
  });
  return cevabiIsle<TOut>(response);
}
// END api_post

// BEGIN api_patch
export async function apiPatch<TIn, TOut>(
  yol: string,
  govde: TIn,
  { signal }: IstekSecenekleri = {},
): Promise<TOut> {
  const response = await fetch(`${TABAN_URL}${yol}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(govde),
    signal,
  });
  return cevabiIsle<TOut>(response);
}
// END api_patch

// BEGIN api_delete
export async function apiDelete(
  yol: string,
  { signal }: IstekSecenekleri = {},
): Promise<void> {
  const response = await fetch(`${TABAN_URL}${yol}`, {
    method: 'DELETE',
    signal,
  });
  await cevabiIsle<void>(response);
}
// END api_delete
