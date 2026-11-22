"""Şifre özetleme ve JWT üretim/doğrulama yardımcıları.

`bcrypt` DOĞRUDAN kullanılır (`passlib` KURULMAZ — bakım durumu ve güncel
`bcrypt` sürümleriyle bilinen uyumsuzluk nedeniyle, bkz. brif "Kapsam ve
hedefler"). `PyJWT` de aynı gerekçeyle (`python-jose` YERİNE) seçilmiştir.
"""

from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.ayarlar import get_ayarlar
from app.orm_modeller import KullaniciDB


# BEGIN sifre_ozetleme
def sifre_ozetle(sifre: str) -> str:
    """Düz metin şifreyi `bcrypt` ile özetler (tuz OTOMATİK üretilip özetin
    İÇİNE gömülür — dikkat: `bcrypt` en fazla 72 baytlık girdi kabul eder;
    bcrypt 5.x daha uzun şifrede ValueError fırlatır)."""
    ozet = bcrypt.hashpw(sifre.encode("utf-8"), bcrypt.gensalt())
    return ozet.decode("utf-8")
# END sifre_ozetleme


# BEGIN sifre_dogrulama
def sifre_dogrula(sifre: str, ozet: str) -> bool:
    """Girilen şifreyi kayıtlı özetteki tuzu kullanarak YENİDEN özetleyip
    karşılaştırır (`bcrypt.checkpw` bu karşılaştırmayı zaten ZAMAN-SABİT
    yapar)."""
    return bcrypt.checkpw(sifre.encode("utf-8"), ozet.encode("utf-8"))
# END sifre_dogrulama


# BEGIN token_uretme
def token_uret(kullanici: KullaniciDB) -> str:
    """Kullanıcının kimliğini (`sub`) ve rolünü taşıyan, sınırlı SÜRELİ
    (`exp`) bir JWT üretir."""
    ayarlar = get_ayarlar()
    simdi = datetime.now(timezone.utc)
    payload = {
        "sub": str(kullanici.id),
        "rol": kullanici.rol,
        "exp": simdi + timedelta(minutes=ayarlar.access_token_expire_minutes),
    }
    return jwt.encode(payload, ayarlar.secret_key, algorithm=ayarlar.algorithm)
# END token_uretme


# BEGIN token_dogrulama
def token_dogrula(token: str) -> dict:
    """Token'ın imzasını VE süresini doğrular; geçersizse
    `jwt.InvalidTokenError` (ya da alt sınıfı `jwt.ExpiredSignatureError`)
    fırlatır — çağıran kod (`app/bagimliliklar.py`) bunu 401'e ÇEVİRİR."""
    ayarlar = get_ayarlar()
    return jwt.decode(token, ayarlar.secret_key, algorithms=[ayarlar.algorithm])
# END token_dogrulama
