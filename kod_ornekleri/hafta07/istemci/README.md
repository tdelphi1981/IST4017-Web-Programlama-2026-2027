# Hafta 7 — Kod Örnekleri / İstemci (İstemci-Sunucu Bütünleşmesi)

Bu klasör Hf.5'in `istemci/` klasörünün ÜZERİNE kurulur: React uygulaması
artık Hf.3'ün sabit (mock) `veri.ts` dizisi yerine `fetch` ile Hf.6/Hf.7'nin
GERÇEK sunucusundan (`kod_ornekleri/hafta07/sunucu/`) veri çeker, yükleme/
hata durumlarını yönetir, CORS engelini aşar ve `react-router` ile GERÇEK,
adres çubuğunda görünen çok sayfalı bir SPA'ya dönüşür.

## Dosya / etiket tablosu

Hf.5'ten AYNEN taşınanlar (içerik ve etiket adları DEĞİŞMEDİ):
`tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`,
`vite.config.ts`, `src/tipler.ts`, `src/main.tsx`,
`src/context/SepetContext.tsx`, `src/hooks/useSepet.ts`,
`src/hooks/useGeriSayim.ts`, `src/bilesenler/Koltuk.tsx`,
`src/bilesenler/EtkinlikListesi.tsx`, `src/bilesenler/KoltukPlani.tsx`,
`src/bilesenler/SepetOzeti.tsx`, `src/bilesenler/GeriSayim.tsx`.
`src/veri.ts` **SİLİNDİ** (Hf.3'ün sabit dizisi artık kullanılmıyor —
Ünite 1); `src/bilesenler/Bolum.tsx` **SİLİNDİ** (yalnızca eski `App.tsx`
tarafından kullanılıyordu, brifte Hf.7 için ADI GEÇMİYOR — sayfalar artık
kendi `<section className="bolum">` bloklarını doğrudan render ediyor,
aynı CSS sınıfı korunuyor).

