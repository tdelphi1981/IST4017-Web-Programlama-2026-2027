# Hafta 8 — Kod Örnekleri / Sunucu (Veritabanı: SQLAlchemy ve Kalıcılık)

Bu klasör Hf.7'nin `sunucu/` klasörünün ÜSTÜNE büyür. Hf.6-7'nin API
sözleşmesi (rota adları, durum kodları, camelCase JSON alanları) HİÇ
DEĞİŞMEZ; bu haftanın TEK gerçek değişikliği `app/depo.py`'nin İÇİNİN
bellekten (dict) veritabanına (SQLAlchemy 2.x ORM + SQLite) taşınmasıdır —
"iyi bir API sözleşmesi deponun NASIL çalıştığını GİZLER" dersinin somut
kanıtı. Sunucu ilk çalıştırıldığında proje kökünde bir `bilet.db` dosyası
oluşur ve tüm etkinlik/koltuk/bilet verisi artık KALICIDIR (`uvicorn
--reload` dahil, hatta bilgisayar kapanıp açılsa bile). Aynı koltuğu iki
kullanıcının aynı anda alması iş kuralı (`409 Conflict`) artık GERÇEK bir
veritabanı transaction'ıyla (`BEGIN IMMEDIATE` + kısmi `UNIQUE` indeks)
güvence altındadır. Liste uç noktaları sayfalama (`?sayfa=&boyut=`) kazandı;
bir etkinliğin silinmesi artık satılmış bileti YOKSA bağlı koltukları da
kademeli (cascade) silen, satılmış bileti VARSA `409` ile reddeden tutarlı
bir kural izler.

## Dosya / etiket tablosu

Hf.7'den AYNEN taşınanlar (içerik ve etiket adları DEĞİŞMEDİ):
`app/__init__.py`, `app/rotalar/__init__.py`, `app/rotalar/koltuklar.py`,
`app/rotalar/biletler.py`, `tests/test_cors.py`, `requirements-dev.txt`.
`app/modeller.py` İÇERİK olarak DEĞİŞMEZ (yalnız artık `app/orm_modeller.py`
adlı AYRI bir dosyadan ayrışmış olması — Pydantic sözleşmesi vs. ORM
satırı — dosya adlarının kendisinde bile görünür).

