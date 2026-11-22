"""Aynı koltuğa yapılan rezervasyon denemelerinin transaction korumasını test eder."""

from concurrent.futures import ThreadPoolExecutor
from datetime import datetime

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.guvenlik import sifre_ozetle, token_uret
from app.main import app
from app.orm_modeller import KullaniciDB
from app.veritabani import Base, get_db, sqlite_yazma_kilidi_uygula


def _yetkili_baslik(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def _etkinlik_ve_koltuk_olustur(client, yonetici_token):
    etkinlik = client.post(
        "/etkinlikler",
        json={
            "baslik": "Konser",
            "tarih": "2026-11-14",
            "mekan": "Salon A",
            "kapasite": 100,
            "biletFiyati": 250,
        },
        headers=_yetkili_baslik(yonetici_token),
    ).json()
    koltuk = client.post(
        f"/etkinlikler/{etkinlik['id']}/koltuklar",
        json={"sira": 1, "koltukNo": 5},
        headers=_yetkili_baslik(yonetici_token),
    ).json()
    return etkinlik, koltuk


# BEGIN test_ardisik_rezervasyon_409
def test_ardisik_rezervasyon_409(client, yonetici_token, musteri_token):
    """Aynı koltuk için ARDIŞIK iki POST /biletler isteği — ikincisi 409 döner."""
    _, koltuk = _etkinlik_ve_koltuk_olustur(client, yonetici_token)

    ilk = client.post(
        "/biletler",
        json={"koltukId": koltuk["id"]},
        headers=_yetkili_baslik(musteri_token),
    )
    assert ilk.status_code == 201

    ikinci = client.post(
        "/biletler",
        json={"koltukId": koltuk["id"]},
        headers=_yetkili_baslik(yonetici_token),
    )
    assert ikinci.status_code == 409
    assert "satılmış" in ikinci.json()["detail"]

    # Sunucuda TEK bir bilet vardır — ikinci isteğin YAZDIĞI hiçbir kayıt YOK.
    biletler = client.get("/biletler", headers=_yetkili_baslik(yonetici_token)).json()
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
    try:
        with TestClient(app) as istemci:
            # Bu test conftest'in yönetici_token/musteri_token fixture'larını
            # KULLANMAZ (kendi ayrı veritabanını kurduğu için) — aynı deseni
            # (token_uret ile doğrudan JWT üretme) burada TEKRARLAR.
            db = session_fabrikasi()
            simdi = datetime.now().isoformat()
            musteri_1 = KullaniciDB(
                kullanici_adi="musteri_1",
                eposta="musteri1@ktu.edu.tr",
                sifre_ozeti=sifre_ozetle("sifre123"),
                rol="musteri",
                olusturma_zamani=simdi,
            )
            musteri_2 = KullaniciDB(
                kullanici_adi="musteri_2",
                eposta="musteri2@ktu.edu.tr",
                sifre_ozeti=sifre_ozetle("sifre123"),
                rol="yonetici",
                olusturma_zamani=simdi,
            )
            db.add_all([musteri_1, musteri_2])
            db.commit()
            db.refresh(musteri_1)
            db.refresh(musteri_2)
            token_1 = token_uret(musteri_1)
            token_2 = token_uret(musteri_2)
            db.close()

            _, koltuk = _etkinlik_ve_koltuk_olustur(istemci, token_2)

            def rezervasyon_yap(token: str):
                return istemci.post(
                    "/biletler",
                    json={"koltukId": koltuk["id"]},
                    headers=_yetkili_baslik(token),
                )

            with ThreadPoolExecutor(max_workers=2) as havuz:
                gorev_1 = havuz.submit(rezervasyon_yap, token_1)
                gorev_2 = havuz.submit(rezervasyon_yap, token_2)
                cevap_1 = gorev_1.result()
                cevap_2 = gorev_2.result()
    finally:
        app.dependency_overrides.pop(get_db, None)

    durum_kodlari = sorted([cevap_1.status_code, cevap_2.status_code])
    assert durum_kodlari == [201, 409]
# END test_esz_zamanli_rezervasyon_threading
