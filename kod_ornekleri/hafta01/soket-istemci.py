#!/usr/bin/env python3
"""soket-istemci.py — Hafta 1, Unite 4

"socket" modulu ile duz bir TCP baglantisi acip, HTTP GET istegini elle
metin olarak olusturup gonderen, ham cevabi (durum satirindan govdeye
kadar) oldugu gibi ekrana basan kucuk bir istemci.

Calistirma: python3 soket-istemci.py
"""
import socket
import sys

HOST = "example.com"
PORT = 80

# BEGIN soket_istemci
# BEGIN soket_istemci_istek
istek = (
    f"GET / HTTP/1.1\r\n"
    f"Host: {HOST}\r\n"
    f"User-Agent: hafta01-soket-istemci\r\n"
    f"Accept: text/html\r\n"
    f"Connection: close\r\n"
    f"\r\n"
)
# END soket_istemci_istek

try:
    # BEGIN soket_istemci_gonder_al
    with socket.create_connection((HOST, PORT), timeout=10) as soket:
        soket.sendall(istek.encode("ascii"))
        cevap = b""
        while True:
            parca = soket.recv(4096)
            if not parca:
                break
            cevap += parca
    print(cevap.decode("utf-8", errors="replace"))
    # END soket_istemci_gonder_al
except OSError as hata:
    print(
        f"HATA: {HOST}:{PORT} adresine baglanilamadi ({hata}). "
        "Internet baglantinizi kontrol edin.",
        file=sys.stderr,
    )
    sys.exit(1)
# END soket_istemci
