# Hafta 5 — Kod Örnekleri (React II: Hooks, Form, Durum Paylaşımı)

Bu klasör Hf.4'ün `istemci/` projesinin kopyası ÜSTÜNE sepet/Context/form/
özel hook katmanı eklenerek büyümüş hâlidir. `package.json`,
`tsconfig*.json`, `vite.config.ts`, `src/tipler.ts`, `src/veri.ts`,
`src/main.tsx`, `src/bilesenler/Bolum.tsx`, `src/bilesenler/
EtkinlikKarti.tsx`, `src/bilesenler/EtkinlikListesi.tsx`, `src/bilesenler/
KoltukPlani.tsx` Hf.4'ten **AYNEN** (aynı içerik, aynı etiket adları)
taşınmıştır — bu hafta **YENİ PAKET EKLENMEMİŞTİR**, sürümler
DEĞİŞMEMİŞTİR.

Sunucu (FastAPI), `fetch`/API/CORS ve React Router bu haftanın da
KAPSAMI DIŞINDADIR (sırasıyla Hf.6/7'nin konusudur). Veri hâlâ
`src/veri.ts`'teki sabit (mock) dizilerden gelir; `Bilet[]` yalnızca
`AppIcerik`'in yerel `useState`'inde yaşar (kalıcılık YOK, sayfa
yenilenince kaybolur — bilinçli sınır, Hf.6'nın konusu).

## `istemci/` — dosya/etiket tablosu

### Hf.4'ten AYNEN taşınan dosyalar (bu haftaya özel değişiklik YOK)

| Dosya | İçerik | Etiketler |
|---|---|---|
| `package.json` | Proje kimliği, `scripts`, `dependencies`, `devDependencies` | *(etiketsiz, tüm dosya — JSON istisnası)* |
| `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` | Proje referansları, derleyici seçenekleri | *(etiketsiz, tüm dosya — JSON istisnası)* |
| `vite.config.ts` | `@vitejs/plugin-react` eklentisi | `vite_react_eklentisi` |
| `index.html` | Vite girişi | `sayfa_koku` |
| `src/main.tsx` | `createRoot` ile `App`'i `#root`'a bağlama (`StrictMode`) | `main_giris` |
| `src/tipler.ts` | `Etkinlik`, `KoltukDurumu`/`Koltuk`, `BiletDurumu`/`Bilet`, `Liste<T>` | `tip_etkinlik`, `tip_koltuk`, `tip_bilet`, `tip_liste_generic` |
| `src/veri.ts` | Sabit `Etkinlik[]` ve `Koltuk[]` dizileri | `veri_etkinlikler`, `veri_koltuklar` |
| `src/bilesenler/Bolum.tsx` | `children: ReactNode` alan başlıklı sarmalayıcı bileşen | `bilesen_bolum_children` |
| `src/bilesenler/EtkinlikKarti.tsx` | `etkinlik: Etkinlik` prop'u; fiyat 0 ise "Ücretsiz" rozeti | `props_etkinlik_karti`, `bilesen_etkinlik_karti` |
| `src/bilesenler/EtkinlikListesi.tsx` | `etkinlikler: Etkinlik[]` prop'u; erken dönüş + `map`/`key` | `props_etkinlik_listesi`, `liste_bos_kontrolu`, `liste_map_key` |
| `src/bilesenler/KoltukPlani.tsx` | `koltuklar: Koltuk[]` prop'u; üçlü operatör + `map`/`key` | `props_koltuk_plani`, `koltuk_plani_render` |

### Bu hafta YENİ veya GÜNCELLENEN dosyalar

| Dosya | İçerik | Etiketler |
|---|---|---|
| `src/style.css` | Hf.4'ün stilinin uyarlanmış hâli; `.sepet-ozeti`, `.geri-sayim`, `.bilet-formu`/`.hata` yeni stiller | `sepet_bolum_stilleri` (Hf.4'ten kalan `bolum_baslik_stili`, `koltuk_durum_stilleri` DEĞİŞMEDEN korunur) |
| `src/context/SepetContext.tsx` | `SepetBaglami` arayüzü, `SepetContext` (`createContext<SepetBaglami \| null>(null)`), `SepetProvider` bileşeni (`useState<Koltuk[]>`, `koltukSec`, `sepetiTemizle`, `toplamTutar`); OPSİYONEL `useReducer` alternatifi (dışa aktarılır, Provider'a BAĞLANMAZ) | `sepet_baglam_tipi`, `sepet_context_olustur`, `sepet_provider`, `sepet_reducer_alternatifi` |
| `src/hooks/useSepet.ts` | `useContext(SepetContext)`'i saran, `null` ise `throw` eden özel hook | `use_sepet_hook` |
| `src/hooks/useGeriSayim.ts` | `useState`+`useEffect`+`setInterval`+temizleme ile `{ kalanSaniye, bittiMi }` döndüren özel hook | `use_geri_sayim_hook` |
| `src/bilesenler/Koltuk.tsx` | GÜNCELLENDİ: yerel `useState<KoltukDurumu>` KALDIRILDI; `useSepet()` ile `secilenKoltuklar`/`koltukSec` doğrudan Context'ten okunur; `dolu` koltuk tıklanamaz | `props_koltuk` (aynen), `koltuk_context_ve_tiklama`, `koltuk_render` |
| `src/bilesenler/BiletFormu.tsx` | `BiletFormVeri` tipi, tiplenmiş form state'i, `select`+`checkbox`, doğrulama+hata state'i, `onSubmit`+`preventDefault`, `onBiletlerOlustu` callback prop'u | `bilet_form_tipi`, `bilet_form_state`, `bilet_form_dogrula_ve_submit`, `bilet_form_render` |
| `src/bilesenler/SepetOzeti.tsx` | `useSepet()`'ten seçili koltuk sayısı ve toplam tutarı okuyup gösteren bileşen | `sepet_ozeti_bilesen` |
| `src/bilesenler/GeriSayim.tsx` | `useGeriSayim(120)` kullanan, `bittiMi` olunca `sepetiTemizle()` çağıran, mm:ss biçiminde gösteren bileşen | `geri_sayim_mantik`, `geri_sayim_render` |
| `src/App.tsx` | GÜNCELLENDİ: `App` yalnızca `SepetProvider`'ı kurar (`biletFiyati` prop'u); `AppIcerik` `koltuklar`/`biletler` state'ini tutar, belge başlığı efektini çalıştırır, bölümleri birleştirir, `biletleriOlustur`'u `BiletFormu`'ya geçirir | `app_bilesen`, `app_icerik_state`, `app_baslik_efekti`, `app_bilet_olustur`, `app_icerik_render` |

**Kod dili override:** `.tsx` dosyaları (`SepetContext.tsx`, `Koltuk.tsx`,
`BiletFormu.tsx`, `SepetOzeti.tsx`, `GeriSayim.tsx`, `App.tsx`)
`\kodkesit[tsx]{...}` ile, `.ts` dosyaları (`useSepet.ts`,
`useGeriSayim.ts`) varsayılan (`ts`) ile ders notuna çekilir.

## Kurulum / çalıştırma

```bash
cd istemci
npm install       # ya da: npm ci (package-lock.json ile)
npm run dev        # http://localhost:5173 — geliştirme sunucusu, hot reload
npm run build       # tsc -b tip kontrolü + Vite üretim derlemesi -> dist/
npm run preview     # dist/ çıktısını yerelde denemek için
```

Derlenebilirlik kapısı (bu haftanın zorunlu doğrulaması):

```bash
npm ci && npx tsc -b && npm run build
```

## Beklenen çıktılar (özet)

`npm run dev` ile sayfa ÜÇ bölüm gösterir:

- **"Etkinlikler"** — Hf.4'ten aynen, 3 etkinlik kartı.
- **"Koltuk Planı"** — `bos` bir koltuğa tıklamak artık `SepetContext`
  üzerinden sepete EKLER/ÇIKARIR (`secili` sınıfı); `dolu` işaretli
  koltuklar (B2, C4 — veri.ts'ten) hâlâ tıklanamaz.
- **"Sepet"** — `SepetOzeti` seçili koltuk sayısını ve toplam tutarı
  (`biletFiyati × sayı`) canlı gösterir; `GeriSayim` 120 saniyeden geriye
  sayar, süre dolunca sepeti otomatik temizler; `BiletFormu` (ad, koltuk
  sınıfı, kampanya onayı) gönderildiğinde her seçili koltuk için bir
  `Bilet` oluşturulur, ilgili koltuklar `'dolu'`ya döner, sepet
  TEMİZLENİR ve "Oluşturulan bilet sayısı" özeti görünür.

Sekme başlığı seçili koltuk sayısına göre değişir (`(N) KTÜ Etkinlik ve
Bilet Sistemi`). Boş ad ile gönderim "Ad alanı boş olamaz." mesajı
gösterir; hiç koltuk seçilmeden gönderim "Sepette en az bir koltuk seçili
olmalı." mesajı gösterir — her iki durumda da `Bilet[]` OLUŞTURULMAZ.

`npm run build` hatasız `dist/` üretir.

## Doğrulama kanıtı (bu ortamda, 2026-09-07)

```
$ npm ci
added 27 packages, and audited 28 packages in 707ms
found 0 vulnerabilities

$ npx tsc -b
(çıktı yok — hatasız)

$ npx tsc -b --noEmit
(çıktı yok — hatasız)

$ npm run build
> istemci@0.0.0 build
> tsc -b && vite build

vite v8.2.2 building client environment for production...
✓ 28 modules transformed.
dist/index.html                   0.47 kB │ gzip:  0.31 kB
dist/assets/index-BgfQDr0S.css    2.45 kB │ gzip:  0.87 kB
dist/assets/index-DsphEfy8.js   196.00 kB │ gzip: 61.95 kB
✓ built in 361ms
```

**Not — kapı komutunda `npx tsc -b` (Hf.4'ten değişmeyen davranış):**
Kök `tsconfig.json` yalnızca proje referansları içerir (`"files": []`),
bu yüzden bayraksız `npx tsc --noEmit` tek başına tip denetimi YAPMAZ
(no-op, her zaman 0 döner). Kapı komutu bu nedenle build modunu kullanır:
`npx tsc -b` referans projelerini gerçekten derleyip tip denetimi yapar
(`npm run build`'in ilk adımı da aynı komuttur). Zincir (`npm ci && npx
tsc -b && npm run build`) bir tip hatasında `npx tsc -b` adımında DURUR.

Ayrıca `dist/` çıktısı, geçici bir jsdom tabanlı duman testiyle (`npm
install --no-save jsdom`, test sonrası `node_modules`/`dist` tamamen
kaldırıldı; `package.json`/`package-lock.json` DEĞİŞMEDİ — SHA1
`f387f207ba788795ccf6a8e24f34ec38903c07f9`, `npm ci`'dan önce/sonra
AYNI) gerçek bir DOM ortamında çalıştırılıp doğrulanmıştır:

- 3 `Bolum` başlığı: "Etkinlikler", "Koltuk Planı", "Sepet".
- 3 etkinlik kartı, 12 koltuk (başlangıçta 2 `dolu`).
- Başlangıç sekme başlığı: `KTÜ Etkinlik ve Bilet Sistemi`; sepet özeti
  `Seçili koltuk: 0 / Toplam tutar: 0 TL`; geri sayım `2:00` ile başlıyor.
- Boş bir koltuğa tıklayınca `secili` sınıfı eklendi, sekme başlığı `(1)
  KTÜ Etkinlik ve Bilet Sistemi`'ye, sepet özeti `Seçili koltuk: 1 /
  Toplam tutar: 150 TL`'ye güncellendi; `dolu` bir koltuğa tıklamanın hiçbir
  etkisi olmadığı doğrulandı.
- Boş ad ile form gönderiminde "Ad alanı boş olamaz." hatası gösterildi,
  hiçbir bilet OLUŞTURULMADI.
- Ad doldurup gönderildiğinde: seçili koltuk `dolu` oldu, "Oluşturulan
  bilet sayısı: 1" özeti göründü, sepet özeti `Seçili koltuk: 0`'a
  döndü, sekme başlığı `KTÜ Etkinlik ve Bilet Sistemi`'ye sıfırlandı
  (`DUMAN TESTI BASARILI`).

`useGeriSayim`'in "süre bitince sepeti temizleme" mantığı (120 saniyelik
gerçek bekleme yerine) ayrı bir birim-mantık kontrolüyle DOĞRULANMIŞTIR:
`kalanSaniye <= 1 ? 0 : kalanSaniye - 1` azaltma kuralı ve `bittiMi`
bayrağının `kalanSaniye <= 0` olduğunda `true`'ya döndüğü teyit
edilmiştir; hook'un React içindeki kablolanması (`useEffect`
bağımlılığı `[bittiMi]`, temizleme `clearInterval`) `tsc -b` ile tip
düzeyinde, `GeriSayim` bileşeninin ilk render'da `2:00` göstermesi ise
yukarıdaki jsdom testiyle DOĞRULANMIŞTIR.

## Doğrulanan sürümler (bu ortamda, 2026-09-07)

Hf.3/4'te sabitlenen sürümler DEĞİŞMEMİŞTİR (bu hafta yeni paket
eklenmemiştir):

| Paket | Kurulu sürüm | Brifteki sabitlenen sürüm |
|---|---|---|
| Node.js | `v26.0.0` | Brif Node 24 LTS önerir; bu doğrulama Node 26 ile yapılmıştır (Hf.3/4'teki gibi). |
| npm | `11.12.1` | — |
| react | `19.2.8` | `^19.2.8` |
| react-dom | `19.2.8` | `^19.2.8` |
| @types/react | `19.2.18` | `^19.2.18` |
| @types/react-dom | `19.2.7` | `^19.2.7` |
| @vitejs/plugin-react | `6.1.1` | `^6.1.1` |
| typescript | `7.0.2` (`npx tsc --version`) | `^7.0.2` (Hf.3'ten DEĞİŞTİRİLMEDİ) |
| vite | `8.2.2` (`npx vite --version`) | `^8.2.2` (Hf.3'ten DEĞİŞTİRİLMEDİ) |

## Hf.4'e göre değişen dosyalar

- **YENİ:** `src/context/SepetContext.tsx`, `src/hooks/useSepet.ts`,
  `src/hooks/useGeriSayim.ts`, `src/bilesenler/BiletFormu.tsx`,
  `src/bilesenler/SepetOzeti.tsx`, `src/bilesenler/GeriSayim.tsx`.
- **GÜNCELLENDİ:** `src/bilesenler/Koltuk.tsx` (yerel `useState` yerine
  `useSepet()`), `src/App.tsx` (`App`/`AppIcerik` ayrımı, `SepetProvider`,
  belge başlığı efekti, bilet oluşturma), `src/style.css` (yeni
  `sepet_bolum_stilleri` bloğu eklendi).
- **AYNEN taşındı (diff boş):** `package.json`, `tsconfig*.json`,
  `vite.config.ts`, `index.html`, `src/main.tsx`, `src/tipler.ts`,
  `src/veri.ts`, `src/bilesenler/Bolum.tsx`, `src/bilesenler/
  EtkinlikKarti.tsx`, `src/bilesenler/EtkinlikListesi.tsx`, `src/
  bilesenler/KoltukPlani.tsx`.

## Notlar

- `istemci/node_modules/` ve `istemci/dist/` commit'lenmez (`.gitignore`).
- `kod_ornekleri/hafta04/` klasörüne dokunulmamıştır (salt-okundu).
- `useReducer` (`sepetReducer`/`SepetEylemi`) `SepetContext.tsx`'te dışa
  aktarılmıştır ama `SepetProvider` HÂLÂ `useState` kullanır (brif
  kararı: iki state-yönetim aracını aynı haftada zorunlu kılmamak).
- `Bilet` kimlikleri (`id`) sunucu olmadığı için `BiletFormu.tsx`
  içindeki basit bir modül düzeyi sayaçla (`sonrakiBiletId`) üretilir;
  Hf.6'da bu sorumluluk sunucuya taşınacaktır.
