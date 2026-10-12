# Hafta 4 — Kod Örnekleri (React I: Bileşenler)

Bu klasör Hf.3'ün `istemci/` Vite + TypeScript projesinin üzerine React
eklenerek büyümüş hâlidir. `src/tipler.ts` ve `src/veri.ts` Hf.3'ten
**AYNEN** (aynı içerik, aynı etiket adları) kopyalanmıştır; DOM'u elle
güncelleyen Hf.3 dosyaları (`etkinlikListesi.ts`, `koltukPlani.ts`,
`secimOzeti.ts`, `biletForm.ts`) bu haftaya taşınmamıştır — yerlerini
`src/bilesenler/` altındaki React bileşenleri almıştır. Hf.3'ün
`kod_ornekleri/hafta03/` klasörüne dokunulmamıştır.

Bu hafta yalnızca sabit (mock) veriyle çalışır: `fetch`/API/CORS,
`useEffect`, kontrollü form girdisi, `Context`, React Router bu haftanın
KAPSAMI DIŞINDADIR (sırasıyla Hf.5/6/7'nin konusudur). Koltuk seçimi
yalnızca `Koltuk` bileşeninin kendi içinde yaşayan yerel bir `useState`'tir.

## `istemci/` — dosya/etiket tablosu

| Dosya | İçerik | Etiketler |
|---|---|---|
| `package.json` | Proje kimliği, `scripts` (`dev`/`build`/`preview`), `dependencies` (`react`, `react-dom`), `devDependencies` | *(etiketsiz, tüm dosya — JSON istisnası)* |
| `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` | Vite `react-ts` şablonunun ürettiği proje referansları; `jsx: "react-jsx"` dahil derleyici seçenekleri | *(etiketsiz, tüm dosya — JSON istisnası)* |
| `vite.config.ts` | `@vitejs/plugin-react` eklentisinin `defineConfig` içine eklenmesi | `vite_react_eklentisi` |
| `index.html` | Vite girişi: `<div id="root"></div>` kökü + `main.tsx`'e bağlanan `<script type="module">` | `sayfa_koku` |
| `src/style.css` | Hf.3'ün `style.css`'inin uyarlanmış hâli; `.koltuk.secili`/`.koltuk.dolu` durum stilleri (Hf.3'ten AYNEN) + yeni `.bolum`/başlık stili | `koltuk_durum_stilleri`, `bolum_baslik_stili` |
| `src/tipler.ts` | `Etkinlik`, `KoltukDurumu`/`Koltuk`, `BiletDurumu`/`Bilet`, `Liste<T>` — Hf.3'ten AYNEN | `tip_etkinlik`, `tip_koltuk`, `tip_bilet`, `tip_liste_generic` |
| `src/veri.ts` | Sabit `Etkinlik[]` ve `Koltuk[]` dizileri — Hf.3'ten AYNEN | `veri_etkinlikler`, `veri_koltuklar` |
| `src/main.tsx` | `createRoot` ile `App` bileşenini `#root`'a bağlama (`StrictMode` içinde) | `main_giris` |
| `src/App.tsx` | `veri.ts`'ten gelen dizileri `Bolum` (children) ile sarmalanmış iki bölümde `EtkinlikListesi`/`KoltukPlani`'ya prop olarak geçirme | `app_bilesen` |
| `src/bilesenler/Bolum.tsx` | `children: ReactNode` alan küçük bir başlıklı sarmalayıcı bileşen | `bilesen_bolum_children` |
| `src/bilesenler/EtkinlikKarti.tsx` | `etkinlik: Etkinlik` prop'unu alıp Hf.2'nin `article.etkinlik-karti` yapısını üreten bileşen; fiyat 0 ise üçlü operatörle "Ücretsiz" rozeti | `props_etkinlik_karti`, `bilesen_etkinlik_karti` |
| `src/bilesenler/EtkinlikListesi.tsx` | `etkinlikler: Etkinlik[]` prop'u; boş dizi için erken dönüş; `map`+`key` ile `EtkinlikKarti` listesi | `props_etkinlik_listesi`, `liste_bos_kontrolu`, `liste_map_key` |
| `src/bilesenler/Koltuk.tsx` | `koltuk: Koltuk` prop'u; `useState<KoltukDurumu>` ile yerel durum; `onClick` ile `bos`↔`secili` geçişi (`dolu` tıklanamaz, `&&` ile "Dolu" rozeti) | `props_koltuk`, `koltuk_state_ve_tiklama`, `koltuk_render` |
| `src/bilesenler/KoltukPlani.tsx` | `koltuklar: Koltuk[]` prop'u; boş dizi için üçlü operatörle mesaj; `map`+`key` ile `Koltuk` ızgarası | `props_koltuk_plani`, `koltuk_plani_render` |

## Kurulum / çalıştırma

```bash
cd istemci
npm install       # ya da: npm ci (package-lock.json ile)
npm run dev        # http://localhost:5173 — geliştirme sunucusu, hot reload
npm run build       # proje referanslarıyla tsc -b tip kontrolü + Vite üretim derlemesi -> dist/
npm run preview     # dist/ çıktısını yerelde denemek için
```

Derlenebilirlik kapısı (bu haftanın zorunlu doğrulaması):

```bash
npm ci && npx tsc -b && npm run build
```

## Beklenen çıktılar (özet)

`npm run dev` ile `http://localhost:5173` açıldığında sayfa iki `Bolum`
başlıklı bölüm gösterir:

- **"Etkinlikler"** bölümünde `veri_etkinlikler`'deki 3 etkinlik kart olarak
  görünür (Kariyer Günleri'nin bilet fiyatı 0 olduğundan "Ücretsiz"
  rozetiyle gösterilir).
- **"Koltuk Planı"** bölümünde `veri_koltuklar`'daki 3×4 ızgara görünür;
  `bos` bir koltuğa tıklandığında rengi "seçili" durumuna döner ve tekrar
  tıklanınca geri döner; `dolu` işaretli koltuklar (B2, C4) tıklanamaz ve
  üzerlerinde "Dolu" rozeti görünür.
- Hiçbir koltuğun seçilmesi başka bir koltuğu ya da bir toplam sayacı
  ETKİLEMEZ — koltuk seçimi yalnızca `Koltuk` bileşeninin kendi
  `useState`'inde yaşar, bu haftanın bilinçli sınırıdır (Hf.5'in konusu).

`npm run build` hatasız biçimde `dist/index.html` + `dist/assets/*` üretir.

## Doğrulama kanıtı (bu ortamda, 2026-09-07)

```
$ npm ci
added 27 packages, and audited 28 packages in 1s
found 0 vulnerabilities

$ npx tsc -b
(çıktı yok — hatasız)

$ npm run build
> istemci@0.0.0 build
> tsc -b && vite build

vite v8.2.2 building client environment for production...
✓ 22 modules transformed.
dist/index.html                   0.47 kB │ gzip:  0.31 kB
dist/assets/index-MSg5mKUT.css    1.68 kB │ gzip:  0.69 kB
dist/assets/index-DxEGoaOF.js   192.80 kB │ gzip: 60.76 kB
✓ built in 377ms
```

Ayrıca geçici bir jsdom tabanlı duman testiyle (`npm install --no-save
jsdom`, test sonrası kaldırıldı; `package.json`/`package-lock.json`
değişmedi) `dist/` çıktısı gerçek bir DOM ortamında çalıştırılıp
doğrulanmıştır: 2 `Bolum` başlığı, 3 etkinlik kartı (1 "Ücretsiz" rozetli),
12 koltuk (2 `dolu`, `disabled`), boş bir koltuğa tıklayınca `secili`
sınıfının eklenip tekrar tıklayınca kalktığı ve `dolu` bir koltuğa
tıklamanın hiçbir etkisi olmadığı doğrulanmıştır (`DUMAN TESTI BASARILI`).

**Not — kapı komutunda `npx tsc -b`:** Vite `react-ts` şablonunun ürettiği
kök `tsconfig.json` yalnızca proje referansları içerir (`"files": []`), bu
yüzden bayraksız `npx tsc --noEmit` tek başına tip denetimi YAPMAZ (no-op,
her zaman 0 döner) — Vite'ın standart `react-ts` iskeletinin bilinen bir
davranışıdır. Kapı komutu bu nedenle Hf.4'ten itibaren build modunu
kullanır: `npx tsc -b` referans projelerini (`tsconfig.app.json`,
`tsconfig.node.json`) gerçekten derleyip tip denetimi yapar; `npm run
build`'in ilk adımı da aynı komuttur. Bu davranış manuel olarak (kasıtlı
bir tip hatası eklenip `tsc -b`'nin bunu yakaladığı, düz `tsc --noEmit`'in
yakalamadığı) test edilerek doğrulanmıştır.

