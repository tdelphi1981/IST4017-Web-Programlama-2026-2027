"""Etkinlik/Koltuk/Bilet için bellekte, sözlük tabanlı basit bir depo.

Süreç kapandığında (ya da --reload tetiklendiğinde) burada tutulan TÜM
veri kaybolur; kalıcılık (veritabanı) Hf.8'in konusudur. Bu hafta veri
yalnızca ÇALIŞAN sürecin belleğinde, PAYLAŞILAN tek bir Depo nesnesinde
yaşar.
"""

from datetime import datetime

from app.modeller import (
    Bilet,
    BiletOlustur,
    Etkinlik,
    EtkinlikOlustur,
    Koltuk,
    KoltukDurumu,
    KoltukOlustur,
)


# BEGIN depo_sinifi
# BEGIN depo_sinifi_baslik
class Depo:
    """Etkinlik/Koltuk/Bilet kayıtlarını `dict[int, ...]` ile bellekte tutar."""

    def __init__(self) -> None:
        self._etkinlikler: dict[int, Etkinlik] = {}
        self._koltuklar: dict[int, Koltuk] = {}
        self._biletler: dict[int, Bilet] = {}
        self._sonraki_etkinlik_id = 1
        self._sonraki_koltuk_id = 1
        self._sonraki_bilet_id = 1
# END depo_sinifi_baslik

    # -- Etkinlik --------------------------------------------------------
    # BEGIN depo_sinifi_etkinlik_ekle
    def etkinlik_ekle(self, veri: EtkinlikOlustur) -> Etkinlik:
        etkinlik = Etkinlik(id=self._sonraki_etkinlik_id, **veri.model_dump())
        self._etkinlikler[etkinlik.id] = etkinlik
        self._sonraki_etkinlik_id += 1
        return etkinlik
    # END depo_sinifi_etkinlik_ekle

    def etkinlik_getir(self, etkinlik_id: int) -> Etkinlik | None:
        return self._etkinlikler.get(etkinlik_id)

    def etkinlik_listele(self, mekan: str | None = None) -> list[Etkinlik]:
        etkinlikler = list(self._etkinlikler.values())
        if mekan is not None:
            etkinlikler = [e for e in etkinlikler if e.mekan == mekan]
        return etkinlikler

    def etkinlik_guncelle(
        self, etkinlik_id: int, veri: EtkinlikOlustur
    ) -> Etkinlik | None:
        if etkinlik_id not in self._etkinlikler:
            return None
        etkinlik = Etkinlik(id=etkinlik_id, **veri.model_dump())
        self._etkinlikler[etkinlik_id] = etkinlik
        return etkinlik

    def etkinlik_sil(self, etkinlik_id: int) -> bool:
        return self._etkinlikler.pop(etkinlik_id, None) is not None

    # -- Koltuk ------------------------------------------------------------
    def koltuk_ekle(self, etkinlik_id: int, veri: KoltukOlustur) -> Koltuk:
        koltuk = Koltuk(
            id=self._sonraki_koltuk_id,
            etkinlik_id=etkinlik_id,
            durum="bos",
            **veri.model_dump(),
        )
        self._koltuklar[koltuk.id] = koltuk
        self._sonraki_koltuk_id += 1
        return koltuk

    def koltuk_getir(self, koltuk_id: int) -> Koltuk | None:
        return self._koltuklar.get(koltuk_id)

    def koltuk_listele(
        self, etkinlik_id: int, durum: KoltukDurumu | None = None
    ) -> list[Koltuk]:
        koltuklar = [
            k for k in self._koltuklar.values() if k.etkinlik_id == etkinlik_id
        ]
        if durum is not None:
            koltuklar = [k for k in koltuklar if k.durum == durum]
        return koltuklar

    def koltuk_guncelle(self, koltuk_id: int, durum: KoltukDurumu) -> Koltuk | None:
        koltuk = self._koltuklar.get(koltuk_id)
        if koltuk is None:
            return None
        guncel = koltuk.model_copy(update={"durum": durum})
        self._koltuklar[koltuk_id] = guncel
        return guncel

    def koltuk_sil(self, koltuk_id: int) -> bool:
        return self._koltuklar.pop(koltuk_id, None) is not None

    # -- Bilet ---------------------------------------------------------
    def bilet_ekle(self, veri: BiletOlustur) -> Bilet:
        bilet = Bilet(
            id=self._sonraki_bilet_id,
            satin_alma_zamani=datetime.now().isoformat(),
            durum="olusturuldu",
            **veri.model_dump(),
        )
        self._biletler[bilet.id] = bilet
        self._sonraki_bilet_id += 1
        return bilet

    def bilet_getir(self, bilet_id: int) -> Bilet | None:
        return self._biletler.get(bilet_id)

    def bilet_listele(self, kullanici_adi: str | None = None) -> list[Bilet]:
        biletler = list(self._biletler.values())
        if kullanici_adi is not None:
            biletler = [b for b in biletler if b.kullanici_adi == kullanici_adi]
        return biletler

    # BEGIN depo_sinifi_bilet_iptal
    def bilet_iptal_et(self, bilet_id: int) -> Bilet | None:
        """Bileti iptal eder (depodan SİLMEZ) ve ilgili koltuğu boşaltır."""
        bilet = self._biletler.get(bilet_id)
        if bilet is None:
            return None
        guncel_bilet = bilet.model_copy(update={"durum": "iptal"})
        self._biletler[bilet_id] = guncel_bilet
        koltuk = self._koltuklar.get(bilet.koltuk_id)
        if koltuk is not None:
            self._koltuklar[koltuk.id] = koltuk.model_copy(update={"durum": "bos"})
        return guncel_bilet
    # END depo_sinifi_bilet_iptal
# END depo_sinifi


# BEGIN depo_ornegi
# Tüm rotalar (Etkinlikler/Koltuklar/Biletler) AYNI depoyu kullanır; bu
# sayede bir POST /etkinlikler'de eklenen etkinlik HEMEN ardından bir
# GET /etkinlikler'de görünür.
depo = Depo()
# END depo_ornegi
