# Hafta 10 — Kod Örnekleri / Sunucu (Kimlik Doğrulama ve Yetkilendirme)

Bu klasör Hf.8'in `sunucu/` klasörünün ÜSTÜNE büyür (Hf.9 Ara Değerlendirme
yeni kavram içermediği için doğrudan Hf.8 temel alınır). Bu haftanın alan
modeli değişikliği: `Bilet.kullanici_adi` (düz metin, Hf.3'ten beri) YERİNİ
`Bilet.kullanici_id` (gerçek bir `Kullanici` kaydına yabancı anahtar) alır —
geriye uyum GEREKMEZ. Gerçek kullanıcı hesapları (`bcrypt` ile şifre
özetleme), JWT tabanlı stateless bir oturum (`PyJWT`, OAuth2 password akışı)
ve rol tabanlı yetkilendirme (`Depends(get_current_user)` →
`Depends(get_current_admin)` zinciri, 401 vs 403 ayrımı, sahiplik kontrolü)
eklenir.

## Dosya / etiket tablosu

Hf.8'den AYNEN taşınanlar (içerik ve etiket adları DEĞİŞMEDİ): `app/
__init__.py`, `app/veritabani.py`, `app/rotalar/__init__.py`, `tests/
test_cors.py`, `requirements-dev.txt`, `sorgular.sql` (yalnızca
`sql_transaction_rezervasyon` örneğindeki sütun adı `kullanici_id`'ye
güncellendi, etiket adı DEĞİŞMEDİ).

| Dosya | İçerik | Etiketler |
|---|---|---|
| `requirements.txt` | GÜNCELLENDİ: `pyjwt`, `bcrypt`, `python-multipart`, `pydantic-settings` eklendi | `calisma_zamani_bagimliliklari` |
| `.env.example` | **YENİ**: `SECRET_KEY`/`ALGORITHM`/`ACCESS_TOKEN_EXPIRE_MINUTES` şablonu | `env_ornek` |
| `app/ayarlar.py` | **YENİ**: `pydantic-settings` ile `Ayarlar(BaseSettings)` + `get_ayarlar()` | `ayarlar_sinifi`, `get_ayarlar_fonksiyonu` |
| `app/guvenlik.py` | **YENİ**: `sifre_ozetle`/`sifre_dogrula` (`bcrypt`), `token_uret`/`token_dogrula` (`PyJWT`) | `sifre_ozetleme`, `sifre_dogrulama`, `token_uretme`, `token_dogrulama` |
| `app/orm_modeller.py` | GÜNCELLENDİ: yeni `KullaniciDB`; `BiletDB.kullanici_adi` → `BiletDB.kullanici_id` (FK) + `kullanici` relationship | `orm_kullanici_modeli` (yeni), `orm_etkinlik_modeli`/`orm_koltuk_modeli`/`orm_aktif_koltuk_indeksi` (aynen), `orm_bilet_modeli` (güncellendi) |
| `app/modeller.py` | GÜNCELLENDİ: `KullaniciKayit`/`Kullanici` (yeni), `Token` (yeni, `KamelModel`'den TÜREMEZ), `BiletOlustur`'dan `kullaniciAdi` kalktı, `Bilet`'e `kullaniciId` eklendi | `kullanici_modelleri` (yeni), `token_modeli` (yeni), `bilet_modelleri` (güncellendi), `model_taban_sinifi`/`etkinlik_modelleri`/`koltuk_modelleri` (aynen) |
| `app/bagimliliklar.py` | GÜNCELLENDİ: `oauth2_scheme`, `get_current_user` (401 dallı), `get_current_admin` (403 dallı, `get_current_user`'a zincirlenir) | `oauth2_semasi`, `get_current_user_bagimliligi`, `get_current_admin_bagimliligi` (yeni), `get_depo_bagimliligi` (aynen) |
| `app/depo.py` | GÜNCELLENDİ: `bilet_ekle(veri, kullanici_id)`, `bilet_listele(kullanici_id=None)` (None ise TÜMÜ — admin, verilirse yalnız o kullanıcı — biletlerim) | mevcut etiketler (içerik güncellendi, adlar aynen) |
| `app/rotalar/auth.py` | **YENİ**: `POST /auth/kayit` (201/409), `POST /auth/token` (form-encoded, 401/`Token`) | `auth_router`, `auth_kayit`, `auth_token` |
| `app/rotalar/biletler.py` | GÜNCELLENDİ: `GET ""` artık `Depends(get_current_admin)` (TÜM biletler); `POST ""` `Depends(get_current_user)`, gövdede yalnız `koltukId`; `DELETE "/{id}"` sahiplik kontrolü (403); prefiks'siz YENİ `biletlerim_router` (`GET /biletlerim`) | `biletler_router`/`bilet_detay` (aynen), `bilet_olustur`/`bilet_liste`/`bilet_iptal` (güncellendi), `biletlerim_router`/`biletlerim_liste` (yeni) |
| `app/rotalar/etkinlikler.py` | GÜNCELLENDİ: `POST`/`PUT`/`DELETE` artık `Depends(get_current_admin)` | `etkinlikler_router`/`etkinlik_liste`/`etkinlik_detay` (aynen), `etkinlik_olustur`/`etkinlik_guncelle`/`etkinlik_sil` (güncellendi) |
| `app/rotalar/koltuklar.py` | GÜNCELLENDİ: `POST .../koltuklar`, `DELETE /koltuklar/{id}` → admin; `PATCH /koltuklar/{id}` → yalnızca `get_current_user` (mekân kurulumu DEĞİL, müşterinin rezervasyon sürecinin parçası) | `koltuklar_router`/`koltuk_liste`/`koltuk_detay` (aynen), `koltuk_olustur`/`koltuk_sil`/`koltuk_durum_guncelle` (güncellendi) |
| `app/main.py` | GÜNCELLENDİ: `auth.router` + `biletler.biletlerim_router` router_baglama'ya eklendi | `uygulama_olustur`/`tablo_olustur`/`cors_ayari`/`kok_rota` (aynen), `router_baglama` (güncellendi) |
| `app/tohum.py` | GÜNCELLENDİ: bir `yonetici` + bir `musteri1` hesabı eklenir | `tohum_veri` (güncellendi), `tohum_calistir` (aynen) |
| `tests/conftest.py` | GÜNCELLENDİ: `yonetici_token`/`musteri_token` fixture'ları (gerçek bir istek atmadan `token_uret` ile) | `test_veritabani_fixture`/`test_istemci_fixture` (aynen), `test_kullanici_fixture`/`test_token_fixture` (yeni) |
| `tests/test_auth.py` | **YENİ**: kayıt/giriş/401 testleri | `test_kayit_basarili`, `test_kayit_cakisma`, `test_giris_basarili`, `test_giris_hatali_sifre`, `test_token_yok_401`, `test_token_gecersiz_401` |
| `tests/test_yetki.py` | **YENİ**: rota × rol yetki matrisi + sahiplik testleri | `test_okuma_herkese_acik`, `test_etkinlik_olustur_403`, `test_etkinlik_olustur_201_admin`, `test_koltuk_secme_musteri`, `test_bilet_iptal_403_sahiplik`, `test_bilet_iptal_204_sahibi`, `test_biletlerim_filtre` |
| `tests/test_biletler.py` | GÜNCELLENDİ: token ile `Authorization` başlığı, `kullaniciAdi` gövdeden kalktı | mevcut etiketler (içerik güncellendi, adlar aynen) |
| `tests/test_etkinlikler.py` | Okuma testleri AYNEN; yazma testlerinin kurulum adımları admin token ALDI | mevcut etiketler (aynen) |
| `tests/test_transaction.py` | GÜNCELLENDİ: rezervasyon istekleri token ile | mevcut etiketler (aynen) |
| `istekler.sh` | GÜNCELLENDİ: kayıt/giriş/korumalı istek örnekleri eklendi | mevcut etiketler (aynen) + `auth_kayit_curl`, `auth_token_curl`, `korumali_istek_curl` |

Tüm etiket adları `brifler/hafta10-brif.md`'deki tabloyla BİREBİR aynıdır;
hiçbir etiket iç içe değildir.

## Kurulum

Python **3.12** (asgari) gerektirir:

```bash
cd kod_ornekleri/hafta10/sunucu
python3.12 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt -r requirements-dev.txt
cp .env.example .env             # SECRET_KEY'i kendi geliştirme değerinizle değiştirin
```

`.env` dosyası `.gitignore`'DADIR (ASLA commit edilmez); `.env.example`
yalnızca bir ŞABLONdur.

## Çalıştırma

```bash
cd kod_ornekleri/hafta10/sunucu
source .venv/bin/activate
uvicorn app.main:app --reload
```

Örnek veri yüklemek için (bir `yonetici` ve bir `musteri1` hesabı DAHİL):

```bash
python -m app.tohum
```

Yönetici: `yonetici` / `yonetici123`. Müşteri: `musteri1` / `musteri123`.
`/docs` sayfasındaki Authorize butonuyla bu hesaplarla GİRİŞ denenebilir.

İstemciyle BİRLİKTE çalıştırmak için `kod_ornekleri/hafta10/istemci/
README.md`'deki adımları izleyin (`npm run dev`, port `5173`).

## Testler

```bash
python -m pytest -q
```

Hf.8'in 16 testi + bu haftanın 13 yeni testi (`test_auth.py` 6,
`test_yetki.py` 7) = **29 test**. Test veritabanı `:memory:` olduğundan
proje kökünde dosya BIRAKMAZ.

## Beklenen çıktılar (özet)

- `POST /auth/kayit` yeni bir hesap açar (`201`); aynı `kullaniciAdi`
  tekrar denenirse `409 Conflict` döner.
- `POST /auth/token` (form-encoded, `username`/`password`) geçerli
  kimlik bilgileriyle bir `access_token` döner; hatalı şifrede `401`.
- Tokensiz bir `POST /etkinlikler` `401`, müşteri token'ıyla `403`,
  yönetici token'ıyla `201` döner.
- `PATCH /koltuklar/{id}` yalnızca giriş yapmış olmayı GEREKTİRİR (yönetici
  yetkisi İSTEMEZ).
- `GET /biletlerim` giriş yapmış kullanıcının YALNIZ kendi biletlerini,
  `GET /biletler` yalnızca yöneticiye TÜM biletleri döner.
- `DELETE /biletler/{id}` başkasının biletinde `403`, kendi biletinde
  `204` döner (admin override YOKTUR).
- `python -m pytest -q` HATASIZ geçer (29 test).

## Doğrulama kanıtı (bu ortamda, 2026-09-07)

```
$ python3.12 -m venv .venv && source .venv/bin/activate
$ pip install -r requirements.txt -r requirements-dev.txt
... fastapi-0.141.1 ... pydantic-2.13.5 ... uvicorn-0.52.4 ... sqlalchemy-2.0.52 ...
    pyjwt-2.13.0 ... bcrypt-5.0.0 ... python-multipart-0.0.32 ...
    pydantic-settings-2.15.0 ... pytest-9.1.1 ... httpx-0.28.1 ...

$ python -m pytest -q
.............................
29 passed, 2 warnings in ~9s
$ ls bilet.db
ls: bilet.db: No such file or directory
```

(2 uyarı Hf.7'den DEVAM eden, framework kaynaklı `DeprecationWarning`'lerdir
— bu haftanın kodu YENİ bir uyarı EKLEMEZ.)

Sunucu arka planda başlatılıp (`uvicorn app.main:app --port 8000`) gerçek
`curl` akışıyla doğrulanmıştır:

```
$ rm -f bilet.db && uvicorn app.main:app --port 8000 &
$ python -m app.tohum
2 etkinlik, 7 koltuk, 2 kullanıcı eklendi.

$ curl -i -X POST http://127.0.0.1:8000/auth/kayit \
    -H "Content-Type: application/json" \
    -d '{"kullaniciAdi":"aysenur","eposta":"aysenur@ktu.edu.tr","sifre":"gizli-sifre-1"}'
HTTP/1.1 201 Created
{"id":3,"kullaniciAdi":"aysenur","eposta":"aysenur@ktu.edu.tr","rol":"musteri","olusturmaZamani":"..."}

# aynı kullaniciAdi ile tekrar → 409 Conflict

$ TOKEN=$(curl -s -X POST http://127.0.0.1:8000/auth/token \
    -d "username=yonetici&password=yonetici123" | python3 -c 'import sys,json;print(json.load(sys.stdin)["access_token"])')

# Tokensiz POST /etkinlikler → 401
# Müşteri token'ıyla POST /etkinlikler → 403
# Yönetici token'ıyla POST /etkinlikler → 201

$ curl -s -X POST http://127.0.0.1:8000/biletler \
    -H "Authorization: Bearer $MUSTERI_TOKEN" -d '{"koltukId":1}'
{"koltukId":1,"id":1,"kullaniciId":3,"satinAlmaZamani":"...","durum":"olusturuldu"}

$ curl -s http://127.0.0.1:8000/biletlerim -H "Authorization: Bearer $MUSTERI_TOKEN"
[{"koltukId":1,"id":1,"kullaniciId":3, ...}]

# Müşteri token'ıyla GET /biletler → 403; yönetici token'ıyla → 200 (tüm biletler)
```

## İstemci kapısı

```
$ cd ../istemci && npm ci && npx tsc -b && npm run build
✓ 104 modules transformed
✓ built in <1s
```

## Notlar / tasarım kararları

- `.venv/`, `__pycache__/`, `.pytest_cache/`, `bilet.db`, `.env`
  commit'lenmez (`.gitignore`).
- **JWT payload'ının istemci tarafında çözülmesi**: `POST /auth/token`
  yalnızca `access_token` döner, ayrı bir kullanıcı nesnesi DÖNMEZ; bu
  bilinçli bir kapsam kararıdır (`/auth/me` gibi ek bir uç nokta EKLENMEZ,
  YAGNI) — istemci tarafı JWT'nin base64url ile kodlanmış `payload`
  bölümünü ÇÖZEREK (`sub`/`rol`) Ünite 2'nin "JWT kodlamadır, şifreleme
  değildir" dersini SOMUT bir biçimde UYGULAR (bkz.
  `istemci/src/context/OturumContext.tsx`).
- **Admin override YOKTUR** (bilinçli kapsam kararı): yönetici de yalnızca
  KENDİ satın aldığı bileti iptal edebilir.
- **Kullanıcı güncelleme/silme rotaları YOKTUR**: yalnızca kayıt ve giriş
  (YAGNI, kapsam dışı).
- `sorgular.sql` yalnızca KARŞILAŞTIRMA amaçlıdır, sunucu tarafından
  ÇALIŞTIRILMAZ.