| Dosya | İçerik | Etiketler |
|---|---|---|
| `requirements.txt` | GÜNCELLENDİ: `sqlalchemy~=2.0` eklendi | `calisma_zamani_bagimliliklari` |
| `app/veritabani.py` | **YENİ**: `engine`, `SessionLocal`, `Base` (`DeclarativeBase`), `get_db()` üreteç bağımlılığı; ayrıca SQLite'ı her transaction'da `BEGIN IMMEDIATE` ile başlatan bir engine olayı (`sqlite_yazma_kilidi_uygula`, etiketsiz yardımcı fonksiyon) | `veritabani_engine`, `veritabani_taban`, `veritabani_oturum_fabrikasi`, `get_db_uretec` |
| `app/orm_modeller.py` | **YENİ**: `EtkinlikDB`, `KoltukDB` (`ForeignKey`, `relationship`, `cascade="all, delete-orphan"`), `BiletDB` (`ForeignKey`); kısmi `UNIQUE` indeks (`Index(..., sqlite_where=...)`) | `orm_etkinlik_modeli`, `orm_koltuk_modeli`, `orm_bilet_modeli`, `orm_aktif_koltuk_indeksi` |
| `app/depo.py` | GÜNCELLENDİ: `Depo.__init__(self, db: Session)`; tüm CRUD metotları artık ORM sorgularıyla çalışır; `etkinlik_sil` cascade+409 kontrolünü, `bilet_ekle` TEK-transaction rezervasyon mantığını (kontrol + doldur + yaz + `IntegrityError` yakalama) İÇERİR | `depo_sinifi`, `depo_etkinlik_metotlari`, `depo_koltuk_metotlari`, `depo_bilet_rezervasyon_transaction`, `depo_etkinlik_sil_cascade` |
| `app/bagimliliklar.py` | GÜNCELLENDİ: `get_depo(db: Session = Depends(get_db)) -> Depo: return Depo(db)` — ZİNCİRLEME bağımlılık | `get_depo_bagimliligi` |
| `app/rotalar/etkinlikler.py` | GÜNCELLENDİ: `GET ""` artık `sayfa: int = 1`, `boyut: int = 20` sorgu parametreleri alır (dönüş tipi hâlâ `list[Etkinlik]`); `DELETE "/{etkinlik_id}"` artık 409 (satılmış bilet varsa) / 204 (cascade silme) iki dallı | `etkinlikler_router` (aynen), `etkinlik_liste` (güncellendi), `etkinlik_detay` (aynen), `etkinlik_olustur` (aynen), `etkinlik_guncelle` (aynen), `etkinlik_sil` (güncellendi) |
| `app/main.py` | GÜNCELLENDİ: `cors_ayari`/`kok_rota`/`router_baglama` AYNEN korunur; ARADA yeni bir blok: uygulama başlarken `Base.metadata.create_all(engine)` çağrısı | `uygulama_olustur` (aynen), `tablo_olustur` (yeni), `cors_ayari` (aynen), `kok_rota` (aynen), `router_baglama` (aynen) |
| `app/tohum.py` | **YENİ**: 2 örnek etkinlik + 7 koltuk ekleyen betik; `python -m app.tohum` ile çalışır | `tohum_veri`, `tohum_calistir` |
| `tests/conftest.py` | GÜNCELLENDİ: test için AYRI, belleğe kurulu bir SQLite (`sqlite:///:memory:`, `StaticPool`, `check_same_thread=False`); her testte `create_all`/`drop_all`; `app.dependency_overrides[get_db]` ile ENJEKTE edilir | `test_veritabani_fixture`, `test_istemci_fixture` |
| `tests/test_etkinlikler.py` | Hf.6/7'den AYNEN mantık (oluşturma, listeleme, `mekan` filtresi, 404, `PUT`, 422) + **YENİ** sayfalama testi + **YENİ** cascade/409 silme testleri | mevcut etiketler (aynen) + `test_etkinlik_sayfalama`, `test_etkinlik_sil_cascade` |
| `tests/test_biletler.py` | Hf.6/7'den AYNEN (kalıcılık artık SQLite üzerinden doğrulanır) | mevcut etiketler (aynen) |
| `tests/test_transaction.py` | **YENİ**: aynı koltuğa ARDIŞIK iki `POST /biletler` → ikincisi `409`; OPSİYONEL bir `threading` testi ile GERÇEKTEN eşzamanlı iki istek → yalnızca biri `201`, diğeri `409` | `test_ardisik_rezervasyon_409`, `test_esz_zamanli_rezervasyon_threading` |
| `sorgular.sql` | **YENİ**: ORM'in `echo=True` ile üreteceği SQL'in elle yazılmış karşılıkları (listeleme, join, sayfalama, transaction, kısmi UNIQUE indeks) | `sql_etkinlik_listele`, `sql_koltuk_join`, `sql_sayfalama`, `sql_transaction_rezervasyon`, `sql_aktif_koltuk_unique_indeks` |
| `istekler.sh` | GÜNCELLENDİ: Hf.7'den AYNEN taşınan `curl` turuna sayfalama örneği EKLENDİ | mevcut etiketler (aynen) + `etkinlik_sayfalama_curl` |

Tüm etiket adları `brifler/hafta08-brif.md`'deki tabloyla BİREBİR aynıdır;
hiçbir etiket iç içe değildir.

## Kurulum

Python **3.12** (asgari) gerektirir:

```bash
cd kod_ornekleri/hafta08/sunucu
python3.12 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt -r requirements-dev.txt
```

## Çalıştırma

```bash
cd kod_ornekleri/hafta08/sunucu
source .venv/bin/activate
uvicorn app.main:app --reload
```

Sunucu `http://127.0.0.1:8000` adresinde dinlemeye başlar; ilk çalıştırmada
proje kökünde bir `bilet.db` dosyası OLUŞUR (`ls` ile görünür). Örnek veri
yüklemek için (ayrı bir terminalde, sunucu ÇALIŞMASA da olur):

```bash
python -m app.tohum
```

