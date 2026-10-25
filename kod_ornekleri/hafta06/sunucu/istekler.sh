#!/usr/bin/env bash
# Hf.1 biçiminde bir curl turu — bu betik sunucu ÇALIŞIRKEN kullanılır.

# BEGIN sunucu_calistirma_notu
# Önce ayrı bir terminalde sunucuyu başlatın:
#   uvicorn app.main:app --reload
# Sunucu http://127.0.0.1:8000 adresinde dinlemeye başladıktan SONRA bu
# betiği çalıştırın: bash istekler.sh
# END sunucu_calistirma_notu

BASE_URL="http://127.0.0.1:8000"

# BEGIN etkinlik_olustur_curl
curl -i -X POST "$BASE_URL/etkinlikler" \
  -H "Content-Type: application/json" \
  -d '{"baslik": "Konser", "tarih": "2026-11-14", "mekan": "KTÜ Kültür Merkezi", "kapasite": 100, "biletFiyati": 250}'
# END etkinlik_olustur_curl

# BEGIN etkinlik_listele_curl
curl -i "$BASE_URL/etkinlikler"
# END etkinlik_listele_curl

# BEGIN koltuk_olustur_curl
curl -i -X POST "$BASE_URL/etkinlikler/1/koltuklar" \
  -H "Content-Type: application/json" \
  -d '{"sira": 1, "koltukNo": 5}'
# END koltuk_olustur_curl

# BEGIN bilet_olustur_curl
curl -i -X POST "$BASE_URL/biletler" \
  -H "Content-Type: application/json" \
  -d '{"koltukId": 1, "kullaniciAdi": "Ayşe Yılmaz"}'
# END bilet_olustur_curl

# BEGIN bilet_carpisma_409_curl
# Aynı koltuk için İKİNCİ bir bilet denemesi — 409 Conflict bekleyin.
curl -i -X POST "$BASE_URL/biletler" \
  -H "Content-Type: application/json" \
  -d '{"koltukId": 1, "kullaniciAdi": "Mehmet Demir"}'
# END bilet_carpisma_409_curl

# BEGIN etkinlik_sil_curl
curl -i -X DELETE "$BASE_URL/etkinlikler/1"
# END etkinlik_sil_curl
