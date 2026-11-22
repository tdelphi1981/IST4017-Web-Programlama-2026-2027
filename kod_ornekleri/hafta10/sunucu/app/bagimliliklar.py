"""Rota fonksiyonlarına enjekte edilen bağımlılıklar."""

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.depo import Depo
from app.guvenlik import token_dogrula
from app.orm_modeller import KullaniciDB
from app.veritabani import get_db


# BEGIN oauth2_semasi
# tokenUrl, /docs sayfasındaki Authorize butonunun token İSTEYECEĞİ uç
# noktayı belirtir; bu satırın kendisi bir istek ATMAZ, yalnızca /docs'un
# ve OAuth2PasswordBearer'ın Authorization: Bearer başlığını NEREDEN
# beklediğini TANIMLAR.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")
# END oauth2_semasi


# BEGIN get_current_user_bagimliligi
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> KullaniciDB:
    """`Authorization: Bearer <token>` başlığını doğrulayıp o token'a
    karşılık gelen `KullaniciDB` satırını döner.

    Token HİÇ YOKSA `OAuth2PasswordBearer`'ın kendisi zaten 401 fırlatır;
    token VARSA ama imzası/`exp`'i GEÇERSİZSE ya da `sub`'daki kimliğe
    karşılık gelen kullanıcı ARTIK yoksa burada 401 fırlatılır — "SEN
    kimsin, önce kimliğini kanıtla" (Ünite 3).
    """
    kimlik_dogrulama_hatasi = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Kimlik doğrulanamadı",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = token_dogrula(token)
        kullanici_id = int(payload["sub"])
    except (jwt.InvalidTokenError, KeyError, ValueError):
        raise kimlik_dogrulama_hatasi from None

    kullanici = db.get(KullaniciDB, kullanici_id)
    if kullanici is None:
        raise kimlik_dogrulama_hatasi
    return kullanici
# END get_current_user_bagimliligi


# BEGIN get_current_admin_bagimliligi
def get_current_admin(
    kullanici: KullaniciDB = Depends(get_current_user),
) -> KullaniciDB:
    """`get_current_user`'a DAYANAN ikinci bir zincirleme bağımlılık —
    kullanıcı GEÇERLİ (401 aşaması geçildi) ama rolü `'yonetici'` DEĞİLSE
    403 fırlatır: "SENİ tanıyorum, ama bu işleme iznin yok" (Ünite 3)."""
    if kullanici.rol != "yonetici":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için yönetici yetkisi gerekir",
        )
    return kullanici
# END get_current_admin_bagimliligi


# BEGIN get_depo_bagimliligi
def get_depo(db: Session = Depends(get_db)) -> Depo:
    """Rota fonksiyonlarına, bu isteğe ÖZEL bir veritabanı Session'ıyla
    kurulmuş bir Depo nesnesi enjekte eder.

    ZİNCİRLEME bağımlılık: get_depo'nun kendisi bir Depends(get_db) alır —
    rota fonksiyonlarındaki `depo: Depo = Depends(get_depo)` yazımı
    Hf.6-7'den TEK BİR karakter değişmeden kalır; değişen yalnızca
    get_depo'nun İÇİNDE artık bir Python dict YERİNE bir veritabanı
    Session kullanılmasıdır ("aynı mekanizma, farklı bağımlılık").
    """
    return Depo(db)
# END get_depo_bagimliligi
