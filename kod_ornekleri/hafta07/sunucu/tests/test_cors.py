"""app/main.py'ye eklenen CORSMiddleware yapılandırmasının testleri."""


# BEGIN test_cors_izinli_origin
def test_cors_izinli_origin(client):
    cevap = client.get(
        "/etkinlikler", headers={"Origin": "http://localhost:5173"}
    )
    assert cevap.status_code == 200
    assert cevap.headers["access-control-allow-origin"] == "http://localhost:5173"
# END test_cors_izinli_origin


# BEGIN test_cors_izinsiz_origin
def test_cors_izinsiz_origin(client):
    cevap = client.get(
        "/etkinlikler", headers={"Origin": "http://localhost:4000"}
    )
    # İstek sunucuda yine de ÇALIŞIR (200 döner) — CORS bir sunucu
    # yetkilendirmesi DEĞİL, tarayıcının cevabı SAKLAMASINI sağlayan bir
    # başlık mekanizmasıdır; izinsiz origin'de yalnızca bu başlık EKSİK
    # olur, tarayıcı cevabı JS koduna ULAŞTIRMAZ.
    assert cevap.status_code == 200
    assert "access-control-allow-origin" not in cevap.headers
# END test_cors_izinsiz_origin
