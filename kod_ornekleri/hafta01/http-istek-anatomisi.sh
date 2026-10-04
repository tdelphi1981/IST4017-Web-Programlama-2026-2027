#!/usr/bin/env bash
# http-istek-anatomisi.sh — Hafta 1, Unite 4
#
# curl -v ile tam bir GET isteginin gidis-donus basliklarini; kucuk bir
# JSON govdeli POST isteginin cevabini gosterir.
#
# Calistirma: bash http-istek-anatomisi.sh

set -uo pipefail

echo "== GET istegi (curl -v ile giden/gelen basliklar) =="

# BEGIN get_istek_v
# "> " ile baslayan satirlar giden istegi (istek satiri + basliklar), "< "
# ile baslayan satirlar gelen cevabi (durum satiri + basliklar) gosterir.
GET_CIKTI=$(curl -sS -v -m 10 --http1.1 "https://httpbin.org/get" 2>&1)
GET_DURUM=$?
if [ ${GET_DURUM} -ne 0 ]; then
    echo "HATA: httpbin.org/get adresine baglanilamadi. Internet baglantinizi kontrol edin." >&2
else
    echo "${GET_CIKTI}" | grep -E "^(> |< )"
fi
# END get_istek_v

echo
echo "== POST istegi (JSON govde) =="

# BEGIN post_istek_govde
# -d ile verilen JSON, istegin GOVDESINDE gonderilir; httpbin bu govdeyi
# "json" alaninda aynen geri yansitir — GET'in aksine POST'un govdesi doludur.
POST_CIKTI=$(curl -sS -m 10 -X POST "https://httpbin.org/post" \
    -H "Content-Type: application/json" \
    -d '{"ogrenci":"KTU","hafta":1}')
POST_DURUM=$?
if [ ${POST_DURUM} -ne 0 ]; then
    echo "HATA: httpbin.org/post adresine baglanilamadi. Internet baglantinizi kontrol edin." >&2
else
    echo "${POST_CIKTI}"
fi
# END post_istek_govde