| Dosya | İçerik | Etiketler |
|---|---|---|
| `package.json` | GÜNCELLENDİ: `react-router ^8.3.1` bağımlılığı eklendi | — |
| `src/style.css` | GÜNCELLENDİ: `.duzen-nav`, `.sayfa-yukleniyor`, `.sayfa-hata`, `.biletlerim-liste`, `.bulunamadi` + yardımcı sınıflar | `router_sayfa_stilleri` |
| `src/api/istemci.ts` | `TABAN_URL`; `ApiHatasi`; `apiGet`/`apiPost`/`apiPatch`/`apiDelete` | `api_taban_url`, `api_hata_sinifi`, `api_get`, `api_post`, `api_patch`, `api_delete` |
| `src/api/etkinlikler.ts` | `etkinlikleriGetir`, `etkinlikGetir` | `etkinlikler_api` |
| `src/api/koltuklar.ts` | `koltuklariGetir`, `koltukGuncelle` | `koltuklar_api` |
| `src/api/biletler.ts` | `biletOlustur`, `biletleriGetir` | `biletler_api` |
| `src/hooks/useVeri.ts` | `VeriDurumu<T>` (discriminated union); `useVeri<T>` (`useEffect`+`AbortController`) | `veri_durumu_tipi`, `use_veri_hook` |
| `src/bilesenler/Yukleniyor.tsx` | "Yükleniyor…" göstergesi | `yukleniyor_bilesen` |
| `src/bilesenler/HataMesaji.tsx` | Hata kutusu | `hata_mesaji_bilesen` |
| `src/bilesenler/Duzen.tsx` | Nav çubuğu (`Link`) + `<Outlet />` | `duzen_bilesen` |
| `src/bilesenler/EtkinlikKarti.tsx` | GÜNCELLENDİ: başlık artık `Link`e sarılı (bkz. "Briften sapmalar") | `props_etkinlik_karti` (aynen), `bilesen_etkinlik_karti` (JSX'e `Link` eklendi) |
| `src/bilesenler/BiletFormu.tsx` | GÜNCELLENDİ: gönderim artık `biletOlustur()` API çağrısı; `409`'da hata; başarıda `useNavigate` ile `/biletlerim`'e yönlendirme | `bilet_form_tipi` (aynen), `bilet_form_state` (aynen), `bilet_form_gonder_api` (yeni ad), `bilet_form_render` (aynen) |
| `src/sayfalar/EtkinliklerSayfasi.tsx` | `/` — `useVeri<Etkinlik[]>` + `EtkinlikListesi` | `etkinlikler_sayfasi` |
| `src/sayfalar/EtkinlikDetaySayfasi.tsx` | `/etkinlikler/:id` — `useParams`+`useVeri`; `SepetProvider` içinde `KoltukPlani`/`SepetOzeti`/`GeriSayim`/`BiletFormu`; iyimser koltuk seçimi + `409` geri alma | `etkinlik_detay_veri`, `etkinlik_detay_koltuk_secim`, `etkinlik_detay_render` |
| `src/sayfalar/BiletlerimSayfasi.tsx` | `/biletlerim` — sorgu parametresinden `kullaniciAdi` + `biletleriGetir` | `biletlerim_sayfasi` |
| `src/sayfalar/BulunamadiSayfasi.tsx` | 404 | `bulunamadi_sayfasi` |
| `src/App.tsx` | TAMAMEN YENİDEN YAZILDI: `BrowserRouter`+`Routes`+`Route` | `app_router` |

Tüm etiket adları `brifler/hafta07-brif.md`'deki tabloyla BİREBİR aynıdır;
hiçbir etiket iç içe değildir.

### Briften sapmalar (açıkça belirtilir)

- **`EtkinlikKarti.tsx`**: brifin "Hf.5'ten AYNEN taşınanlar" listesinde bu
  dosya da sayılmıştır, ama Ünite 4'ün "Şimdi Siz Deneyin" görevi AÇIKÇA
  "bir `EtkinlikKarti`'ndeki `Link`e TIKLAYIP…" der ve "Beklenen çıktılar"
  bir karta TIKLAMANIN `/etkinlikler/:id`'ye GEÇMESİNİ gerektirir. Bu iki
  gereksinim çelişkilidir (`EtkinlikListesi`/`Koltuk` gibi diğer "aynen"
  bileşenlerde böyle bir çelişki yoktur). Çalışan, test edilebilir
  davranış lehine karar verilmiş, `EtkinlikKarti.tsx`'in başlığı (`<h3>`)
  bir `react-router` `Link`ine SARILMIŞTIR — geri kalan İÇERİK (props,
  diğer alanlar) DEĞİŞMEMİŞTİR.
- **`src/bilesenler/Bolum.tsx`**: brifin dosya/etiket tablosunda ADI
  GEÇMEZ; Hf.5'in `App.tsx`'i dışında kullanılmıyordu, yeni `App.tsx`
  yalnızca router kurar. Kullanılmayan bir dosya bırakmak yerine
  SİLİNMİŞTİR; `.bolum` CSS sınıfı sayfalarda doğrudan kullanılmaya devam
  eder (`bolum_baslik_stili` etiketi Hf.4/Hf.5'ten DEĞİŞMEDEN kalır).

## Kurulum

```bash
cd kod_ornekleri/hafta07/istemci
npm ci
```

Bu ortamda `npm ci` sonrası `react-router@8.3.1` kurulu olarak DOĞRULANMIŞTIR
(`npm ls react-router`).

## Çalıştırma (iki terminal, sunucuyla BİRLİKTE)

**Terminal 1 — sunucu** (`kod_ornekleri/hafta07/sunucu/`):

```bash
source .venv/bin/activate
uvicorn app.main:app --reload
```

**Terminal 2 — istemci:**

```bash
cd kod_ornekleri/hafta07/istemci
npm run dev
```

Tarayıcıda `http://localhost:5173` açılır. `curl`/`istekler.sh` ile birkaç
etkinlik/koltuk önceden oluşturmak (bkz. sunucunun `README.md`'si) listeyi
BOŞ görmemek için ÖNERİLİR (bu haftanın kapsamında bir "etkinlik oluşturma"
formu YOKTUR — Hf.6'nın `POST /etkinlikler` rotası `curl`/Swagger UI ile
kullanılır).

## Beklenen çıktılar (özet)

- `/` → gerçek sunucudan çekilen etkinlik listesi (DevTools Network:
  `GET http://127.0.0.1:8000/etkinlikler`).
- Bir kartın başlığına tıklamak → `/etkinlikler/{id}`'ye GEÇER (sayfa
  YENİLENMEZ, yalnızca `fetch` istekleri Network'te görünür); koltuk
  planı + bilet formu görünür.
- Boş bir koltuğa tıklamak → ANINDA "seçili" gösterir (iyimser); sunucudaki
  `PATCH /koltuklar/{id}` başarılıysa durum KORUNUR; koltuk bu ARADA
  başkasınca alınmışsa (`409`) seçim GERİ ALINIR + hata mesajı GÖRÜNÜR.
- Bilet formu başarıyla gönderilince → `/biletlerim?kullaniciAdi=...`'e
  YÖNLENDİRİR, o kullanıcının biletleri LİSTELENİR.
- `/xyz` gibi tanımsız bir yol → 404 sayfası.
- `npx tsc -b --noEmit` ve `npm run build` HATASIZ geçer.

## Doğrulama kanıtı (bu ortamda, 2026-09-07)

### Statik kapı

```
$ npm ci
$ npx tsc -b --noEmit
(çıktı yok — hatasız)

$ npm run build
> tsc -b && vite build
vite v8.2.2 building client environment for production...
✓ 97 modules transformed.
dist/index.html                   0.47 kB
dist/assets/index-*.css            3.66 kB
dist/assets/index-*.js           238.25 kB
✓ built in 393ms
```

### Uçtan uca bütünleşme kapısı (gerçek sunucu + gerçek tarayıcı)

Sunucu arka planda başlatıldı (`uvicorn app.main:app --port 8000`, CORS
`http://localhost:5173`'e izin verir hâlde), bir etkinlik+koltuk `curl` ile
oluşturuldu, Vite geliştirme sunucusu (`npm run dev -- --port 5173`) arka
planda başlatıldı, sonra Chromium (headless, Playwright) ile GERÇEK bir
kullanıcı akışı OYNATILDI (jsdom yerine — gerçek `fetch`/CORS/routing
davranışını gözlemlemek için gerçek bir tarayıcı motoru tercih edilmiştir):

```
=== 1. Anasayfa (/) — etkinlik listesi gerçek sunucudan ===
Etkinlik kartı başlığı: Bahar Konseri

=== 2. Karta tıkla -> /etkinlikler/1 (SPA içi geçiş, sayfa yenilenmez) ===
URL: http://localhost:5173/etkinlikler/1
Koltuk sayısı: 1

=== 3. Boş koltuğa tıkla -> iyimser seçim + PATCH /koltuklar/1 ===
Koltuk class (secili bekleniyor): koltuk secili

=== 4. Bilet formu doldur ve gönder -> POST /biletler -> /biletlerim yönlendirme ===
URL: http://localhost:5173/biletlerim?kullaniciAdi=Ay%C5%9Fe%20Y%C4%B1lmaz
Bilet satırı: Bilet #1 — koltuk 1 — olusturuldu (2026-09-07T11:55:10.055060)

=== 5. Tanımsız yol -> 404 sayfası ===
404 başlık: 404 — Sayfa bulunamadı
```

Gerçek ağ isteklerinin (yalnızca `127.0.0.1:8000`'e giden) günlüğü:

```
REQ GET http://127.0.0.1:8000/etkinlikler
RES 200 http://127.0.0.1:8000/etkinlikler
REQ GET http://127.0.0.1:8000/etkinlikler/1
REQ GET http://127.0.0.1:8000/etkinlikler/1/koltuklar
RES 200 http://127.0.0.1:8000/etkinlikler/1
RES 200 http://127.0.0.1:8000/etkinlikler/1/koltuklar
REQ PATCH http://127.0.0.1:8000/koltuklar/1
RES 200 http://127.0.0.1:8000/koltuklar/1
REQ POST http://127.0.0.1:8000/biletler
RES 201 http://127.0.0.1:8000/biletler
REQ GET http://127.0.0.1:8000/biletler?kullaniciAdi=Ay%C5%9Fe%20Y%C4%B1lmaz
RES 200 http://127.0.0.1:8000/biletler?kullaniciAdi=Ay%C5%9Fe%20Y%C4%B1lmaz
```

(`GET /etkinlikler` ve `GET /etkinlikler/1`+`/koltuklar` İKİ kez `REQ`
olarak görünür ama BİR kez `RES` alır — React 19 `StrictMode`'un
geliştirme modunda efektleri BİLEREK iki kez çalıştırmasının,
`useVeri`'nin `AbortController`'ı SAYESİNDE İLK isteği gerçek bir sorun
YARATMADAN İPTAL ettiğinin somut kanıtıdır.)

CORS başlıkları ayrıca doğrudan `curl` ile de doğrulanmıştır — bkz.
`kod_ornekleri/hafta07/sunucu/README.md`.

### Doğrulanan sürümler (bu ortamda, 2026-09-07)

| Paket | Brifte sabitlenen | Bu ortamda kurulan |
|---|---|---|
| `react-router` | `^8.3.1` | `8.3.1` |
| `react` / `react-dom` | `^19.2.8` | değişmedi (Hf.4'ten) |
| Node.js | `24 LTS` | bu ortamda `v26.0.0` (uyumlu, build/test etkilenmedi) |
| TypeScript | `^7.0.2` | değişmedi (Hf.3'ten) |
| Vite | `^8.2.2` | değişmedi (Hf.3'ten) |

`npm view react-router-dom version` bu ortamda `7.18.3` döndü (brifteki
"v7'den sonra güncellenmiyor" notuyla TUTARLI) — bu paket KURULMADI, brif
kararı gereği.

## Notlar

- `node_modules/`, `dist/` commit'lenmez.
- `src/api/istemci.ts`, HER varlık modülünün (`etkinlikler.ts`,
  `koltuklar.ts`, `biletler.ts`) üzerine kurulduğu TEK ortak katmandır;
  yeni bir varlık eklemek yalnızca `src/api/` altına YENİ bir dosya
  eklemeyi gerektirir, `istemci.ts` DEĞİŞMEZ (bkz. Ünite 1 Aktarım).
- `EtkinlikDetaySayfasi.tsx`'teki iyimser güncelleme, `Koltuk.tsx`/
  `SepetContext.tsx`'i (ikisi de Hf.5'ten AYNEN) DEĞİŞTİRMEDEN, sepete
  YENİ eklenen koltuğu izleyen bir `useEffect` ile uygulanır — tıklama
  olayının kendisi HÂLÂ yalnızca `useSepet().koltukSec`'i çağırır.
