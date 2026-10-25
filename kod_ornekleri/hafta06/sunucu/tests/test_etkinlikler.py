"""Etkinlik rotaları için ilk API testleri."""


# BEGIN test_etkinlik_olustur_listele
def test_etkinlik_olustur_listele(client):
    yeni = {
        "baslik": "Konser",
        "tarih": "2026-11-14",
        "mekan": "KTÜ Kültür Merkezi",
        "kapasite": 100,
        "biletFiyati": 250,
    }
    cevap = client.post("/etkinlikler", json=yeni)
    assert cevap.status_code == 201
    olusturulan = cevap.json()
    assert olusturulan["id"] == 1
    assert olusturulan["biletFiyati"] == 250

    liste_cevabi = client.get("/etkinlikler")
    assert liste_cevabi.status_code == 200
    assert len(liste_cevabi.json()) == 1
# END test_etkinlik_olustur_listele


# BEGIN test_etkinlik_mekan_filtre
def test_etkinlik_mekan_filtre(client):
    client.post(
        "/etkinlikler",
        json={
            "baslik": "Konser",
            "tarih": "2026-11-14",
            "mekan": "Salon A",
            "kapasite": 100,
            "biletFiyati": 250,
        },
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
def test_etkinlik_guncelle_sil(client):
    olusturma = client.post(
        "/etkinlikler",
        json={
            "baslik": "Konser",
            "tarih": "2026-11-14",
            "mekan": "Salon A",
            "kapasite": 100,
            "biletFiyati": 250,
        },
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
    )
    assert guncelleme.status_code == 200
    assert guncelleme.json()["baslik"] == "Konser (Güncel)"

    silme = client.delete(f"/etkinlikler/{etkinlik_id}")
    assert silme.status_code == 204

    tekrar = client.get(f"/etkinlikler/{etkinlik_id}")
    assert tekrar.status_code == 404
# END test_etkinlik_guncelle_sil


# BEGIN test_etkinlik_dogrulama_422
def test_etkinlik_dogrulama_422(client):
    cevap = client.post(
        "/etkinlikler",
        json={
            "baslik": "Konser",
            "tarih": "2026-11-14",
            "mekan": "Salon A",
            "kapasite": -3,
            "biletFiyati": 250,
        },
    )
    assert cevap.status_code == 422
    detay = cevap.json()["detail"]
    assert detay[0]["loc"] == ["body", "kapasite"]
# END test_etkinlik_dogrulama_422