## Doğrulanan sürümler (bu ortamda, 2026-09-07)

| Paket | Kurulu sürüm | Brifteki sabitlenen sürüm |
|---|---|---|
| Node.js | `v26.0.0` | Brif Node 24 LTS önerir (`engines`: `"node": "^24.13.0 \|\| >=24.13.0"`); bu doğrulama Node 26 ile yapılmıştır (Hf.3'teki gibi). |
| npm | `11.12.1` | — |
| react | `19.2.8` | `^19.2.8` |
| react-dom | `19.2.8` | `^19.2.8` |
| @types/react | `19.2.18` | `^19.2.18` |
| @types/react-dom | `19.2.7` | `^19.2.7` |
| @vitejs/plugin-react | `6.1.1` | `^6.1.1` |
| typescript | `7.0.2` (`npx tsc --version`) | `^7.0.2` (Hf.3'ten DEĞİŞTİRİLMEDİ) |
| vite | `8.2.2` (`npx vite --version`) | `^8.2.2` (Hf.3'ten DEĞİŞTİRİLMEDİ) |
| @types/node | `^24.13.3` (`package.json`'da sabitlendi) | `^24.13.3` (Hf.3'ten DEĞİŞTİRİLMEDİ) |

## Notlar

- `istemci/node_modules/` ve `istemci/dist/` commit'lenmez (`.gitignore`).
- `kod_ornekleri/hafta03/` klasörüne dokunulmamıştır (salt-okundu).
- Vite `react-ts` şablonunun ürettiği demo dosyaları (`App.css`,
  `index.css`, `src/assets/`, `public/`, `.oxlintrc.json`, şablon
  `README.md`) bu projeye dahil edilmemiştir — yalnızca brifte adı geçen
  dosyalar tutulmuştur.
- Ünite 3'te tanımlanan `Etkinlik`/`Koltuk`/`Bilet`/`KoltukDurumu`/
  `BiletDurumu` tipleri Hf.3'teki tanımla BİREBİR aynıdır (dosya diff'i
  boş).
