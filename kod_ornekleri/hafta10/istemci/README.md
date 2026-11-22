# Hafta 10 — Kod Örnekleri / İstemci (Kimlik Doğrulama ve Yetkilendirme)

Bu klasör Hf.8'in `istemci/` klasörünün (kendisi Hf.7'nin AYNEN kopyasıdır)
ÜZERİNE kurulur. Uygulama ilk kez GERÇEK bir oturuma kavuşur: bir
`OturumContext`/`useOturum()` token'ı bellekte tutar (+ `localStorage`
yedeği), `apiGet`/`apiPost`/`apiPatch`/`apiDelete` isteğe bağlı bir token
parametresi alıp `Authorization: Bearer` başlığı ekler, `KorumaliRota`
giriş yapmamış kullanıcıyı `/giris`'e yönlendirir (ya da rol uyuşmuyorsa
bir "yetkiniz yok" mesajı gösterir), yeni `GirisSayfasi`/`KayitSayfasi`/
`YoneticiPaneli` sayfaları eklenir. `Bilet.kullaniciAdi` (düz metin) YERİNİ
`Bilet.kullaniciId` alır; `BiletFormu`'ndaki serbest metin ad alanı
KALDIRILIR.

## Dosya / etiket tablosu

Hf.7/8'den AYNEN taşınanlar (içerik ve etiket adları DEĞİŞMEDİ):
`tsconfig*.json`, `vite.config.ts`, `src/main.tsx`,
`src/context/SepetContext.tsx`, `src/hooks/useSepet.ts`,
`src/hooks/useGeriSayim.ts`, `src/hooks/useVeri.ts`,
`src/bilesenler/Koltuk.tsx`, `EtkinlikKarti.tsx`, `EtkinlikListesi.tsx`,
`KoltukPlani.tsx`, `SepetOzeti.tsx`, `GeriSayim.tsx`, `Yukleniyor.tsx`,
`HataMesaji.tsx`, `src/api/etkinlikler.ts`, `src/sayfalar/
EtkinliklerSayfasi.tsx`, `src/sayfalar/BulunamadiSayfasi.tsx`.

