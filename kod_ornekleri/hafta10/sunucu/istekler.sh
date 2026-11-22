#!/usr/bin/env bash
# Hf.1 biçiminde bir curl turu — bu betik sunucu ÇALIŞIRKEN kullanılır.

# BEGIN sunucu_calistirma_notu
# Önce ayrı bir terminalde sunucuyu başlatın:
#   uvicorn app.main:app --reload
# Sunucu http://127.0.0.1:8000 adresinde dinlemeye başladıktan SONRA
# örnek verileri yükleyin (yönetici/musteri1 hesapları DAHİL):
#   python -m app.tohum
# ve bu betiği çalıştırın: bash istekler.sh
# END sunucu_calistirma_notu

BASE_URL="http://127.0.0.1:8000"

# BEGIN auth_kayit_curl
# Yeni bir hesap açar (201) — ikinci kez ÇALIŞTIRILIRSA 409 Conflict alırsınız.
curl -i -X POST "$BASE_URL/auth/kayit" \
  -H "Content-Type: application/json" \
  -d '{"kullaniciAdi": "aysenur", "eposta": "aysenur@ktu.edu.tr", "sifre": "gizli-sifre-1"}'
# END auth_kayit_curl

# BEGIN auth_token_curl
# OAuth2 standardı gereği FORM-ENCODED (application/x-www-form-urlencoded),
# JSON DEĞİL — username/password OAuth2'nin SABİT alan adlarıdır. Dönen
# access_token'ı bir sonraki adımda kullanmak üzere bir değişkende saklayın.
TOKEN=$(curl -s -X POST "$BASE_URL/auth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=yonetici&password=yonetici123" | python3 -c 'import sys,json;print(json.load(sys.stdin)["access_token"])')
echo "Alınan token: $TOKEN"
# END auth_token_curl

# BEGIN etkinlik_olustur_curl
# Etkinlik/koltuk YAZMA rotaları artık yönetici token'ı GEREKTİRİR.
curl -i -X POST "$BASE_URL/etkinlikler" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"baslik": "Konser", "tarih": "2026-11-14", "mekan": "KTÜ Kültür Merkezi", "kapasite": 100, "biletFiyati": 250}'
# END etkinlik_olustur_curl

# BEGIN etkinlik_listele_curl
# Okuma rotaları herkese AÇIK kalır — token GEREKMEZ.
curl -i "$BASE_URL/etkinlikler"
# END etkinlik_listele_curl

# BEGIN etkinlik_sayfalama_curl
# Sayfalama: en fazla 2 kayıt döner (sayfa=1, boyut=2).
curl -i "$BASE_URL/etkinlikler?sayfa=1&boyut=2"
# END etkinlik_sayfalama_curl

# BEGIN koltuk_olustur_curl
curl -i -X POST "$BASE_URL/etkinlikler/1/koltuklar" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"sira": 1, "koltukNo": 5}'
# END koltuk_olustur_curl

# BEGIN korumali_istek_curl
# Tokensiz bir yazma denemesi 401 (kimliksiz) DÖNER — bir sonraki adımla kıyaslayın.
curl -i -X POST "$BASE_URL/biletler" \
  -H "Content-Type: application/json" \
  -d '{"koltukId": 1}'
# END korumali_istek_curl

# BEGIN bilet_olustur_curl
# Bilet oluşturma artık oturumdaki kullanıcıya BAĞLANIR — gövdede kullaniciAdi
# YOKTUR, kim aldığı token'dan ÇIKARILIR.
curl -i -X POST "$BASE_URL/biletler" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"koltukId": 1}'
# END bilet_olustur_curl

# BEGIN bilet_carpisma_409_curl
# Aynı koltuk için İKİNCİ bir bilet denemesi — 409 Conflict bekleyin.
curl -i -X POST "$BASE_URL/biletler" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"koltukId": 1}'
# END bilet_carpisma_409_curl

# BEGIN etkinlik_sil_curl
curl -i -X DELETE "$BASE_URL/etkinlikler/1" -H "Authorization: Bearer $TOKEN"
# END etkinlik_sil_curl
