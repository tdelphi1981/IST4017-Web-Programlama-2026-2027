"""Rota fonksiyonlarına enjekte edilen bağımlılıklar."""

from fastapi import Depends
from sqlalchemy.orm import Session

from app.depo import Depo
from app.veritabani import get_db


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
