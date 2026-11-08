"""Aynı koltuğa yapılan rezervasyon denemelerinin transaction korumasını test eder."""

from concurrent.futures import ThreadPoolExecutor

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.veritabani import Base, get_db, sqlite_yazma_kilidi_uygula


def _etkinlik_ve_koltuk_olustur(client):
    etkinlik = client.post(
        "/etkinlikler",
        json={
            "baslik": "Konser",
            "tarih": "2026-11-14",
            "mekan": "Salon A",
            "kapasite": 100,
            "biletFiyati": 250,
        },
    ).json()
    koltuk = client.post(
        f"/etkinlikler/{etkinlik['id']}/koltuklar",
        json={"sira": 1, "koltukNo": 5},
    ).json()
    return etkinlik, koltuk


# BEGIN test_ardisik_rezervasyon_409
def test_ardisik_rezervasyon_409(client):
    """Aynı koltuk için ARDIŞIK iki POST /biletler isteği — ikincisi 409 döner."""
    _, koltuk = _etkinlik_ve_koltuk_olustur(client)

    ilk = client.post(
        "/biletler", json={"koltukId": koltuk["id"], "kullaniciAdi": "Ayşe Yılmaz"}
    )
    assert ilk.status_code == 201

    ikinci = client.post(
        "/biletler", json={"koltukId": koltuk["id"], "kullaniciAdi": "Mehmet Demir"}
    )
    assert ikinci.status_code == 409
    assert "satılmış" in ikinci.json()["detail"]

    # Sunucuda TEK bir bilet vardır — ikinci isteğin YAZDIĞI hiçbir kayıt YOK.
    biletler = client.get("/biletler").json()
    assert len(biletler) == 1
# END test_ardisik_rezervasyon_409


# BEGIN test_esz_zamanli_rezervasyon_threading
def test_esz_zamanli_rezervasyon_threading(tmp_path):
    """OPSİYONEL: GERÇEKTEN eşzamanlı iki istek — yalnızca biri 201, diğeri 409 alır.

    Diğer testlerin paylaştığı tek-bağlantılı `:memory:` veritabanının
    AKSİNE, bu test kendi dosya tabanlı SQLite veritabanını (ayrı gerçek
    bağlantılarla) kurar — GERÇEK bir SQLite dosya kilidinin iki ayrı
    bağlantı arasında NASIL çalıştığını sınar; bu yüzden zamanlamaya
    DUYARLIDIR ve diğer testlerden AYRI, kendi fixture'ını kurar.
    """
    # BEGIN test_esz_kurulum
    db_yolu = tmp_path / "esz_zamanli_test.db"
    # `timeout=30`: ikinci bağlantının BEGIN IMMEDIATE'i, ilki commit edene
    # kadar en çok 30 s bekler (SQLite busy timeout; varsayılan 5 s, yüklü bir
    # makinede iki iş parçacığı yarışırken yetmeyebilir ve test kararsızlaşır).
    engine = create_engine(
        f"sqlite:///{db_yolu}",
        connect_args={"check_same_thread": False, "timeout": 30},
    )
    sqlite_yazma_kilidi_uygula(engine)
    Base.metadata.create_all(engine)
    session_fabrikasi = sessionmaker(bind=engine)

    def get_db_gecersiz_kil():
        db = session_fabrikasi()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = get_db_gecersiz_kil
    # END test_esz_kurulum
    try:
        # BEGIN test_esz_istek_gonder
        with TestClient(app) as istemci:
            _, koltuk = _etkinlik_ve_koltuk_olustur(istemci)

            def rezervasyon_yap(kullanici_adi: str):
                return istemci.post(
                    "/biletler",
                    json={"koltukId": koltuk["id"], "kullaniciAdi": kullanici_adi},
                )

            with ThreadPoolExecutor(max_workers=2) as havuz:
                gorev_1 = havuz.submit(rezervasyon_yap, "Ayşe Yılmaz")
                gorev_2 = havuz.submit(rezervasyon_yap, "Mehmet Demir")
                cevap_1 = gorev_1.result()
                cevap_2 = gorev_2.result()
        # END test_esz_istek_gonder
    finally:
        app.dependency_overrides.pop(get_db, None)

    # BEGIN test_esz_sonuc
    durum_kodlari = sorted([cevap_1.status_code, cevap_2.status_code])
    assert durum_kodlari == [201, 409]
    # END test_esz_sonuc
# END test_esz_zamanli_rezervasyon_threading
