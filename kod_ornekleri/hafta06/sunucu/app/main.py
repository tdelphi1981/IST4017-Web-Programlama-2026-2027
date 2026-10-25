"""Uygulama giriş noktası — FastAPI nesnesini oluşturur, router'ları bağlar."""

from fastapi import FastAPI

from app.rotalar import biletler, etkinlikler, koltuklar

# BEGIN uygulama_olustur
app = FastAPI(
    title="KTÜ Etkinlik ve Bilet Sistemi API",
    version="0.1.0",
)
# END uygulama_olustur


# BEGIN kok_rota
@app.get("/")
def kok_rota() -> dict[str, str]:
    return {"mesaj": "KTÜ Etkinlik ve Bilet Sistemi API'sine hoş geldiniz"}
# END kok_rota


# BEGIN router_baglama
app.include_router(etkinlikler.router)
app.include_router(koltuklar.router)
app.include_router(biletler.router)
# END router_baglama
