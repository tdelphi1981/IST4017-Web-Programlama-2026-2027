#!/usr/bin/env bash
# statik-dinamik-istek.sh — Hafta 1, Unite 2
#
# Ayni statik kaynagi iki kez, ayni dinamik uc noktayi iki kez isteyip
# statik cevabin degismedigini, dinamik cevabin degistigini gozlemler.
#
# Calistirma: bash statik-dinamik-istek.sh

set -uo pipefail

STATIK_URL="https://example.com/"
DINAMIK_URL="https://httpbin.org/uuid"

echo "== Statik istek: ${STATIK_URL} (iki kez) =="

# BEGIN statik_istek
# example.com sunucudaki hazir bir HTML dosyasini oldugu gibi gonderir; iki
# ardisik istek birebir ayni govdeyi dondurmelidir.
ISTEK1=$(curl -sS -m 10 "${STATIK_URL}")
DURUM1=$?
ISTEK2=$(curl -sS -m 10 "${STATIK_URL}")
DURUM2=$?

if [ ${DURUM1} -ne 0 ] || [ ${DURUM2} -ne 0 ]; then
    echo "HATA: ${STATIK_URL} adresine baglanilamadi. Internet baglantinizi kontrol edin." >&2
elif [ "${ISTEK1}" = "${ISTEK2}" ]; then
    echo "Statik cevap iki istekte de BIREBIR AYNI (beklenen davranis)."
else
    echo "Statik cevap iki istekte farkli cikti (beklenmiyordu)."
fi
# END statik_istek

echo
echo "== Dinamik istek: ${DINAMIK_URL} (iki kez) =="

# BEGIN dinamik_istek
# httpbin.org/uuid her istekte YENIDEN URETILEN bir rastgele kimlik
# dondurur; bu yuzden iki ardisik istegin govdesi FARKLI olmalidir.
CEVAP1=$(curl -sS -m 10 "${DINAMIK_URL}")
DURUM3=$?
CEVAP2=$(curl -sS -m 10 "${DINAMIK_URL}")
DURUM4=$?

if [ ${DURUM3} -ne 0 ] || [ ${DURUM4} -ne 0 ]; then
    echo "HATA: ${DINAMIK_URL} adresine baglanilamadi. Internet baglantinizi kontrol edin." >&2
else
    echo "1. cevap: ${CEVAP1}"
    echo "2. cevap: ${CEVAP2}"
    if [ "${CEVAP1}" != "${CEVAP2}" ]; then
        echo "Dinamik cevap iki istekte FARKLI (beklenen davranis)."
    else
        echo "Dinamik cevap iki istekte ayni cikti (beklenmiyordu — sunucu onbellek olabilir)."
    fi
fi
# END dinamik_istek