Sunucuyu durdurup (`Ctrl+C`) tekrar `uvicorn app.main:app --reload` ile
başlattığınızda `GET /etkinlikler` AYNI verileri döndürmeye devam eder —
veri artık kalıcıdır.

İstemciyle BİRLİKTE çalıştırmak için `kod_ornekleri/hafta08/istemci/
README.md`'deki adımları izleyin (`npm run dev`, port `5173`) — istemci
Hf.7'den **hiçbir satır değişmeden** kopyalanmıştır.

## Testler

```bash
python -m pytest -q
```

Hf.7'nin 11 testi + bu haftanın 5 yeni testi (sayfalama, cascade/409 silme
×2, ardışık rezervasyon 409, opsiyonel eşzamanlı threading testi) =
**16 test**. Test veritabanı `:memory:` olduğundan proje kökünde dosya
BIRAKMAZ (`tests/conftest.py`'deki oturum kapsamlı temizlik fixture'ı,
`app/main.py`'nin içe aktarma anında ürettiği BOŞ `bilet.db` şema
dosyasının izini de siler).

## Beklenen çıktılar (özet)

- `GET /etkinlikler?sayfa=1&boyut=2` en fazla İKİ kayıt döner.
- Bir koltuğa ARDIŞIK iki `POST /biletler` isteği gönderildiğinde İKİNCİSİ
  `409 Conflict` döner (transaction koruması).
- Satılmış bileti OLAN bir etkinliği silmeye çalışmak `409 Conflict` döner
  (`"Bu etkinliğin satılmış biletleri var, önce iptal edilmelidir"`).
- Satılmamış bir etkinliği silmek `204 No Content` döner ve bağlı koltuklar
  da OTOMATİK silinir (cascade) — silinen etkinliğin koltuk listesi artık
  `404` döner.
- `python -m pytest -q` HATASIZ geçer.

## Doğrulama kanıtı (bu ortamda, 2026-09-07)

```
$ python3.12 -m venv .venv && source .venv/bin/activate
$ pip install -r requirements.txt -r requirements-dev.txt
... fastapi-0.141.1 ... pydantic-2.13.5 ... uvicorn-0.52.4 ... sqlalchemy-2.0.52 ...
    pytest-9.1.1 ... httpx-0.28.1 ...

$ python -m pytest -q
................
16 passed, 2 warnings in 0.21s
$ ls bilet.db
ls: bilet.db: No such file or directory
```

(2 uyarı Hf.7'den DEVAM eden, framework kaynaklı `DeprecationWarning`'lerdir
— `starlette.testclient`in `httpx` kullanımıyla ilgilidir, bu haftanın kodu
YENİ bir uyarı EKLEMEZ.)

Sunucu arka planda başlatılıp (`uvicorn app.main:app --port 8000`) gerçek
`curl`/betik akışıyla doğrulanmıştır:

```
$ rm -f bilet.db && uvicorn app.main:app --port 8000 &
$ ls bilet.db
bilet.db

$ python -m app.tohum
2 etkinlik, 7 koltuk eklendi.

# Sunucuyu durdurup TEKRAR başlattıktan sonra:
$ curl -s http://127.0.0.1:8000/etkinlikler
[{"baslik":"Bahar Konseri", ..., "id":1}, {"baslik":"Kış Masalı", ..., "id":2}]
# → veri YENİDEN başlatma sonrasında da YERİNDE (kalıcılık doğrulandı)

$ curl -s -i -X POST http://127.0.0.1:8000/biletler \
    -H "Content-Type: application/json" \
    -d '{"koltukId": 1, "kullaniciAdi": "Ayse Yilmaz"}'
HTTP/1.1 201 Created

$ curl -s -i -X POST http://127.0.0.1:8000/biletler \
    -H "Content-Type: application/json" \
    -d '{"koltukId": 1, "kullaniciAdi": "Mehmet Demir"}'
HTTP/1.1 409 Conflict
{"detail":"Bu koltuk zaten satılmış"}

$ curl -s -i -X DELETE http://127.0.0.1:8000/etkinlikler/1   # satılmış bileti VAR
HTTP/1.1 409 Conflict
{"detail":"Bu etkinliğin satılmış biletleri var, önce iptal edilmelidir"}

$ curl -s -i -X DELETE http://127.0.0.1:8000/etkinlikler/2   # satılmış bileti YOK
HTTP/1.1 204 No Content

$ curl -s -i http://127.0.0.1:8000/etkinlikler/2
HTTP/1.1 404 Not Found
```

