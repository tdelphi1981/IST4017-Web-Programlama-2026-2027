"""Etkinlik/Koltuk/Bilet için SQLAlchemy tabanlı depo.

Hf.6-7'nin `dict` tabanlı `Depo`'sunun YERİNE geçer; rota fonksiyonlarının
gördüğü ARAYÜZ (metot adları/imzaları) DEĞİŞMEZ — DEĞİŞEN yalnızca
metotların İÇİNİN artık bir veritabanı `Session`'ı KULLANMASIDIR ("iyi bir
API sözleşmesi deponun NASIL çalıştığını GİZLER").
"""

from datetime import datetime

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.modeller import (
    Bilet,
    BiletOlustur,
    Etkinlik,
    EtkinlikOlustur,
    Koltuk,
    KoltukDurumu,
    KoltukOlustur,
)
from app.orm_modeller import BiletDB, EtkinlikDB, KoltukDB


# BEGIN depo_sinifi
class Depo:
    """Etkinlik/Koltuk/Bilet kayıtlarını bir SQLAlchemy `Session`'ı üzerinden yönetir."""

    def __init__(self, db: Session) -> None:
        self.db = db
# END depo_sinifi

    # -- Etkinlik --------------------------------------------------------
    # BEGIN depo_etkinlik_metotlari
    # BEGIN depo_etkinlik_ekle
    def etkinlik_ekle(self, veri: EtkinlikOlustur) -> Etkinlik:
        etkinlik_db = EtkinlikDB(**veri.model_dump())
        self.db.add(etkinlik_db)
        self.db.commit()
        self.db.refresh(etkinlik_db)
        return Etkinlik.model_validate(etkinlik_db, from_attributes=True)
    # END depo_etkinlik_ekle

    def etkinlik_getir(self, etkinlik_id: int) -> Etkinlik | None:
        etkinlik_db = self.db.get(EtkinlikDB, etkinlik_id)
        if etkinlik_db is None:
            return None
        return Etkinlik.model_validate(etkinlik_db, from_attributes=True)

    # BEGIN depo_etkinlik_listele
    def etkinlik_listele(
        self, sayfa: int = 1, boyut: int = 20, mekan: str | None = None
    ) -> list[Etkinlik]:
        stmt = select(EtkinlikDB).order_by(EtkinlikDB.id)
        if mekan is not None:
            stmt = stmt.where(EtkinlikDB.mekan == mekan)
        stmt = stmt.limit(boyut).offset((sayfa - 1) * boyut)
        etkinlikler_db = self.db.execute(stmt).scalars().all()
        return [
            Etkinlik.model_validate(e, from_attributes=True) for e in etkinlikler_db
        ]
    # END depo_etkinlik_listele

    def etkinlik_guncelle(
        self, etkinlik_id: int, veri: EtkinlikOlustur
    ) -> Etkinlik | None:
        etkinlik_db = self.db.get(EtkinlikDB, etkinlik_id)
        if etkinlik_db is None:
            return None
        for alan, deger in veri.model_dump().items():
            setattr(etkinlik_db, alan, deger)
        self.db.commit()
        self.db.refresh(etkinlik_db)
        return Etkinlik.model_validate(etkinlik_db, from_attributes=True)
    # END depo_etkinlik_metotlari

    # BEGIN depo_etkinlik_sil_cascade
    def etkinlik_sil(self, etkinlik_id: int) -> str:
        """Etkinliği SİLER (cascade) ya da neden silinemediğini bildirir.

        Dönüş: `"silindi"` | `"bulunamadi"` | `"aktif_bilet_var"`. Bağlı
        koltuklardan HERHANGİ BİRİNİN aktif (`durum='olusturuldu'`) bir
        bileti varsa silme REDDEDİLİR; yoksa `relationship`'teki
        `cascade="all, delete-orphan"` sayesinde bağlı TÜM koltuklar (ve
        varsa iptal edilmiş biletleri) OTOMATİK olarak kademeli silinir.
        """
        etkinlik_db = self.db.get(EtkinlikDB, etkinlik_id)
        if etkinlik_db is None:
            return "bulunamadi"

        aktif_bilet_var = any(
            bilet.durum == "olusturuldu"
            for koltuk in etkinlik_db.koltuklar
            for bilet in koltuk.biletler
        )
        if aktif_bilet_var:
            return "aktif_bilet_var"

        self.db.delete(etkinlik_db)
        self.db.commit()
        return "silindi"
    # END depo_etkinlik_sil_cascade

    # -- Koltuk ------------------------------------------------------------
    # BEGIN depo_koltuk_metotlari
    def koltuk_ekle(self, etkinlik_id: int, veri: KoltukOlustur) -> Koltuk:
        koltuk_db = KoltukDB(
            etkinlik_id=etkinlik_id, durum="bos", **veri.model_dump()
        )
        self.db.add(koltuk_db)
        self.db.commit()
        self.db.refresh(koltuk_db)
        return Koltuk.model_validate(koltuk_db, from_attributes=True)

    def koltuk_getir(self, koltuk_id: int) -> Koltuk | None:
        koltuk_db = self.db.get(KoltukDB, koltuk_id)
        if koltuk_db is None:
            return None
        return Koltuk.model_validate(koltuk_db, from_attributes=True)

    def koltuk_listele(
        self, etkinlik_id: int, durum: KoltukDurumu | None = None
    ) -> list[Koltuk]:
        stmt = select(KoltukDB).where(KoltukDB.etkinlik_id == etkinlik_id)
        if durum is not None:
            stmt = stmt.where(KoltukDB.durum == durum)
        koltuklar_db = self.db.execute(stmt).scalars().all()
        return [Koltuk.model_validate(k, from_attributes=True) for k in koltuklar_db]

    def koltuk_guncelle(self, koltuk_id: int, durum: KoltukDurumu) -> Koltuk | None:
        koltuk_db = self.db.get(KoltukDB, koltuk_id)
        if koltuk_db is None:
            return None
        koltuk_db.durum = durum
        self.db.commit()
        self.db.refresh(koltuk_db)
        return Koltuk.model_validate(koltuk_db, from_attributes=True)

    def koltuk_sil(self, koltuk_id: int) -> bool:
        koltuk_db = self.db.get(KoltukDB, koltuk_id)
        if koltuk_db is None:
            return False
        self.db.delete(koltuk_db)
        self.db.commit()
        return True
    # END depo_koltuk_metotlari

    # -- Bilet ---------------------------------------------------------
    # BEGIN depo_bilet_rezervasyon_transaction
    def bilet_ekle(self, veri: BiletOlustur) -> Bilet:
        """Koltuk kontrolü + koltuğu doldurma + bilet ekleme TEK transaction'da.

        Bu Session'ın bağlı olduğu `engine`, her transaction'ı SQLite'ın
        `BEGIN IMMEDIATE`'iyle başlatır (`app/veritabani.py`) — aynı koltuğa
        eşzamanlı gelen ikinci istek, birincisi commit edene kadar burada
        BEKLER ve koltuğun ARTIK dolu olduğunu görüp `409` alır. Uygulama
        kontrolü (`durum == 'dolu'`) herhangi bir nedenle atlanırsa, kısmi
        UNIQUE indeks (`orm_aktif_koltuk_indeksi`) bir `IntegrityError`
        fırlatır — bu da `409`'a çevrilir; "tek kalem kuralı"nın veritabanı
        seviyesinde TEKRARLANMASI.
        """
        # BEGIN depo_bilet_rezervasyon_kontrol
        koltuk_db = self.db.get(KoltukDB, veri.koltuk_id)
        if koltuk_db is None:
            raise HTTPException(status_code=404, detail="Koltuk bulunamadı")
        if koltuk_db.durum == "dolu":
            raise HTTPException(status_code=409, detail="Bu koltuk zaten satılmış")
        # END depo_bilet_rezervasyon_kontrol

        # BEGIN depo_bilet_rezervasyon_yaz
        koltuk_db.durum = "dolu"
        bilet_db = BiletDB(
            koltuk_id=veri.koltuk_id,
            kullanici_adi=veri.kullanici_adi,
            satin_alma_zamani=datetime.now().isoformat(),
            durum="olusturuldu",
        )
        self.db.add(bilet_db)
        # END depo_bilet_rezervasyon_yaz

        # BEGIN depo_bilet_rezervasyon_commit
        try:
            self.db.commit()
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status_code=409, detail="Bu koltuk zaten satılmış"
            ) from None
        self.db.refresh(bilet_db)
        return Bilet.model_validate(bilet_db, from_attributes=True)
        # END depo_bilet_rezervasyon_commit
    # END depo_bilet_rezervasyon_transaction

    def bilet_getir(self, bilet_id: int) -> Bilet | None:
        bilet_db = self.db.get(BiletDB, bilet_id)
        if bilet_db is None:
            return None
        return Bilet.model_validate(bilet_db, from_attributes=True)

    def bilet_listele(self, kullanici_adi: str | None = None) -> list[Bilet]:
        stmt = select(BiletDB)
        if kullanici_adi is not None:
            stmt = stmt.where(BiletDB.kullanici_adi == kullanici_adi)
        biletler_db = self.db.execute(stmt).scalars().all()
        return [Bilet.model_validate(b, from_attributes=True) for b in biletler_db]

    def bilet_iptal_et(self, bilet_id: int) -> Bilet | None:
        """Bileti iptal eder (satırı SİLMEZ) ve ilgili koltuğu boşaltır."""
        bilet_db = self.db.get(BiletDB, bilet_id)
        if bilet_db is None:
            return None
        bilet_db.durum = "iptal"
        koltuk_db = self.db.get(KoltukDB, bilet_db.koltuk_id)
        if koltuk_db is not None:
            koltuk_db.durum = "bos"
        self.db.commit()
        self.db.refresh(bilet_db)
        return Bilet.model_validate(bilet_db, from_attributes=True)
