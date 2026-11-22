"""Uygulama ayarları — `.env` dosyasından tip doğrulamalı okuma.

`pydantic-settings` Pydantic 2.x'te çekirdek paketten AYRILAN
`BaseSettings`'i sağlar; Hf.6'nın `BaseModel` alışkanlığının DOĞAL
devamıdır. `SECRET_KEY` gibi gizli bir değeri kaynak KODA GÖMMEK yerine
`.env` dosyasından okumak, bu dosyanın `git`'e ASLA COMMIT EDİLMEMESİYLE
(`.gitignore`) BİRLİKTE temel bir gizli bilgi hijyeni sağlar; DERİNLEMESİNE
işlenmesi Hf.12'nindir.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


# BEGIN ayarlar_sinifi
class Ayarlar(BaseSettings):
    """`.env` dosyasından (yoksa ortam değişkenlerinden) okunan ayarlar."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
# END ayarlar_sinifi


# BEGIN get_ayarlar_fonksiyonu
@lru_cache
def get_ayarlar() -> Ayarlar:
    """`Ayarlar`ı BİR KEZ oluşturup önbellekte tutar (her çağrıda `.env`
    dosyasını yeniden OKUMAZ)."""
    return Ayarlar()
# END get_ayarlar_fonksiyonu
