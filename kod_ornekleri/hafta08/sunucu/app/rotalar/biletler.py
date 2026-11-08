"""Bilet CRUD rotaları — koltuk rezervasyonu iş kuralını uygular."""

from fastapi import APIRouter, Depends, HTTPException

from app.bagimliliklar import get_depo
from app.depo import Depo
from app.modeller import Bilet, BiletOlustur

# BEGIN biletler_router
router = APIRouter(prefix="/biletler", tags=["biletler"])
# END biletler_router


# BEGIN bilet_olustur
@router.post("", response_model=Bilet, status_code=201)
def bilet_olustur(veri: BiletOlustur, depo: Depo = Depends(get_depo)) -> Bilet:
    koltuk = depo.koltuk_getir(veri.koltuk_id)
    if koltuk is None:
        raise HTTPException(status_code=404, detail="Koltuk bulunamadı")
    if koltuk.durum == "dolu":
        raise HTTPException(status_code=409, detail="Bu koltuk zaten satılmış")
    bilet = depo.bilet_ekle(veri)
    depo.koltuk_guncelle(koltuk.id, "dolu")
    return bilet
# END bilet_olustur


# BEGIN bilet_liste
@router.get("", response_model=list[Bilet])
def bilet_liste(
    kullanici_adi: str | None = None, depo: Depo = Depends(get_depo)
) -> list[Bilet]:
    return depo.bilet_listele(kullanici_adi=kullanici_adi)
# END bilet_liste


# BEGIN bilet_detay
@router.get("/{bilet_id}", response_model=Bilet)
def bilet_detay(bilet_id: int, depo: Depo = Depends(get_depo)) -> Bilet:
    bilet = depo.bilet_getir(bilet_id)
    if bilet is None:
        raise HTTPException(status_code=404, detail="Bilet bulunamadı")
    return bilet
# END bilet_detay


# BEGIN bilet_iptal
@router.delete("/{bilet_id}", status_code=204)
def bilet_iptal(bilet_id: int, depo: Depo = Depends(get_depo)) -> None:
    bilet = depo.bilet_iptal_et(bilet_id)
    if bilet is None:
        raise HTTPException(status_code=404, detail="Bilet bulunamadı")
# END bilet_iptal
