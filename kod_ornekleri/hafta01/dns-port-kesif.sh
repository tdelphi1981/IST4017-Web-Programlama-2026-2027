#!/usr/bin/env bash
# dns-port-kesif.sh — Hafta 1, Unite 1
#
# Bir alan adinin IP adresine nasil cozumlendigini (DNS) ve curl'un fiilen
# hangi IP:port ikilisine baglandigini gozlemler.
#
# Platform notu: bu betik "dig" komutunu kullanir (macOS/Linux'ta hazir
# gelir). Windows'ta dig genelde kurulu degildir; ayni isi
# "nslookup www.example.com" komutu gorur — cikti bicimi farkli olsa da
# "Address:" satiri ayni IP adresini gosterir.
#
# Calistirma: bash dns-port-kesif.sh

set -uo pipefail

ALAN_ADI="www.example.com"

echo "== DNS cozumleme: ${ALAN_ADI} =="

# BEGIN dns_cozumleme
# "dig +short" yalnizca cozumlenen IP adres(ler)ini basar (ANSWER bolumunun
# ozeti); Windows'ta karsiligi "nslookup www.example.com" olup cikti
# icindeki "Address:" satiri ayni IP'yi gosterir.
if ! command -v dig >/dev/null 2>&1; then
    echo "HATA: 'dig' komutu bulunamadi. Windows'ta yerine 'nslookup ${ALAN_ADI}' calistirin." >&2
else
    DIG_CIKTI=$(dig +short "${ALAN_ADI}" A 2>&1)
    DIG_DURUM=$?
    if [ ${DIG_DURUM} -ne 0 ] || [ -z "${DIG_CIKTI}" ]; then
        echo "HATA: '${ALAN_ADI}' cozumlenemedi. Internet/DNS baglantinizi kontrol edin." >&2
    else
        echo "${DIG_CIKTI}"
    fi
fi
# END dns_cozumleme

echo
echo "== Port gozlemi: curl -v ile baglanti satiri =="

# BEGIN port_gozlemi
# curl -v ciktisinin "Connected to ... port ..." satiri, tarayicinin/curl'un
# DNS'ten aldigi IP adresine hangi porttan (https icin varsayilan 443)
# baglandigini gosterir.
CURL_CIKTI=$(curl -sS -v -m 10 "https://${ALAN_ADI}" -o /dev/null 2>&1)
CURL_DURUM=$?
if [ ${CURL_DURUM} -ne 0 ]; then
    echo "HATA: https://${ALAN_ADI} adresine baglanilamadi (curl kodu: ${CURL_DURUM}). Internet baglantinizi kontrol edin." >&2
else
    echo "${CURL_CIKTI}" | grep -i "Connected to"
fi
# END port_gozlemi
