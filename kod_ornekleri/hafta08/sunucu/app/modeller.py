"""Etkinlik/Koltuk/Bilet için Pydantic modelleri.

Tüm modeller ortak bir KamelModel taban sınıfından türer: Python
tarafında alan adları snake_case yazılır (PEP 8), ama JSON'a
serileştirilirken/JSON'dan okunurken camelCase takma adlar (alias)
kullanılır — Hf.3'ün TS arayüzleriyle birebir aynı JSON sözleşmesi.
"""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

# BEGIN model_taban_sinifi
class KamelModel(BaseModel):
    """snake_case Python alanlarını camelCase JSON'a bağlayan taban sınıf."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
# END model_taban_sinifi


# BEGIN etkinlik_modelleri
class EtkinlikOlustur(KamelModel):
    """İstemcinin gönderdiği, henüz id'si olmayan etkinlik verisi."""

    baslik: str = Field(min_length=1)
    tarih: str
    mekan: str = Field(min_length=1)
    kapasite: int = Field(gt=0)
    bilet_fiyati: float = Field(gt=0)


class Etkinlik(EtkinlikOlustur):
    """Sunucunun döndürdüğü, kimliği atanmış tam etkinlik nesnesi."""

    id: int
# END etkinlik_modelleri


# BEGIN koltuk_modelleri
KoltukDurumu = Literal["bos", "secili", "dolu"]


class KoltukOlustur(KamelModel):
    """İstemcinin gönderdiği, henüz id'si/durumu olmayan koltuk verisi."""

    sira: int = Field(gt=0)
    koltuk_no: int = Field(gt=0)


class Koltuk(KoltukOlustur):
    """Sunucunun döndürdüğü, kimliği ve durumu atanmış tam koltuk nesnesi."""

    id: int
    etkinlik_id: int
    durum: KoltukDurumu = "bos"


class KoltukGuncelle(KamelModel):
    """PATCH /koltuklar/{id} gövdesi — yalnızca durum alanı değişir."""

    durum: KoltukDurumu
# END koltuk_modelleri


# BEGIN bilet_modelleri
BiletDurumu = Literal["olusturuldu", "iptal"]


class BiletOlustur(KamelModel):
    """İstemcinin gönderdiği, henüz id'si/zaman damgası olmayan bilet verisi."""

    koltuk_id: int
    kullanici_adi: str = Field(min_length=1)


class Bilet(BiletOlustur):
    """Sunucunun döndürdüğü, kimliği ve satın alma zamanı atanmış tam bilet."""

    id: int
    satin_alma_zamani: str
    durum: BiletDurumu = "olusturuldu"
# END bilet_modelleri
