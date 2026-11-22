"""Örnek etkinlik/koltuk verisi yükleyen tohumlama betiği.

Çalıştırma: `python -m app.tohum` (proje kökünden, .venv etkinken).
"""

from datetime import datetime

from sqlalchemy import select

from app.guvenlik import sifre_ozetle
from app.orm_modeller import EtkinlikDB, KoltukDB, KullaniciDB
from app.veritabani import Base, SessionLocal, engine


# BEGIN tohum_veri
def tohum_verisi_ekle() -> None:
    """Veritabanı BOŞSA birkaç örnek etkinlik/koltuk VE bir yönetici + bir
    müşteri hesabı ekler — dersi TEKRAR başlatan her öğrenci ANINDA giriş
    yapıp deneme yapabilsin diye."""
    db = SessionLocal()
    try:
        mevcut = db.execute(select(EtkinlikDB)).scalars().first()
        if mevcut is not None:
            print("Veritabanında zaten veri var, tohumlama ATLANDI.")
            return

        simdi = datetime.now().isoformat()
        yonetici = KullaniciDB(
            kullanici_adi="yonetici",
            eposta="yonetici@ktu.edu.tr",
            sifre_ozeti=sifre_ozetle("yonetici123"),
            rol="yonetici",
            olusturma_zamani=simdi,
        )
        musteri = KullaniciDB(
            kullanici_adi="musteri1",
            eposta="musteri1@ktu.edu.tr",
            sifre_ozeti=sifre_ozetle("musteri123"),
            rol="musteri",
            olusturma_zamani=simdi,
        )
        db.add_all([yonetici, musteri])

        konser = EtkinlikDB(
            baslik="Bahar Konseri",
            tarih="2026-11-14",
            mekan="KTÜ Kültür Merkezi",
            kapasite=100,
            bilet_fiyati=250,
        )
        tiyatro = EtkinlikDB(
            baslik="Kış Masalı",
            tarih="2026-12-01",
            mekan="Salon B",
            kapasite=50,
            bilet_fiyati=120,
        )
        db.add_all([konser, tiyatro])
        db.flush()  # id'lerin atanması için commit beklemeden flush yeterli

        for sira in range(1, 3):
            for koltuk_no in range(1, 4):
                db.add(
                    KoltukDB(
                        etkinlik_id=konser.id,
                        sira=sira,
                        koltuk_no=koltuk_no,
                        durum="bos",
                    )
                )
        db.add(KoltukDB(etkinlik_id=tiyatro.id, sira=1, koltuk_no=1, durum="bos"))

        db.commit()

        toplam_etkinlik = len(db.execute(select(EtkinlikDB)).scalars().all())
        toplam_koltuk = len(db.execute(select(KoltukDB)).scalars().all())
        toplam_kullanici = len(db.execute(select(KullaniciDB)).scalars().all())
        print(
            f"{toplam_etkinlik} etkinlik, {toplam_koltuk} koltuk, "
            f"{toplam_kullanici} kullanıcı eklendi."
        )
    finally:
        db.close()
# END tohum_veri


# BEGIN tohum_calistir
if __name__ == "__main__":
    Base.metadata.create_all(engine)
    tohum_verisi_ekle()
# END tohum_calistir
