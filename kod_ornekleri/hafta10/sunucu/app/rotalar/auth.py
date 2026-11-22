"""Kayıt/giriş rotaları — kimlik doğrulamanın (authentication) giriş kapısı."""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.guvenlik import sifre_dogrula, sifre_ozetle, token_uret
from app.modeller import Kullanici, KullaniciKayit, Token
from app.orm_modeller import KullaniciDB
from app.veritabani import get_db

# BEGIN auth_router
router = APIRouter(prefix="/auth", tags=["auth"])
# END auth_router


# BEGIN auth_kayit
@router.post("/kayit", response_model=Kullanici, status_code=201)
def auth_kayit(veri: KullaniciKayit, db: Session = Depends(get_db)) -> Kullanici:
    """Şifreyi `bcrypt` ile özetleyip yeni bir `KullaniciDB` satırı ekler.

    `kullanici_adi` ZATEN VARSA veritabanının `UNIQUE` kısıtı bir
    `IntegrityError` fırlatır — bu Hf.8 Ünite 4'ün `IntegrityError` → `409`
    çevirme deseninin TEKRARIDIR.
    """
    # BEGIN auth_kayit_olustur
    kullanici_db = KullaniciDB(
        kullanici_adi=veri.kullanici_adi,
        eposta=veri.eposta,
        sifre_ozeti=sifre_ozetle(veri.sifre),
        rol="musteri",
        olusturma_zamani=datetime.now().isoformat(),
    )
    db.add(kullanici_db)
    # END auth_kayit_olustur
    # BEGIN auth_kayit_hata
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bu kullanıcı adı zaten kayıtlı",
        ) from None
    db.refresh(kullanici_db)
    return Kullanici.model_validate(kullanici_db, from_attributes=True)
    # END auth_kayit_hata
# END auth_kayit


# BEGIN auth_token
@router.post("/token", response_model=Token)
def auth_token(
    form_verisi: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> Token:
    """`OAuth2PasswordRequestForm`'dan `username`/`password` okur (OAuth2
    standardının alan adları — bizim `kullaniciAdi` alan adımız DEĞİL,
    form-encoded gövde JSON DEĞİL).
    """
    kimlik_dogrulama_hatasi = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Kullanıcı adı ya da şifre hatalı",
        headers={"WWW-Authenticate": "Bearer"},
    )
    stmt = select(KullaniciDB).where(KullaniciDB.kullanici_adi == form_verisi.username)
    kullanici = db.execute(stmt).scalar_one_or_none()
    if kullanici is None or not sifre_dogrula(
        form_verisi.password, kullanici.sifre_ozeti
    ):
        raise kimlik_dogrulama_hatasi

    return Token(access_token=token_uret(kullanici))
# END auth_token
