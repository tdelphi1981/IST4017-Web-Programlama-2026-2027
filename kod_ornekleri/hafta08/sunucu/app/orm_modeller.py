"""SQLAlchemy ORM modelleri — bir veritabanı SATIRININ Python temsili.

Bu sınıflar (`EtkinlikDB`, `KoltukDB`, `BiletDB`) `app/modeller.py`'deki
Pydantic modellerinden (`Etkinlik`, `Koltuk`, `Bilet`) TAMAMEN AYRIDIR:
buradakiler bir `Session`'a BAĞLIDIR, tembel yükleme YAPABİLİR ve doğrudan
JSON'a serileştirilmek için TASARLANMAMIŞTIR — rota fonksiyonları
`model_validate(from_attributes=True)` köprüsüyle bunları dışa dönük
Pydantic nesnelerine ÇEVİRİR (bkz. `app/depo.py`).
"""

from sqlalchemy import ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.veritabani import Base


# BEGIN orm_etkinlik_modeli
class EtkinlikDB(Base):
    """Bir `etkinlikler` satırının Python temsili."""

    __tablename__ = "etkinlikler"

    id: Mapped[int] = mapped_column(primary_key=True)
    baslik: Mapped[str]
    tarih: Mapped[str]
    mekan: Mapped[str]
    kapasite: Mapped[int]
    bilet_fiyati: Mapped[float]

    # Bir etkinlik SİLİNDİĞİNDE bağlı TÜM koltuklar (ve onların cascade'ine
    # bağlı biletleri) OTOMATİK silinir — Ünite 2'nin cascade silme kuralı.
    koltuklar: Mapped[list["KoltukDB"]] = relationship(
        back_populates="etkinlik", cascade="all, delete-orphan"
    )
# END orm_etkinlik_modeli


# BEGIN orm_koltuk_modeli
class KoltukDB(Base):
    """Bir `koltuklar` satırının Python temsili — HER koltuk bir etkinliğe AİTTİR."""

    __tablename__ = "koltuklar"

    id: Mapped[int] = mapped_column(primary_key=True)
    etkinlik_id: Mapped[int] = mapped_column(ForeignKey("etkinlikler.id"))
    sira: Mapped[int]
    koltuk_no: Mapped[int]
    durum: Mapped[str] = mapped_column(default="bos")

    etkinlik: Mapped["EtkinlikDB"] = relationship(back_populates="koltuklar")
    biletler: Mapped[list["BiletDB"]] = relationship(
        back_populates="koltuk", cascade="all, delete-orphan"
    )
# END orm_koltuk_modeli


# BEGIN orm_bilet_modeli
class BiletDB(Base):
    """Bir `biletler` satırının Python temsili.

    İptal edilmiş biletler SİLİNMEZ, `durum='iptal'` olarak SAKLANIR
    (denetim amaçlı) — bu yüzden bir koltuğun zaman içinde BİRDEN FAZLA
    bilet kaydı olabilir (biri aktif, gerisi iptal).
    """

    __tablename__ = "biletler"

    id: Mapped[int] = mapped_column(primary_key=True)
    koltuk_id: Mapped[int] = mapped_column(ForeignKey("koltuklar.id"))
    kullanici_adi: Mapped[str]
    satin_alma_zamani: Mapped[str]
    durum: Mapped[str] = mapped_column(default="olusturuldu")

    koltuk: Mapped["KoltukDB"] = relationship(back_populates="biletler")
# END orm_bilet_modeli


# BEGIN orm_aktif_koltuk_indeksi
# Bir koltuk için EN FAZLA bir AKTİF (durum='olusturuldu') bilet kaydına
# izin veren kısmi (koşullu) UNIQUE indeks — düz bir UNIQUE(koltuk_id)
# YETERSİZDİR, çünkü iptal edilmiş biletler silinmez ve bir koltuk zaman
# içinde birden fazla bilet kaydına sahip olabilir. Uygulama kontrolü
# (bkz. `app/depo.py` `bilet_ekle`) herhangi bir nedenle atlanırsa, bu
# indeks bir IntegrityError fırlatarak son bir güvence katmanı sağlar.
Index(
    "ux_biletler_aktif_koltuk",
    BiletDB.koltuk_id,
    unique=True,
    sqlite_where=(BiletDB.durum == "olusturuldu"),
)
# END orm_aktif_koltuk_indeksi
