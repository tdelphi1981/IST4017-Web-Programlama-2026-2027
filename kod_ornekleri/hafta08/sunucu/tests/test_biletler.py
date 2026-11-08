"""Bilet rotaları ve koltuk rezervasyonu iş kuralı için testler."""


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


# BEGIN test_bilet_basarili_rezervasyon
def test_bilet_basarili_rezervasyon(client):
    _, koltuk = _etkinlik_ve_koltuk_olustur(client)

    cevap = client.post(
        "/biletler", json={"koltukId": koltuk["id"], "kullaniciAdi": "Ayşe Yılmaz"}
    )
    assert cevap.status_code == 201
    assert cevap.json()["durum"] == "olusturuldu"

    guncel_koltuk = client.get(f"/koltuklar/{koltuk['id']}")
    assert guncel_koltuk.json()["durum"] == "dolu"
# END test_bilet_basarili_rezervasyon


# BEGIN test_bilet_coklu_rezervasyon_409
def test_bilet_coklu_rezervasyon_409(client):
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
# END test_bilet_coklu_rezervasyon_409


# BEGIN test_bilet_olmayan_koltuk_404
def test_bilet_olmayan_koltuk_404(client):
    cevap = client.post(
        "/biletler", json={"koltukId": 999, "kullaniciAdi": "Ayşe Yılmaz"}
    )
    assert cevap.status_code == 404
# END test_bilet_olmayan_koltuk_404


# BEGIN test_bilet_iptal
def test_bilet_iptal(client):
    _, koltuk = _etkinlik_ve_koltuk_olustur(client)
    bilet = client.post(
        "/biletler", json={"koltukId": koltuk["id"], "kullaniciAdi": "Ayşe Yılmaz"}
    ).json()

    iptal = client.delete(f"/biletler/{bilet['id']}")
    assert iptal.status_code == 204

    guncel_koltuk = client.get(f"/koltuklar/{koltuk['id']}")
    assert guncel_koltuk.json()["durum"] == "bos"
# END test_bilet_iptal
