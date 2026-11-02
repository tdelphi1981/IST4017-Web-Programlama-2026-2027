"""Etkinlik CRUD rotaları."""

from fastapi import APIRouter, Depends, HTTPException

from app.bagimliliklar import get_depo
from app.depo import Depo
from app.modeller import Etkinlik, EtkinlikOlustur

# BEGIN etkinlikler_router
router = APIRouter(prefix="/etkinlikler", tags=["etkinlikler"])
# END etkinlikler_router


# BEGIN etkinlik_liste
@router.get("", response_model=list[Etkinlik])
def etkinlik_liste(
    mekan: str | None = None, depo: Depo = Depends(get_depo)
) -> list[Etkinlik]:
    return depo.etkinlik_listele(mekan=mekan)
# END etkinlik_liste


# BEGIN etkinlik_detay
@router.get("/{etkinlik_id}", response_model=Etkinlik)
def etkinlik_detay(etkinlik_id: int, depo: Depo = Depends(get_depo)) -> Etkinlik:
    etkinlik = depo.etkinlik_getir(etkinlik_id)
    if etkinlik is None:
        raise HTTPException(status_code=404, detail="Etkinlik bulunamadı")
    return etkinlik
# END etkinlik_detay


# BEGIN etkinlik_olustur
@router.post("", response_model=Etkinlik, status_code=201)
def etkinlik_olustur(
    veri: EtkinlikOlustur, depo: Depo = Depends(get_depo)
) -> Etkinlik:
    return depo.etkinlik_ekle(veri)
# END etkinlik_olustur


# BEGIN etkinlik_guncelle
@router.put("/{etkinlik_id}", response_model=Etkinlik)
def etkinlik_guncelle(
    etkinlik_id: int, veri: EtkinlikOlustur, depo: Depo = Depends(get_depo)
) -> Etkinlik:
    etkinlik = depo.etkinlik_guncelle(etkinlik_id, veri)
    if etkinlik is None:
        raise HTTPException(status_code=404, detail="Etkinlik bulunamadı")
    return etkinlik
# END etkinlik_guncelle


# BEGIN etkinlik_sil
@router.delete("/{etkinlik_id}", status_code=204)
def etkinlik_sil(etkinlik_id: int, depo: Depo = Depends(get_depo)) -> None:
    silindi = depo.etkinlik_sil(etkinlik_id)
    if not silindi:
        raise HTTPException(status_code=404, detail="Etkinlik bulunamadı")
# END etkinlik_sil