## İstemci kapısı (değişmedi, yalnız "kopya bozulmadı mı" kontrolü)

```
$ cd ../istemci && npm ci && npx tsc -b && npm run build
... 97 modules transformed ...
✓ built in 490ms
```

`kod_ornekleri/hafta08/istemci/` klasörü Hf.7'nin `istemci/` klasörünün
BİREBİR kopyasıdır — tek bir satır, tek bir etiket adı DEĞİŞMEMİŞTİR.

## Notlar / tasarım kararları

- `.venv/`, `__pycache__/`, `.pytest_cache/`, `bilet.db` commit'lenmez
  (`.gitignore`).
- **`BEGIN IMMEDIATE` uygulaması**: brif hem "`connection.execute(text(
  "BEGIN IMMEDIATE"))`" hem de "engine'in `isolation_level` ayarı"
  seçeneklerini sunar; bu kodda İKİNCİ yol seçilmiştir —
  `app/veritabani.py`'deki `sqlite_yazma_kilidi_uygula(engine)` yardımcı
  fonksiyonu, pysqlite'ın kendi örtük `BEGIN`'ini kapatıp her Session
  transaction'ının `BEGIN IMMEDIATE` ile başlamasını sağlar. Bu, ham
  `text("BEGIN IMMEDIATE")` çağrısını doğrudan bir ORM `Session`'ın
  üzerinde elle tetiklemenin (Session'ın kendi transaction takibiyle
  çakışma riski taşıyan) kırılganlığından KAÇINIR; `app/depo.py`'deki
  `bilet_ekle` bu nedenle sade kalır — "kontrol et + dolu yap + yaz" TEK
  bir `db.commit()` sınırında yapılır, kilit mekanizması engine seviyesinde
  ŞEFFAFTIR.
- **Opsiyonel eşzamanlılık testi**: `test_esz_zamanli_rezervasyon_threading`
  diğer testlerin paylaştığı tek-bağlantılı `:memory:` veritabanını
  KULLANMAZ (StaticPool ile TEK bir DBAPI bağlantısı paylaşıldığından,
  gerçek dosya kilidi senaryosunu doğru SİMÜLE ETMEZ); bunun yerine kendi
  geçici dosya tabanlı SQLite veritabanını (ayrı gerçek bağlantılarla)
  kurar — bu sayede SQLite'ın GERÇEK dosya kilidi iki thread arasında
  doğru gözlemlenir. 5 kez ardışık çalıştırılarak KARARLILIĞI
  doğrulanmıştır.
  Bağlantıya `timeout=30` (SQLite busy timeout) verilir: ikinci iş
  parçacığının `BEGIN IMMEDIATE`'i ilk transaction commit edilene kadar en çok
  30 s bekler; varsayılan 5 s yüklü bir makinede testi kararsızlaştırıyordu.
- `etkinlik_sil` metodu bir `Literal`/`str` sonuç döner
  (`"silindi"`/`"bulunamadi"`/`"aktif_bilet_var"`); rota bu sonucu
  `404`/`409`/`204`'e çevirir — Hf.6-7'nin `bool` dönen basit deseninin bu
  haftaki genişlemesidir.
- `app/rotalar/biletler.py` **AYNEN** kalır (brif kararı): rota hâlâ bir
  ön-kontrol (`koltuk.durum == "dolu"` → 409) yapar, ardından
  `depo.bilet_ekle`'yi çağırır. GERÇEK transaction güvencesi artık
  `depo.bilet_ekle`'nin İÇİNDEDİR (koltuğu YENİDEN, aynı Session/transaction
  içinde kontrol eder) — rota HTTPException fırlatmasa bile, `Depo`
  katmanının kendisi 404/409 fırlatabilir ve FastAPI bunu normal şekilde
  yakalar; rotanın `depo.koltuk_guncelle(koltuk.id, "dolu")` çağrısı bu
  noktada zararsız bir tekrar (no-op) işlemidir.
