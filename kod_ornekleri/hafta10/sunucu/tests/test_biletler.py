"""Bilet rotaları ve koltuk rezervasyonu iş kuralı için testler."""


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


# BEGIN test_bilet_basarili_rezervasyon
def test_bilet_basarili_rezervasyon(client, yonetici_token, musteri_token):
    _, koltuk = _etkinlik_ve_koltuk_olustur(client, yonetici_token)

    cevap = client.post(
        "/biletler",
        json={"koltukId": koltuk["id"]},
        headers=_yetkili_baslik(musteri_token),
    )
    assert cevap.status_code == 201
    assert cevap.json()["durum"] == "olusturuldu"

    guncel_koltuk = client.get(f"/koltuklar/{koltuk['id']}")
    assert guncel_koltuk.json()["durum"] == "dolu"
# END test_bilet_basarili_rezervasyon


# BEGIN test_bilet_coklu_rezervasyon_409
def test_bilet_coklu_rezervasyon_409(client, yonetici_token, musteri_token):
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
# END test_bilet_coklu_rezervasyon_409


# BEGIN test_bilet_olmayan_koltuk_404
def test_bilet_olmayan_koltuk_404(client, musteri_token):
    cevap = client.post(
        "/biletler",
        json={"koltukId": 999},
        headers=_yetkili_baslik(musteri_token),
    )
    assert cevap.status_code == 404
# END test_bilet_olmayan_koltuk_404


# BEGIN test_bilet_iptal
def test_bilet_iptal(client, yonetici_token, musteri_token):
    _, koltuk = _etkinlik_ve_koltuk_olustur(client, yonetici_token)
    bilet = client.post(
        "/biletler",
        json={"koltukId": koltuk["id"]},
        headers=_yetkili_baslik(musteri_token),
    ).json()

    iptal = client.delete(
        f"/biletler/{bilet['id']}", headers=_yetkili_baslik(musteri_token)
    )
    assert iptal.status_code == 204

    guncel_koltuk = client.get(f"/koltuklar/{koltuk['id']}")
    assert guncel_koltuk.json()["durum"] == "bos"
# END test_bilet_iptal
