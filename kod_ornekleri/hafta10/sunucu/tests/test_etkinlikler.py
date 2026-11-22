"""Etkinlik rotaları için API testleri.

`GET` rotaları HERKESE açık kalır (bkz. `tests/test_yetki.py`
`test_okuma_rotalari_token_gerektirmez`); burada YAZMA rotalarının
kurulum adımları bu haftadan itibaren bir yönetici token'ı GEREKTİRİR
(`Depends(get_current_admin)`, bkz. `app/rotalar/etkinlikler.py`).
"""


def _yetkili_baslik(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


# BEGIN test_etkinlik_olustur_listele
def test_etkinlik_olustur_listele(client, yonetici_token):
    yeni = {
        "baslik": "Konser",
        "tarih": "2026-11-14",
        "mekan": "KTÜ Kültür Merkezi",
        "kapasite": 100,
        "biletFiyati": 250,
    }
    cevap = client.post(
        "/etkinlikler", json=yeni, headers=_yetkili_baslik(yonetici_token)
    )
    assert cevap.status_code == 201
    olusturulan = cevap.json()
    assert olusturulan["id"] == 1
    assert olusturulan["biletFiyati"] == 250

    liste_cevabi = client.get("/etkinlikler")
    assert liste_cevabi.status_code == 200
    assert len(liste_cevabi.json()) == 1
# END test_etkinlik_olustur_listele


# BEGIN test_etkinlik_mekan_filtre
def test_etkinlik_mekan_filtre(client, yonetici_token):
    client.post(
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
    client.post(
        "/etkinlikler",
        json={
            "baslik": "Tiyatro",
            "tarih": "2026-12-01",
            "mekan": "Salon B",
            "kapasite": 50,
            "biletFiyati": 120,
        },
        headers=_yetkili_baslik(yonetici_token),
    )

    cevap = client.get("/etkinlikler", params={"mekan": "Salon B"})
    assert cevap.status_code == 200
    sonuc = cevap.json()
    assert len(sonuc) == 1
    assert sonuc[0]["mekan"] == "Salon B"
# END test_etkinlik_mekan_filtre


# BEGIN test_etkinlik_bulunamadi_404
def test_etkinlik_bulunamadi_404(client):
    cevap = client.get("/etkinlikler/999")
    assert cevap.status_code == 404
# END test_etkinlik_bulunamadi_404


# BEGIN test_etkinlik_guncelle_sil
def test_etkinlik_guncelle_sil(client, yonetici_token):
    olusturma = client.post(
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
    etkinlik_id = olusturma.json()["id"]

    guncelleme = client.put(
        f"/etkinlikler/{etkinlik_id}",
        json={
            "baslik": "Konser (Güncel)",
            "tarih": "2026-11-15",
            "mekan": "Salon A",
            "kapasite": 120,
            "biletFiyati": 300,
        },
        headers=_yetkili_baslik(yonetici_token),
    )
    assert guncelleme.status_code == 200
    assert guncelleme.json()["baslik"] == "Konser (Güncel)"

    silme = client.delete(
        f"/etkinlikler/{etkinlik_id}", headers=_yetkili_baslik(yonetici_token)
    )
    assert silme.status_code == 204

    tekrar = client.get(f"/etkinlikler/{etkinlik_id}")
    assert tekrar.status_code == 404
# END test_etkinlik_guncelle_sil


# BEGIN test_etkinlik_dogrulama_422
def test_etkinlik_dogrulama_422(client, yonetici_token):
    cevap = client.post(
        "/etkinlikler",
        json={
            "baslik": "Konser",
            "tarih": "2026-11-14",
            "mekan": "Salon A",
            "kapasite": -3,
            "biletFiyati": 250,
        },
        headers=_yetkili_baslik(yonetici_token),
    )
    assert cevap.status_code == 422
    detay = cevap.json()["detail"]
    assert detay[0]["loc"] == ["body", "kapasite"]
# END test_etkinlik_dogrulama_422


# BEGIN test_etkinlik_sayfalama
def test_etkinlik_sayfalama(client, yonetici_token):
    for sira in range(3):
        client.post(
            "/etkinlikler",
            json={
                "baslik": f"Etkinlik {sira}",
                "tarih": "2026-11-14",
                "mekan": "Salon A",
                "kapasite": 100,
                "biletFiyati": 250,
            },
            headers=_yetkili_baslik(yonetici_token),
        )

    ilk_sayfa = client.get("/etkinlikler", params={"sayfa": 1, "boyut": 2})
    assert ilk_sayfa.status_code == 200
    assert len(ilk_sayfa.json()) == 2

    ikinci_sayfa = client.get("/etkinlikler", params={"sayfa": 2, "boyut": 2})
    assert ikinci_sayfa.status_code == 200
    assert len(ikinci_sayfa.json()) == 1

    varsayilan_sayfalama = client.get("/etkinlikler")
    assert len(varsayilan_sayfalama.json()) == 3
# END test_etkinlik_sayfalama


# BEGIN test_etkinlik_sil_cascade
def test_etkinlik_sil_satilmis_bilet_409(client, yonetici_token, musteri_token):
    olusturma = client.post(
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
    etkinlik_id = olusturma.json()["id"]
    koltuk = client.post(
        f"/etkinlikler/{etkinlik_id}/koltuklar",
        json={"sira": 1, "koltukNo": 1},
        headers=_yetkili_baslik(yonetici_token),
    ).json()
    client.post(
        "/biletler",
        json={"koltukId": koltuk["id"]},
        headers=_yetkili_baslik(musteri_token),
    )

    silme = client.delete(
        f"/etkinlikler/{etkinlik_id}", headers=_yetkili_baslik(yonetici_token)
    )
    assert silme.status_code == 409
    assert "satılmış" in silme.json()["detail"]

    hala_var = client.get(f"/etkinlikler/{etkinlik_id}")
    assert hala_var.status_code == 200


def test_etkinlik_sil_cascade_204(client, yonetici_token):
    olusturma = client.post(
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
    etkinlik_id = olusturma.json()["id"]
    client.post(
        f"/etkinlikler/{etkinlik_id}/koltuklar",
        json={"sira": 1, "koltukNo": 1},
        headers=_yetkili_baslik(yonetici_token),
    )

    silme = client.delete(
        f"/etkinlikler/{etkinlik_id}", headers=_yetkili_baslik(yonetici_token)
    )
    assert silme.status_code == 204

    # Etkinlik SİLİNDİĞİ için koltuk listesi de 404 döner (bağlı koltuklar
    # cascade ile OTOMATİK silindiğinden, artık üzerinde sorgulanacak bir
    # etkinlik yoktur).
    kalan_koltuklar = client.get(f"/etkinlikler/{etkinlik_id}/koltuklar")
    assert kalan_koltuklar.status_code == 404
# END test_etkinlik_sil_cascade
