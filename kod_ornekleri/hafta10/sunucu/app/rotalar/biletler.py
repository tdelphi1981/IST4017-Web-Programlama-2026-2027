"""Bilet CRUD rotaları — koltuk rezervasyonu iş kuralını uygular."""

from fastapi import APIRouter, Depends, HTTPException

from app.bagimliliklar import get_current_admin, get_current_user, get_depo
from app.depo import Depo
from app.modeller import Bilet, BiletOlustur
from app.orm_modeller import KullaniciDB

# BEGIN biletler_router
router = APIRouter(prefix="/biletler", tags=["biletler"])
# END biletler_router


# BEGIN bilet_olustur
@router.post("", response_model=Bilet, status_code=201)
def bilet_olustur(
    veri: BiletOlustur,
    kullanici: KullaniciDB = Depends(get_current_user),
    depo: Depo = Depends(get_depo),
) -> Bilet:
    koltuk = depo.koltuk_getir(veri.koltuk_id)
    if koltuk is None:
        raise HTTPException(status_code=404, detail="Koltuk bulunamadı")
    if koltuk.durum == "dolu":
        raise HTTPException(status_code=409, detail="Bu koltuk zaten satılmış")
    bilet = depo.bilet_ekle(veri, kullanici_id=kullanici.id)
    depo.koltuk_guncelle(koltuk.id, "dolu")
    return bilet
# END bilet_olustur


# BEGIN bilet_liste
@router.get("", response_model=list[Bilet])
def bilet_liste(
    _: KullaniciDB = Depends(get_current_admin),
    depo: Depo = Depends(get_depo),
) -> list[Bilet]:
    """TÜM biletleri döner — yalnızca yönetici."""
    return depo.bilet_listele()
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
def bilet_iptal(
    bilet_id: int,
    kullanici: KullaniciDB = Depends(get_current_user),
    depo: Depo = Depends(get_depo),
) -> None:
    """Sahiplik kontrolü: bilet BULUNUR, `kullanici_id` giriş yapan
    kullanıcıyla EŞLEŞMİYORSA 403 ("bu bilet SENİN değil") — rol farkı
    gözetmeksizin (admin override YOK) herkese aynı kural uygulanır."""
    bilet = depo.bilet_getir(bilet_id)
    if bilet is None:
        raise HTTPException(status_code=404, detail="Bilet bulunamadı")
    if bilet.kullanici_id != kullanici.id:
        raise HTTPException(status_code=403, detail="Bu bilet size ait değil")
    depo.bilet_iptal_et(bilet_id)
# END bilet_iptal


# BEGIN biletlerim_router
# Prefiks'siz, İKİNCİ bir router — biletler_router'dan (prefix="/biletler")
# AYRI, tek bir rotaya (GET /biletlerim) ev sahipliği yapar.
biletlerim_router = APIRouter(tags=["biletler"])
# END biletlerim_router


# BEGIN biletlerim_liste
@biletlerim_router.get("/biletlerim", response_model=list[Bilet])
def biletlerim_liste(
    kullanici: KullaniciDB = Depends(get_current_user),
    depo: Depo = Depends(get_depo),
) -> list[Bilet]:
    """Giriş yapmış kullanıcının YALNIZ KENDİ biletlerini döner — sorgu
    parametresi YOKTUR, kimin biletleri isteniyorsa TOKEN belirler."""
    return depo.bilet_listele(kullanici_id=kullanici.id)
# END biletlerim_liste
