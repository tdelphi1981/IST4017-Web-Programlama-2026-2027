# Hafta 3 — Kod Örnekleri

Bu klasör iki bağımsız alt klasöre ayrılır:

- **`js-temel/`** — Ünite 1'in saf JavaScript dil-modeli örnekleri. Vite/npm
  gerektirmez; her dosya doğrudan `node dosya.js` (ya da `.mjs` dosyalar için
  aynı komut) ile çalıştırılır.
- **`istemci/`** — Ünite 2-4'ün Vite + vanilla-ts projesi. Hafta 2'nin
  `index.html`/`etkinlik-detay.html`/`stiller.css` dosyaları tek bir Vite
  girişinde (`istemci/index.html`) birleştirilmiş, TypeScript ile davranış
  eklenmiştir. React bu haftaya henüz girmez (Hf.4'te aynı klasöre eklenir).

## `js-temel/` — dosya/etiket tablosu

| Dosya | İçerik | Etiketler |
|---|---|---|
| `deger-referans.js` | İlkel değer kopyalama vs dizi/nesne referans paylaşımı | `deger_referans` |
| `fonksiyonlar.js` | Fonksiyon bildirimi/ifadesi karşılaştırması; ok fonksiyonu `this` bağlamı | `fonksiyon_tanimlari`, `ok_fonksiyonu_this` |
| `closure.js` | `olusturSayac()` closure örneği | `closure_sayac` |
| `nesne-dizi.js` | Nesne literal; `map`/`filter`/`find`; spread ile sığ kopyalama | `nesne_literal`, `dizi_metotlari`, `spread_kopyalama` |
| `prototip-sinif.js` | Prototipe elle özellik ekleme vs `class`/`extends` | `prototip_zinciri`, `sinif_sozdizimi` |
| `modul-disa-aktar.mjs` | `export` ile fiyat hesaplama fonksiyonu | `modul_disa_aktar` |
| `modul-ice-aktar.mjs` | `import` ile önceki dosyadan fonksiyonu kullanma | `modul_ice_aktar` |
| `olay-dongusu.js` | `console.log` + `setTimeout(fn, 0)` + `Promise.resolve().then()` sırası | `olay_dongusu_sirasi` |
| `promise-async.js` | Gecikmeli işlemin `.then()` zinciri ile ve `async`/`await` ile yazımı | `promise_zinciri`, `async_await_ornek` |

### Kurulum / çalıştırma

Ekstra kurulum gerekmez, yalnızca Node.js. Her dosya bağımsız çalışır:

```bash
cd js-temel
node deger-referans.js
node fonksiyonlar.js
node closure.js
node nesne-dizi.js
node prototip-sinif.js
node modul-ice-aktar.mjs   # modul-disa-aktar.mjs'i içe aktarır, ayrı çalıştırılmaz
node olay-dongusu.js
node promise-async.js
```

### Beklenen çıktılar (özet)

- `deger-referans.js`: `a: 5`; `dizi1: [ 1, 2, 3, 4 ]`; `sayilar: [ 1, 2, 3, 99 ]`.
- `fonksiyonlar.js`: `carp(3, 4): 12`; `topla(3, 4): 7`; `artirNormal sonrası deger: 1`; `artirOk içindeki this sayac mı? false`.
- `closure.js`: `sayac1(): 1`, `2`; `sayac2(): 1`; `sayac1(): 3` — `sayac2` `sayac1`'den bağımsızdır.
- `nesne-dizi.js`: `adlar` 3 elemanlı; `buyukEtkinlikler` kapasitesi ≥500 olan 2 etkinlik; `tiyatro` Tiyatro Gecesi nesnesi; kopyalar orijinali etkilemez (`etkinlikler.length: 3`, `etkinlik.kapasite: 500`).
- `prototip-sinif.js`: `Merhaba, ben Ayşe` / `Merhaba, ben Mehmet`; `kendi özelliği mi? false`; `selamla prototipte mi? true`.
- `modul-ice-aktar.mjs`: `toplam: 450`.
- `olay-dongusu.js`: sıra **A, D, C, B** (senkron kod önce, sonra mikro görev/Promise, en son makro görev/setTimeout).
- `promise-async.js`: `[then]`/`[async]` istek logları hemen, ardından ~200ms sonra sonuç logları (then zinciri Ayşe için, async/await Mehmet için).

## `istemci/` — dosya/etiket tablosu

| Dosya | İçerik | Etiketler |
|---|---|---|
| `package.json` | Proje kimliği, `scripts`, `dependencies`/`devDependencies` | *(etiketsiz, tüm dosya — JSON istisnası)* |
| `tsconfig.json` | `strict`/derleyici seçenekleri (Vite şablonundan gelen) | *(etiketsiz, tüm dosya — JSON istisnası)* |
| `index.html` | Vite girişi: Hf.2'nin `header`/`nav`/`main`/`footer` iskeleti tek sayfada; etkinlik listesi + koltuk planı/bilet formu bölümleri; `main.ts`'e bağlanan script | `sayfa_iskeleti`, `script_baglama` |
| `src/style.css` | Hf.2'nin `stiller.css`'inin uyarlanmış hâli + `.koltuk.secili`/`.koltuk.dolu` durum stilleri | `koltuk_durum_stilleri` |
| `src/tipler.ts` | `Etkinlik`, `KoltukDurumu`/`Koltuk`, `BiletDurumu`/`Bilet` arayüzleri; `Liste<T>` generic | `tip_etkinlik`, `tip_koltuk`, `tip_bilet`, `tip_liste_generic` |
| `src/veri.ts` | Sabit `Etkinlik[]` (3 etkinlik) ve `Koltuk[]` (3×4 ızgara) dizileri | `veri_etkinlikler`, `veri_koltuklar` |
| `src/etkinlikListesi.ts` | `etkinlikler`'den DOM ile kart listesi üretme | `etkinlik_listesi_uret` |
| `src/koltukPlani.ts` | Koltuk ızgarasını DOM ile üretme; `click` dinleyicisi (`bos` ↔ `secili`, `dolu` tıklanamaz) | `koltuk_plani_uret`, `koltuk_tiklama` |
| `src/secimOzeti.ts` | Seçili koltuk sayısı/toplam tutarı hesaplayıp DOM'u güncelleme | `secim_ozeti_guncelle` |
| `src/biletForm.ts` | Formun `submit`'inde `preventDefault()`; `async` `biletOlustur()` (setTimeout+Promise) | `form_onSubmit`, `bilet_olustur_async` |
| `src/main.ts` | Tüm modülleri içe aktarıp sayfayı ilk kez oluşturan giriş noktası | `main_giris` |

### Kurulum / çalıştırma

```bash
cd istemci
npm install       # ya da: npm ci (package-lock.json ile)
npm run dev        # http://localhost:5173 — geliştirme sunucusu, hot reload
npm run build       # tsc tip kontrolü + Vite üretim derlemesi -> dist/
npm run preview     # dist/ çıktısını yerelde denemek için
```

Derlenebilirlik kapısı (bu haftanın zorunlu doğrulaması):

```bash
npm ci && npx tsc --noEmit && npm run build
```

### Beklenen çıktılar (özet)

`npm run dev` ile `http://localhost:5173` açıldığında:

- Etkinlik listesi bölümü `veri.ts`'teki 3 etkinlikten (Bahar Konseri,
  Kariyer Günleri, Tiyatro Gecesi) üretilmiş 3 kart gösterir.
