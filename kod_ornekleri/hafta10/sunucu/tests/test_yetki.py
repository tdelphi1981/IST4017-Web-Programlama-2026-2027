"""Rota x rol yetki matrisi testleri — 401 (kimliksiz) vs 403 (yetkisiz) ve
sahiplik kontrolü."""


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


# BEGIN test_okuma_herkese_acik
def test_okuma_rotalari_token_gerektirmez(client, yonetici_token):
    etkinlik, koltuk = _etkinlik_ve_koltuk_olustur(client, yonetici_token)

    assert client.get("/etkinlikler").status_code == 200
    assert client.get(f"/etkinlikler/{etkinlik['id']}").status_code == 200
    assert (
        client.get(f"/etkinlikler/{etkinlik['id']}/koltuklar").status_code == 200
    )
    assert client.get(f"/koltuklar/{koltuk['id']}").status_code == 200
# END test_okuma_herkese_acik


# BEGIN test_etkinlik_olustur_403
def test_musteri_ile_etkinlik_olusturma_403(client, musteri_token):
    cevap = client.post(
        "/etkinlikler",
        json={
            "baslik": "Konser",
            "tarih": "2026-11-14",
            "mekan": "Salon A",
            "kapasite": 100,
            "biletFiyati": 250,
        },
        headers=_yetkili_baslik(musteri_token),
    )
    assert cevap.status_code == 403

    tokensiz = client.post(
        "/etkinlikler",
        json={
            "baslik": "Konser",
            "tarih": "2026-11-14",
            "mekan": "Salon A",
            "kapasite": 100,
            "biletFiyati": 250,
        },
    )
    assert tokensiz.status_code == 401
# END test_etkinlik_olustur_403


# BEGIN test_etkinlik_olustur_201_admin
def test_yonetici_ile_etkinlik_olusturma_201(client, yonetici_token):
    cevap = client.post(
        "/etkinlikler",
        json={
            "baslik": "Konser",
            "tarih": "2026-11-14",
            "mekan": "Salon A",
            "kapasite": 100,
            "biletFiyati": 250,
        },
        headers=_yetkili_baslik(yonetici_token),
    )
    assert cevap.status_code == 201
# END test_etkinlik_olustur_201_admin


# BEGIN test_koltuk_secme_musteri
def test_koltuk_secme_musteri_ile_calisir(client, yonetici_token, musteri_token):
    _, koltuk = _etkinlik_ve_koltuk_olustur(client, yonetici_token)

    cevap = client.patch(
        f"/koltuklar/{koltuk['id']}",
        json={"durum": "secili"},
        headers=_yetkili_baslik(musteri_token),
    )
    assert cevap.status_code == 200
    assert cevap.json()["durum"] == "secili"
# END test_koltuk_secme_musteri


# BEGIN test_bilet_iptal_403_sahiplik
def test_baskasinin_biletini_iptal_403(client, yonetici_token, musteri_token):
    _, koltuk = _etkinlik_ve_koltuk_olustur(client, yonetici_token)
    bilet = client.post(
        "/biletler",
        json={"koltukId": koltuk["id"]},
        headers=_yetkili_baslik(musteri_token),
    ).json()

    # yönetici KENDİSİNİN olmayan bu bileti iptal etmeye çalışır — admin
    # override YOKTUR, bu yüzden 403 alır.
    iptal = client.delete(
        f"/biletler/{bilet['id']}", headers=_yetkili_baslik(yonetici_token)
    )
    assert iptal.status_code == 403
# END test_bilet_iptal_403_sahiplik


# BEGIN test_bilet_iptal_204_sahibi
def test_kendi_biletini_iptal_204(client, yonetici_token, musteri_token):
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
# END test_bilet_iptal_204_sahibi


# BEGIN test_biletlerim_filtre
def test_biletlerim_sadece_kendi_biletleri(client, yonetici_token, musteri_token):
    _, koltuk_1 = _etkinlik_ve_koltuk_olustur(client, yonetici_token)
    etkinlik, _ = _etkinlik_ve_koltuk_olustur(client, yonetici_token)
    koltuk_2 = client.post(
        f"/etkinlikler/{etkinlik['id']}/koltuklar",
        json={"sira": 2, "koltukNo": 1},
        headers=_yetkili_baslik(yonetici_token),
    ).json()

    # müşteri bir bilet alır, yönetici de KENDİ adına bir bilet alır.
    client.post(
        "/biletler",
        json={"koltukId": koltuk_1["id"]},
        headers=_yetkili_baslik(musteri_token),
    )
    client.post(
        "/biletler",
        json={"koltukId": koltuk_2["id"]},
        headers=_yetkili_baslik(yonetici_token),
    )

    musteri_biletleri = client.get(
        "/biletlerim", headers=_yetkili_baslik(musteri_token)
    ).json()
    assert len(musteri_biletleri) == 1

    # yalnızca yönetici TÜM biletleri görebilir (GET /biletler).
    tum_biletler = client.get(
        "/biletler", headers=_yetkili_baslik(yonetici_token)
    ).json()
    assert len(tum_biletler) == 2

    musteri_tum_biletler_denemesi = client.get(
        "/biletler", headers=_yetkili_baslik(musteri_token)
    )
    assert musteri_tum_biletler_denemesi.status_code == 403
# END test_biletlerim_filtre
