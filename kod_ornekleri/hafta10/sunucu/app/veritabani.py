"""Veritabanı bağlantısı: engine, oturum fabrikası, bildirimsel taban sınıf.

YG II'de SQLite'a elle bağlanıp SQL yazdınız; burada AYNI SQLite dosyasına
(`bilet.db`) SQLAlchemy'nin `engine` nesnesi üzerinden bağlanılır — `engine`
uygulama başına GENELDE TEK bir nesnedir, hangi veritabanı dosyasına/lehçeye
bağlanılacağını bilir. Her istek için ayrı bir `Session` açılır/kapatılır
(`get_db` üreteç bağımlılığı) — Hf.6 Ünite 4'ün "Hf.8'de bu yer tutucuyu
değiştirecek" notunun gerçekleştiği yer burasıdır.
"""

from collections.abc import Generator

from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker


def sqlite_yazma_kilidi_uygula(engine_nesnesi: Engine) -> None:
    """SQLite'ın her transaction'ı BEGIN IMMEDIATE ile başlatmasını sağlar.

    Varsayılan davranışta (BEGIN DEFERRED) bir transaction bir YAZMA
    işlemine kadar kilit ALMAZ; BEGIN IMMEDIATE ile transaction BAŞLAR
    BAŞLAMAZ bir yazma kilidi (RESERVED) alınır — aynı anda başka bir
    transaction'ın yazma NİYETİYLE başlaması engellenir (Ünite 4, koltuk
    rezervasyonu transaction'ı bu sayede güvenlidir). pysqlite'ın kendi
    örtük BEGIN'ini önce KAPATMAK gerekir, aksi hâlde bizim elle
    gönderdiğimiz BEGIN IMMEDIATE'le çakışır.
    """

    @event.listens_for(engine_nesnesi, "connect")
    def _pysqlite_otomatik_baslatmayi_kapat(dbapi_baglanti, _kayit):
        dbapi_baglanti.isolation_level = None

    @event.listens_for(engine_nesnesi, "begin")
    def _begin_immediate_gonder(baglanti):
        baglanti.exec_driver_sql("BEGIN IMMEDIATE")


# BEGIN veritabani_engine
# echo=True açıldığında (Ünite 3) her çalıştırılan SQL cümlesi konsola
# basılır; günlük çalışmada gürültü yapmaması için varsayılan False'tur.
engine = create_engine("sqlite:///bilet.db", echo=False)
sqlite_yazma_kilidi_uygula(engine)
# END veritabani_engine


# BEGIN veritabani_taban
class Base(DeclarativeBase):
    """Tüm ORM modellerinin (EtkinlikDB, KoltukDB, BiletDB) miras aldığı taban sınıf."""
# END veritabani_taban


# BEGIN veritabani_oturum_fabrikasi
SessionLocal = sessionmaker(bind=engine)
# END veritabani_oturum_fabrikasi


# BEGIN get_db_uretec
def get_db() -> Generator[Session, None, None]:
    """Her istek için YENİ bir Session açar, istek bitince KAPATIR.

    `yield`'den ÖNCEKİ blok isteği İŞLEYEN koddan ÖNCE, `finally` bloğu
    isteği İŞLEYEN kod bittikten SONRA (hata OLSA bile) çalışır.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
# END get_db_uretec
