"""Uygulama giriş noktası — FastAPI nesnesini oluşturur, router'ları bağlar."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import orm_modeller  # noqa: F401  (ORM modellerinin Base'e KAYDI için)
from app.rotalar import biletler, etkinlikler, koltuklar
from app.veritabani import Base, engine

# BEGIN uygulama_olustur
app = FastAPI(
    title="KTÜ Etkinlik ve Bilet Sistemi API",
    version="0.1.0",
)
# END uygulama_olustur


# BEGIN tablo_olustur
# Uygulama BAŞLARKEN, henüz YOKSA, tüm ORM modellerinin (EtkinlikDB,
# KoltukDB, BiletDB) tablolarını bilet.db dosyasında oluşturur. Bu çağrı
# MEVCUT bir tabloyu ASLA GÜNCELLEMEZ — bir sütun eklerseniz create_all
# bunu MEVCUT tabloya yansıtmaz (dikkat: gerçek bir projede şema
# değişiklikleri Alembic gibi bir göç [migration] aracıyla sürüm sürüm
# kaydedilir; bu ders bu aracı KULLANMAZ, yalnızca ADINI anar).
Base.metadata.create_all(engine)
# END tablo_olustur


# BEGIN cors_ayari
# Bu haftanın sunucu değişikliği DEĞİLDİR (Hf.7'den AYNEN kalır): tarayıcı,
# Vite geliştirme sunucusunun (http://localhost:5173) origin'inden bu
# API'nin (8000) origin'ine fetch attığında varsayılan olarak cevabı JS
# koduna okutturmaz (aynı-origin politikası). CORSMiddleware, sunucunun
# cevaplarına "bu cevabı localhost:5173 okuyabilir" başlığını (ve
# gerektiğinde preflight OPTIONS cevabını) ekler. allow_origins bilinçli
# olarak yalnızca geliştirme adresini içerir — "*" (herkese izin) üretim
# ortamında güvenlik riski taşır (ayrıntı Hf.11).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# END cors_ayari


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
