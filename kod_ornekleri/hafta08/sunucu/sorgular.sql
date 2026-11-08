-- Hf.8: ORM'in echo=True ile ÜRETTİĞİ SQL'in elle yazılmış karşılıkları.
--
-- Bu dosya sunucu tarafından ÇALIŞTIRILMAZ; yalnızca KARŞILAŞTIRMA
-- amaçlıdır (Ünite 3 — YG II'de elle yazdığınız SQL ile ORM'in ürettiği
-- SQL'i yan yana koymak için). Elle denemek isterseniz:
--   sqlite3 bilet.db < sorgular.sql

-- BEGIN sql_etkinlik_listele
-- GET /etkinlikler?mekan=Salon+A karşılığı
SELECT etkinlikler.id, etkinlikler.baslik, etkinlikler.tarih,
       etkinlikler.mekan, etkinlikler.kapasite, etkinlikler.bilet_fiyati
FROM etkinlikler
WHERE etkinlikler.mekan = 'Salon A'
ORDER BY etkinlikler.id;
-- END sql_etkinlik_listele

-- BEGIN sql_koltuk_join
-- Bir etkinliği koltuklarıyla BİRLİKTE tek sorguda çekme (selectinload'ın
-- elle yazılmış JOIN karşılığı — Ünite 2'nin istekli yükleme örneği)
SELECT etkinlikler.id, etkinlikler.baslik, koltuklar.id AS koltuk_id,
       koltuklar.sira, koltuklar.koltuk_no, koltuklar.durum
FROM etkinlikler
JOIN koltuklar ON koltuklar.etkinlik_id = etkinlikler.id
WHERE etkinlikler.id = 1;
-- END sql_koltuk_join

-- BEGIN sql_sayfalama
-- GET /etkinlikler?sayfa=2&boyut=10 karşılığı
SELECT etkinlikler.id, etkinlikler.baslik, etkinlikler.tarih,
       etkinlikler.mekan, etkinlikler.kapasite, etkinlikler.bilet_fiyati
FROM etkinlikler
ORDER BY etkinlikler.id
LIMIT 10 OFFSET 10;
-- END sql_sayfalama

-- BEGIN sql_transaction_rezervasyon
-- POST /biletler işleyicisinin TEK transaction'da yaptığı üç adımın
-- (kontrol et + dolu yap + yaz) elle SQL karşılığı
BEGIN IMMEDIATE;

SELECT id, durum FROM koltuklar WHERE id = 1;
-- Uygulama kodu burada durum = 'bos' mu diye kontrol eder.

UPDATE koltuklar SET durum = 'dolu' WHERE id = 1;

INSERT INTO biletler (koltuk_id, kullanici_adi, satin_alma_zamani, durum)
VALUES (1, 'Ayşe Yılmaz', '2026-11-14T10:00:00', 'olusturuldu');

COMMIT;
-- END sql_transaction_rezervasyon

-- BEGIN sql_aktif_koltuk_unique_indeks
-- Bir koltuk için EN FAZLA bir AKTİF bilet kaydına izin veren kısmi
-- (koşullu) UNIQUE indeks — app/orm_modeller.py'deki Index(...) tanımının
-- ürettiği DDL
CREATE UNIQUE INDEX ux_biletler_aktif_koltuk
ON biletler (koltuk_id)
WHERE durum = 'olusturuldu';
-- END sql_aktif_koltuk_unique_indeks
