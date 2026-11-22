"""Koltuk CRUD rotaları (bir etkinliğe bağlı olarak oluşturulur/listelenir)."""

from fastapi import APIRouter, Depends, HTTPException

from app.bagimliliklar import get_current_admin, get_current_user, get_depo
from app.depo import Depo
from app.modeller import Koltuk, KoltukDurumu, KoltukGuncelle, KoltukOlustur
from app.orm_modeller import KullaniciDB

# BEGIN koltuklar_router
router = APIRouter(tags=["koltuklar"])
# END koltuklar_router


# BEGIN koltuk_olustur
@router.post(
    "/etkinlikler/{etkinlik_id}/koltuklar", response_model=Koltuk, status_code=201
)
def koltuk_olustur(
    etkinlik_id: int,
    veri: KoltukOlustur,
    _: KullaniciDB = Depends(get_current_admin),
    depo: Depo = Depends(get_depo),
) -> Koltuk:
    etkinlik = depo.etkinlik_getir(etkinlik_id)
    if etkinlik is None:
        raise HTTPException(status_code=404, detail="Etkinlik bulunamadı")
    return depo.koltuk_ekle(etkinlik_id, veri)
# END koltuk_olustur


# BEGIN koltuk_liste
@router.get("/etkinlikler/{etkinlik_id}/koltuklar", response_model=list[Koltuk])
def koltuk_liste(
    etkinlik_id: int,
    durum: KoltukDurumu | None = None,
    depo: Depo = Depends(get_depo),
) -> list[Koltuk]:
    etkinlik = depo.etkinlik_getir(etkinlik_id)
    if etkinlik is None:
        raise HTTPException(status_code=404, detail="Etkinlik bulunamadı")
    return depo.koltuk_listele(etkinlik_id, durum=durum)
# END koltuk_liste


# BEGIN koltuk_detay
@router.get("/koltuklar/{koltuk_id}", response_model=Koltuk)
def koltuk_detay(koltuk_id: int, depo: Depo = Depends(get_depo)) -> Koltuk:
    koltuk = depo.koltuk_getir(koltuk_id)
    if koltuk is None:
        raise HTTPException(status_code=404, detail="Koltuk bulunamadı")
    return koltuk
# END koltuk_detay


# BEGIN koltuk_durum_guncelle
@router.patch("/koltuklar/{koltuk_id}", response_model=Koltuk)
def koltuk_durum_guncelle(
    koltuk_id: int,
    veri: KoltukGuncelle,
    _: KullaniciDB = Depends(get_current_user),
    depo: Depo = Depends(get_depo),
) -> Koltuk:
    """Koltuk YAZMA rotalarının İSTİSNASI: mekân kurulumu DEĞİL, müşterinin
    kendi rezervasyon sürecinin bir parçasıdır — yönetici yetkisi İSTEMEZ,
    yalnızca giriş yapmış olmak yeterlidir."""
    koltuk = depo.koltuk_guncelle(koltuk_id, veri.durum)
    if koltuk is None:
        raise HTTPException(status_code=404, detail="Koltuk bulunamadı")
    return koltuk
# END koltuk_durum_guncelle


# BEGIN koltuk_sil
@router.delete("/koltuklar/{koltuk_id}", status_code=204)
def koltuk_sil(
    koltuk_id: int,
    _: KullaniciDB = Depends(get_current_admin),
    depo: Depo = Depends(get_depo),
) -> None:
    silindi = depo.koltuk_sil(koltuk_id)
    if not silindi:
        raise HTTPException(status_code=404, detail="Koltuk bulunamadı")
# END koltuk_sil
