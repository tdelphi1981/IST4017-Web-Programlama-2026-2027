# Web Programlama — 2026-2027

**React, TypeScript ve FastAPI ile uçtan uca web uygulamaları**

Karadeniz Teknik Üniversitesi | Fen Fakültesi, Bilgisayar Bilimleri | 2026-2027 Güz Dönemi

Öğretim üyesi: Doç. Dr. Tolga Berber

Materyaller her hafta eklenir. Her haftanın durumu `haftaNN` etiketiyle sabitlenir; yalnız o haftaya kadarki içeriği görmek için ilgili etiketi seçin.

## Haftalık Plan

| Hafta | Konu | Ders Notu | Slayt | Lab | Cheatsheet | Quiz | Kod |
|---|---|---|---|---|---|---|---|
| 1 | Web'in Temelleri: Ağdan HTTP'ye | [PDF](ders-notu/Hafta01_Webin_Temelleri.pdf) | [Slayt](slides/Hafta01_Webin_Temelleri.pdf) | [Lab](labs/Lab01_Webin_Temelleri.pdf) | [Özet](cheatsheets/Hafta01_Webin_Temelleri.pdf) | [Quiz](quizzes/Hafta01_Ogrenci.pdf) | [Kod](kod_ornekleri/hafta01) |
| 2 | HTML5 ve CSS3: Sunum Katmanının İlk Malzemesi | [PDF](ders-notu/Hafta02_HTML5_ve_CSS3.pdf) | [Slayt](slides/Hafta02_HTML5_ve_CSS3.pdf) | [Lab](labs/Lab02_HTML5_ve_CSS3.pdf) | [Özet](cheatsheets/Hafta02_HTML5_ve_CSS3.pdf) | [Quiz](quizzes/Hafta02_Ogrenci.pdf) | [Kod](kod_ornekleri/hafta02) |

## Klasörler

| Klasör | İçerik |
|---|---|
| `ders-notu/` | Ders kitabının haftalık bölümleri |
| `slides/` | Haftalık ders sunumları |
| `labs/` | Lab föyleri |
| `cheatsheets/` | Tek sayfalık haftalık özetler |
| `quizzes/` | Haftalık quizler (öğrenci sürümü) |
| `kod_ornekleri/` | Ders notu ve lab föylerindeki çalışan kod örnekleri; her hafta klasöründeki `README.md` çalıştırma adımlarını verir |

## Kod Örneklerini Çalıştırma

Her `kod_ornekleri/haftaNN/` klasörü kendi başına çalışır ve kendi `README.md` dosyasında adım adım komutları verir.

| Araç | Sürüm | Kullanıldığı yer |
|---|---|---|
| Node.js | LTS (22 veya üstü) | Ön yüz: Vite + TypeScript, Hafta 4'ten itibaren React |
| Python | 3.12 | Sunucu: FastAPI + SQLAlchemy (Hafta 6'dan itibaren) |
| curl | sistemle gelen | Hafta 1 HTTP betikleri |

```bash
# Hafta 1: HTTP betikleri (macOS/Linux)
bash kod_ornekleri/hafta01/http-istek-anatomisi.sh
# Hafta 1: Windows PowerShell
powershell -ExecutionPolicy Bypass -File .\kod_ornekleri\hafta01\http-istek-anatomisi.ps1

# Hafta 3 ve sonrası: ön yüz projesi
cd kod_ornekleri/hafta03/istemci
npm install
npm run dev
```

## Lisans

Bu materyaller akademik kullanım için hazırlanmıştır. Ayrıntılar için [LICENSE](LICENSE) dosyasına bakın.
