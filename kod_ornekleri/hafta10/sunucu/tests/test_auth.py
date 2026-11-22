"""Kayıt/giriş rotaları ve korumalı rotaların temel 401 davranışı için testler."""


# BEGIN test_kayit_basarili
def test_kayit_basarili_201(client):
    cevap = client.post(
        "/auth/kayit",
        json={
            "kullaniciAdi": "aysenur",
            "eposta": "aysenur@ktu.edu.tr",
            "sifre": "gizli-sifre-1",
        },
    )
    assert cevap.status_code == 201
    kullanici = cevap.json()
    assert kullanici["kullaniciAdi"] == "aysenur"
    assert kullanici["rol"] == "musteri"
    # dikkat: cevapta ASLA şifre/özet alanı YER ALMAZ.
    assert "sifre" not in kullanici
    assert "sifreOzeti" not in kullanici
# END test_kayit_basarili


# BEGIN test_kayit_cakisma
def test_kayit_tekrar_kullanici_adi_409(client):
    veri = {
        "kullaniciAdi": "aysenur",
        "eposta": "aysenur@ktu.edu.tr",
        "sifre": "gizli-sifre-1",
    }
    ilk = client.post("/auth/kayit", json=veri)
    assert ilk.status_code == 201

    ikinci = client.post("/auth/kayit", json=veri)
    assert ikinci.status_code == 409
# END test_kayit_cakisma


# BEGIN test_giris_basarili
def test_giris_basarili_token_doner(client):
    client.post(
        "/auth/kayit",
        json={
            "kullaniciAdi": "aysenur",
            "eposta": "aysenur@ktu.edu.tr",
            "sifre": "gizli-sifre-1",
        },
    )

    cevap = client.post(
        "/auth/token",
        data={"username": "aysenur", "password": "gizli-sifre-1"},
    )
    assert cevap.status_code == 200
    govde = cevap.json()
    assert govde["token_type"] == "bearer"
    assert isinstance(govde["access_token"], str) and govde["access_token"] != ""
# END test_giris_basarili


# BEGIN test_giris_hatali_sifre
def test_giris_yanlis_sifre_401(client):
    client.post(
        "/auth/kayit",
        json={
            "kullaniciAdi": "aysenur",
            "eposta": "aysenur@ktu.edu.tr",
            "sifre": "gizli-sifre-1",
        },
    )

    cevap = client.post(
        "/auth/token",
        data={"username": "aysenur", "password": "yanlis-sifre"},
    )
    assert cevap.status_code == 401
# END test_giris_hatali_sifre


# BEGIN test_token_yok_401
def test_korumali_rota_token_olmadan_401(client):
    cevap = client.get("/biletlerim")
    assert cevap.status_code == 401
# END test_token_yok_401


# BEGIN test_token_gecersiz_401
def test_korumali_rota_gecersiz_token_401(client):
    cevap = client.get(
        "/biletlerim", headers={"Authorization": "Bearer gecersiz-bir-token"}
    )
    assert cevap.status_code == 401
# END test_token_gecersiz_401
