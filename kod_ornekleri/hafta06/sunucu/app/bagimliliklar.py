"""Rota fonksiyonlarına enjekte edilen bağımlılıklar."""

from app.depo import Depo, depo


# BEGIN get_depo_bagimliligi
def get_depo() -> Depo:
    """Rota fonksiyonlarına PAYLAŞILAN tek Depo nesnesini enjekte eder.

    Hf.8'de bu fonksiyonun yerini bir veritabanı oturumu enjekte eden
    get_db_session() alacak; rota fonksiyonlarının bağımlılık ALMA
    biçimi değişmeyecek, yalnızca bağımlılığın NE OLDUĞU değişecek.
    """
    return depo
# END get_depo_bagimliligi