| Dosya | İçerik | Etiketler |
|---|---|---|
| `src/tipler.ts` | GÜNCELLENDİ: yeni `Kullanici`; `Bilet.kullaniciAdi` → `Bilet.kullaniciId` | `tip_kullanici` (yeni), `tip_bilet` (güncellendi), `tip_etkinlik`/`tip_koltuk`/`tip_liste_generic` (aynen) |
| `src/context/OturumContext.tsx` | **YENİ**: `OturumContext`/`OturumProvider` (`kullanici`/`token`/`yukleniyor`; `girisYap`/`kayitOl`/`cikisYap`; localStorage'dan ilk yükleme) | `oturum_context_tipi`, `oturum_provider` |
| `src/hooks/useOturum.ts` | **YENİ**: `useContext(OturumContext)` sarmalayıcısı | `use_oturum_hook` |
| `src/api/auth.ts` | **YENİ**: `girisYap` (form-encoded `POST /auth/token`), `kayitOl` (`POST /auth/kayit`) | `auth_giris_api`, `auth_kayit_api` |
| `src/api/istemci.ts` | GÜNCELLENDİ: `apiGet`/`apiPost`/`apiPatch`/`apiDelete` isteğe bağlı `token` alır, `Authorization: Bearer` ekler | `api_get`/`api_post`/`api_patch`/`api_delete` (güncellendi), `api_taban_url`/`api_hata_sinifi` (aynen) |
| `src/api/koltuklar.ts` | GÜNCELLENDİ: `koltukGuncelle(id, durum, token)` | `koltuklar_api` (güncellendi) |
| `src/api/biletler.ts` | GÜNCELLENDİ: `biletOlustur({koltukId}, token)`, `biletleriGetir(token)` (`GET /biletlerim`) | `biletler_api` (güncellendi) |
| `src/bilesenler/KorumaliRota.tsx` | **YENİ**: `kullanici === null` → `/giris`; `rolGerekli` uyuşmuyorsa istemci-içi mesaj | `korumali_rota_bilesen` |
| `src/sayfalar/GirisSayfasi.tsx` | **YENİ**: giriş formu | `giris_sayfasi` |
| `src/sayfalar/KayitSayfasi.tsx` | **YENİ**: kayıt formu (+ 409 gösterimi) | `kayit_sayfasi` |
| `src/sayfalar/YoneticiPaneli.tsx` | **YENİ**: etkinlik ekleme formu + silme listesi (admin token) | `yonetici_paneli_sayfasi` |
| `src/sayfalar/BiletlerimSayfasi.tsx` | GÜNCELLENDİ: sorgu parametresi kalktı, `useOturum()`'dan token; 401'de otomatik çıkış | `biletlerim_sayfasi` (güncellendi) |
| `src/sayfalar/EtkinlikDetaySayfasi.tsx` | GÜNCELLENDİ: giriş yoksa koltuk seçimi/`BiletFormu` yerine uyarı; token'lı çağrılar | `etkinlik_detay_veri` (aynen), `etkinlik_detay_koltuk_secim`/`etkinlik_detay_render` (güncellendi) |
| `src/bilesenler/BiletFormu.tsx` | GÜNCELLENDİ: `kullaniciAdi` girdisi kalktı; giriş yoksa uyarı; `biletOlustur({koltukId}, token)` | `bilet_form_tipi`/`bilet_form_state`/`bilet_form_gonder_api`/`bilet_form_render` (güncellendi) |
| `src/bilesenler/Duzen.tsx` | GÜNCELLENDİ: nav'da giriş/çıkış durumu + yönetici bağlantısı | `duzen_bilesen` (güncellendi) |
| `src/App.tsx` | GÜNCELLENDİ: `OturumProvider` sarmalar; `giris`/`kayit`/`biletlerim`(korumalı)/`yonetici`(korumalı, admin) rotaları | `app_router` (güncellendi) |
| `src/style.css` | GÜNCELLENDİ: `.oturum-form`, `.nav-oturum`, `.yonetici-panel-liste`, `.giris-uyarisi` | `auth_sayfa_stilleri` (yeni) |

Tüm etiket adları `brifler/hafta10-brif.md`'deki tabloyla BİREBİR aynıdır;
hiçbir etiket iç içe değildir. Ek npm paketi EKLENMEDİ.

### Briften sapmalar / tasarım notları (açıkça belirtilir)

- **Giriş sonrası `Kullanici` nesnesinin kaynağı**: `POST /auth/token`
  yalnızca `access_token` döner (bir `/auth/me` uç noktası brif kapsamında
  YOKTUR — YAGNI). `OturumContext`, JWT'nin base64url ile kodlanmış
  `payload` bölümünü (`sub`/`rol`) doğrudan ÇÖZEREK asgari bir `Kullanici`
  nesnesi kurar; bu bir DOĞRULAMA DEĞİLDİR (imza burada KONTROL EDİLMEZ),
  yalnızca Ünite 2'nin "JWT kodlamadır, şifreleme değildir" dersinin
  istemci tarafındaki somut bir uygulamasıdır. Kayıt akışında (`kayitOl`)
  tam `Kullanici` nesnesi zaten `POST /auth/kayit`'in cevabından gelir.

## Kurulum

```bash
cd kod_ornekleri/hafta10/istemci
npm ci
```

## Çalıştırma (iki terminal, sunucuyla BİRLİKTE)

**Terminal 1 — sunucu** (`kod_ornekleri/hafta10/sunucu/`):

```bash
source .venv/bin/activate
python -m app.tohum   # yonetici/musteri1 hesapları için (ilk çalıştırmada)
uvicorn app.main:app --reload
```

**Terminal 2 — istemci:**

```bash
cd kod_ornekleri/hafta10/istemci
npm run dev
```

Tarayıcıda `http://localhost:5173` açılır.

## Beklenen çıktılar (özet)

- `/kayit`'ta yeni bir hesap açılabilir; otomatik giriş yapılıp anasayfaya
  yönlendirilir.
- `/giris`'te `yonetici`/`yonetici123` ya da `musteri1`/`musteri123` ile
  giriş yapılabilir.
- Giriş YAPMADAN `/biletlerim`'e gitmek ANINDA `/giris`'e YÖNLENDİRİR.
- Müşteri rolündeki bir kullanıcı `/yonetici`'ye giderse bir "yetkiniz
  yok" mesajı GÖRÜR (yönlendirme OLMAZ).
- Bir etkinlik sayfasında koltuk seçmek/bilet almak giriş GEREKTİRİR;
  alınan biletler `/biletlerim`'de GÖRÜNÜR.
- `npx tsc -b` ve `npm run build` HATASIZ geçer.

## Doğrulama kanıtı (bu ortamda, 2026-09-07)

```
$ npm ci
added 29 packages

$ npx tsc -b
(çıktı yok — hatasız)

$ npm run build
> tsc -b && vite build
vite v8.2.2 building client environment for production...
✓ 104 modules transformed.
dist/index.html                   0.47 kB
dist/assets/index-*.css            4.92 kB
dist/assets/index-*.js           244.48 kB
✓ built in 558ms
```

Sunucu tarafındaki gerçek `curl` akışı (`kayıt → token → 401/403 →
biletlerim`) `kod_ornekleri/hafta10/sunucu/README.md`'de belgelenmiştir;
istemci burada YALNIZCA statik kapı (`tsc`/`build`) ile doğrulanmıştır —
brif bu haftanın istemci kapsamı için ayrı bir uçtan uca tarayıcı
otomasyonu İSTEMEZ.

### Doğrulanan sürümler (bu ortamda, 2026-09-07)

| Paket | Brifte sabitlenen | Bu ortamda kurulan |
|---|---|---|
| `react` / `react-dom` | `^19.2.8` | değişmedi (Hf.4'ten) |
| `react-router` | `^8.3.1` | değişmedi (Hf.7'den) |
| Node.js | `24 LTS` | bu ortamda `v26.0.0` (uyumlu, build/test etkilenmedi) |
| TypeScript | `^7.0.2` | değişmedi (Hf.3'ten) |
| Vite | `^8.2.2` | değişmedi (Hf.3'ten) |

## Notlar

- `node_modules/`, `dist/` commit'lenmez.
- Token BİLEREK bir modül-düzeyi (global) değişkende TUTULMAZ — her
  çağıran kod `useOturum()`'dan okuduğu token'ı AÇIKÇA `apiGet`/`apiPost`/
  `apiPatch`/`apiDelete`'e geçirir.