- Koltuk planı 3×4'lük bir ızgaradır; B2 ve C4 koltukları başlangıçta
  `dolu` (tıklanamaz) işaretlidir, diğerleri `bos`'tur.
- Boş bir koltuğa tıklandığında rengi "seçili" durumuna döner ve
  "Seçili koltuk: N, Toplam: X TL" metni (X = N × 150, Bahar Konseri'nin
  bilet fiyatı) anlık günceller; aynı koltuğa tekrar tıklayınca `bos`'a
  döner. "Dolu" koltuklara tıklamanın hiçbir etkisi olmaz.
- Bilet formunda "Gönder"e basıldığında sayfa YENİLENMEZ (`preventDefault`);
  tarayıcı konsoluna seçim özeti (`{ kullaniciAdi, koltukIdleri }`) hemen,
  ardından yaklaşık 1 saniye sonra `Bilet oluşturuldu: { id, koltukId,
  kullaniciAdi, satinAlmaZamani, durum: 'olusturuldu' }` biçiminde bir onay
  logu yazılır.

`npm run build` hatasız biçimde `dist/index.html` + `dist/assets/*` üretir.

## Doğrulanan sürümler (bu ortamda, 2026-09-07)

| Araç | Kurulu/kullanılan sürüm | Not |
|---|---|---|
| Node.js | `v26.0.0` | Makinede kurulu; **Current**'tir, LTS değildir. Brif öğrenciye **Node 24 LTS**'i önerir (`package.json` `engines`: `"node": "^24.13.0 \|\| >=24.13.0"`); bu sürüm kısıtı Node 26 ile de derlenip çalışır — bu doğrulama Node 26 ile yapılmıştır. |
| npm | `11.12.1` | Node ile birlikte gelen sürüm. |
| TypeScript | `7.0.2` (`npx tsc --version`) | `package.json`: `"typescript": "^7.0.2"` — brifteki sabitlenen sürümle birebir. |
| Vite | `8.2.2` | `package.json`: `"vite": "^8.2.2"` — brifteki sabitlenen sürümle birebir. |
| @types/node | `^24.13.3` (`package.json`'da sabitlendi) | npm'deki en güncel `@types/node` (26.4.1) DEĞİL, brifin istediği Node 24 majör hattıyla eşleşen sürüm bilinçli olarak seçildi. |

## Notlar

- `js-temel/` ve `istemci/` birbirinden bağımsızdır; `istemci/` kendi başına
  `npm install` gerektirir, `js-temel/` hiçbir kurulum gerektirmez.
- `istemci/node_modules/` ve `istemci/dist/` commit'lenmez (`.gitignore`).
- Hf.2'nin `kod_ornekleri/hafta02/` dosyalarına dokunulmamıştır; bu haftanın
  `istemci/index.html` ve `src/style.css` dosyaları o dosyalardan
  uyarlanmıştır (bkz. `kod_ornekleri/hafta02/README.md`).
- Ünite 3'te tanımlanan `Etkinlik`/`Koltuk`/`Bilet`/`KoltukDurumu`/
  `BiletDurumu` tipleri brifteki tanımla BİREBİR aynıdır; Hf.4-7 bu tipleri
  değiştirmeden kullanacaktır.
