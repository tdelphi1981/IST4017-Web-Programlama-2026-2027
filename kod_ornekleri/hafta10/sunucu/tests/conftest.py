"""Ortak pytest fixture'ları — her test TEMİZ, belleğe kurulmuş bir veritabanıyla başlar."""

from datetime import datetime
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.guvenlik import sifre_ozetle, token_uret
from app.main import app
from app.orm_modeller import KullaniciDB
from app.veritabani import Base, get_db, sqlite_yazma_kilidi_uygula


@pytest.fixture(scope="session", autouse=True)
def _uretim_veritabani_dosyasini_temizle():
    """app/main.py İÇE AKTARILDIĞINDA (bu conftest tarafından) çağrılan
    `Base.metadata.create_all(engine)` ÜRETİM engine'ine (bilet.db) bağlıdır
    ve BOŞ bir tablo şeması oluşturur — testler HİÇBİR ZAMAN bu dosyaya VERİ
    yazmaz (`get_db` her testte belleğe kurulu AYRI bir veritabanına
    override edilir, bkz. `client` fixture'ı). Bu fixture, test oturumu
    bittiğinde bu yan etkiyle oluşan dosyanın İZİNİ SİLER; proje kökünde
    kalıcı bir dosya BIRAKILMAZ.
    """
    yield
    bilet_db_yolu = Path("bilet.db")
    if bilet_db_yolu.exists():
        bilet_db_yolu.unlink()


# BEGIN test_veritabani_fixture
@pytest.fixture
def test_db_session_fabrikasi():
    """Her test için TEMİZ, `:memory:` bir SQLite veritabanı hazırlar.

    `StaticPool` + `check_same_thread=False`, TÜM Session'ların AYNI
    bağlantıyı paylaşmasını sağlar — aksi hâlde her yeni bağlantı KENDİ
    boş `:memory:` veritabanını görür ve `create_all` ile eklenen tablolar
    o bağlantı kapanınca KAYBOLUR.
    """
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    sqlite_yazma_kilidi_uygula(engine)
    Base.metadata.create_all(engine)
    session_fabrikasi = sessionmaker(bind=engine)
    yield session_fabrikasi
    Base.metadata.drop_all(engine)
# END test_veritabani_fixture


# BEGIN test_istemci_fixture
@pytest.fixture
def client(test_db_session_fabrikasi):
    def get_db_gecersiz_kil():
        db = test_db_session_fabrikasi()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = get_db_gecersiz_kil
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
# END test_istemci_fixture


# BEGIN test_kullanici_fixture
@pytest.fixture
def _tohum_kullanicilar(test_db_session_fabrikasi):
    """`client` ile AYNI (StaticPool ile paylaşılan) veritabanına bir
    yönetici ve bir müşteri satırı ekler; ORM nesnelerini (id'leri ATANMIŞ
    hâlde) döner."""
    db = test_db_session_fabrikasi()
    try:
        simdi = datetime.now().isoformat()
        yonetici = KullaniciDB(
            kullanici_adi="yonetici",
            eposta="yonetici@ktu.edu.tr",
            sifre_ozeti=sifre_ozetle("yonetici123"),
            rol="yonetici",
            olusturma_zamani=simdi,
        )
        musteri = KullaniciDB(
            kullanici_adi="musteri1",
            eposta="musteri1@ktu.edu.tr",
            sifre_ozeti=sifre_ozetle("musteri123"),
            rol="musteri",
            olusturma_zamani=simdi,
        )
        db.add_all([yonetici, musteri])
        db.commit()
        db.refresh(yonetici)
        db.refresh(musteri)
        return yonetici, musteri
    finally:
        db.close()
# END test_kullanici_fixture


# BEGIN test_token_fixture
@pytest.fixture
def yonetici_token(_tohum_kullanicilar):
    """Gerçek bir `POST /auth/token` isteği ATMADAN, `token_uret` ile
    DOĞRUDAN geçerli bir yönetici JWT'si üretir (hızlı test kurulumu)."""
    yonetici, _ = _tohum_kullanicilar
    return token_uret(yonetici)


@pytest.fixture
def musteri_token(_tohum_kullanicilar):
    """Aynı mantığın müşteri hesabı için karşılığı."""
    _, musteri = _tohum_kullanicilar
    return token_uret(musteri)
# END test_token_fixture
