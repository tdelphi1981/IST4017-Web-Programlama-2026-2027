# Hafta 7 — Kod Örnekleri / Sunucu (İstemci-Sunucu Bütünleşmesi)

Bu klasör Hf.6'nın `sunucu/` klasörünün **bağımsız bir kopyasıdır**;
Hf.6'nın tüm rota/model/durum kodu kararları BİREBİR korunur. Bu haftanın
**TEK** değişikliği `app/main.py`'ye eklenen bir CORS bloğudur (`cors_ayari`)
— tarayıcıdan (`kod_ornekleri/hafta07/istemci/`) gelen `fetch` isteklerinin
önündeki aynı-origin engelini kaldırır. Veritabanı/kalıcılık hâlâ YOKTUR
(Hf.8'in konusu): süreç `--reload` ile yeniden başladığında tüm veri kaybolur.

## Dosya / etiket tablosu

Hf.6'dan AYNEN taşınanlar (içerik ve etiket adları DEĞİŞMEDİ):
`requirements.txt`, `requirements-dev.txt`, `app/__init__.py`,
`app/modeller.py`, `app/depo.py`, `app/bagimliliklar.py`,
`app/rotalar/__init__.py`, `app/rotalar/etkinlikler.py`,
`app/rotalar/koltuklar.py`, `app/rotalar/biletler.py`, `tests/conftest.py`,
`tests/test_etkinlikler.py`, `tests/test_biletler.py`, `istekler.sh`.

| Dosya | İçerik | Etiketler |
|---|---|---|
| `app/main.py` | `FastAPI` nesnesi (`uygulama_olustur`, aynen), **YENİ** `CORSMiddleware` bloğu (`cors_ayari`), kök rota (`kok_rota`, aynen), router bağlama (`router_baglama`, aynen) | `uygulama_olustur`, `cors_ayari`, `kok_rota`, `router_baglama` |
| `tests/test_cors.py` | **YENİ**: izinli origin (`http://localhost:5173`) ile `access-control-allow-origin` başlığının VARLIĞINI; izinsiz origin (`http://localhost:4000`) ile bu başlığın YOKLUĞUNU doğrulayan iki test | `test_cors_izinli_origin`, `test_cors_izinsiz_origin` |

Tüm etiket adları `brifler/hafta07-brif.md`'deki tabloyla BİREBİR aynıdır;
hiçbir etiket iç içe değildir.

## Kurulum

Python **3.12** (asgari) gerektirir:

```bash
cd kod_ornekleri/hafta07/sunucu
python3.12 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt -r requirements-dev.txt
```

## Çalıştırma (istemciyle BİRLİKTE — iki terminal)

**Terminal 1 — sunucu:**

```bash
cd kod_ornekleri/hafta07/sunucu
source .venv/bin/activate
uvicorn app.main:app --reload
```

Sunucu `http://127.0.0.1:8000` adresinde dinlemeye başlar.

**Terminal 2 — istemci:** `kod_ornekleri/hafta07/istemci/README.md`'deki
adımları izleyin (`npm run dev`, port `5173`).

CORS bloğu YALNIZCA `http://localhost:5173` origin'ine izin verir — istemci
farklı bir portta çalıştırılırsa (`vite --port` ile değiştirilirse)
`app/main.py`'deki `allow_origins` listesinin GÜNCELLENMESİ gerekir.

## Testler

```bash
python -m pytest -q
```

Hf.6'nın 9 testi + bu haftanın 2 CORS testi = **11 test**.

## Beklenen çıktılar (özet)

Hf.6'nın TÜM beklenen çıktıları (bkz. `kod_ornekleri/hafta06/sunucu/
README.md`) DEĞİŞMEDEN geçerlidir. Bu haftaya özgü ek doğrulama:

- İzinli origin ile preflight: `curl -i -X OPTIONS http://127.0.0.1:8000/
  biletler -H "Origin: http://localhost:5173" -H "Access-Control-Request-
  Method: POST" -H "Access-Control-Request-Headers: Content-Type"` →
  `200 OK`, `access-control-allow-origin: http://localhost:5173`,
  `access-control-allow-methods` başlığında `POST` YER ALIR.
- İzinsiz origin ile normal istek: `curl -i http://127.0.0.1:8000/
  etkinlikler -H "Origin: http://localhost:4000"` → istek yine `200 OK`
  DÖNER (sunucu TARAFINDA engellenmez) ama cevapta
  `access-control-allow-origin` başlığı YOKTUR — tarayıcı bu cevabı JS
  koduna okutturmaz.

## Doğrulama kanıtı (bu ortamda, 2026-09-07)

```
$ python3.12 -m venv .venv && source .venv/bin/activate
$ pip install -r requirements.txt -r requirements-dev.txt
... fastapi-0.141.1 ... pydantic-2.13.5 ... uvicorn-0.52.4 ...
    pytest-9.1.1 ... httpx-0.28.1 ...

$ python -m pytest -q
...........
11 passed, 2 warnings in 0.04s
```

Sunucu arka planda başlatılıp (`uvicorn app.main:app --port 8000`) gerçek
`curl` istekleriyle CORS doğrulanmıştır:

```
== preflight OPTIONS /biletler (izinli origin) ==
HTTP/1.1 200 OK
access-control-allow-methods: DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT
access-control-allow-credentials: true
access-control-allow-origin: http://localhost:5173
access-control-allow-headers: Content-Type

== GET /etkinlikler (izinsiz origin: http://localhost:4000) ==
HTTP/1.1 200 OK
access-control-allow-credentials: true
(access-control-allow-origin BAŞLIĞI YOK)
```

Ayrıca gerçek istemci (Vite, `localhost:5173`) ile UÇTAN UCA bütünleşme bir
tarayıcı otomasyonuyla (Chromium, headless) doğrulanmıştır — ayrıntı
`kod_ornekleri/hafta07/istemci/README.md`.

## Notlar

- `.venv/`, `__pycache__/`, `.pytest_cache/` commit'lenmez.
- Hf.6'nın `tests/conftest.py`'deki `client` fixture'ı AYNEN korunur: her
  test TEK bir `Depo()` nesnesiyle başlar, `dependency_overrides` bu
  SABİT nesneye bağlanır.
- `allow_origins=["http://localhost:5173"]` bilinçli olarak DAR tutulur;
  `["*"]` (herkese izin) Hf.11'de güvenlik açısından neden KÖTÜ bir
  alışkanlık olduğu ele alınacaktır.
