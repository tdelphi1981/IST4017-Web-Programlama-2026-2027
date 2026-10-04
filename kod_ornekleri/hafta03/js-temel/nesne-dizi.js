// BEGIN nesne_literal
// Nesne literal: süslü parantez içinde alan adı: değer çiftleri.
const etkinlik = {
  ad: "Konser",
  tarih: "2026-11-14",
  kapasite: 500,
};
console.log("etkinlik:", etkinlik);
// END nesne_literal

// BEGIN dizi_metotlari
// Etkinlik benzeri küçük bir dizi üzerinde yaygın dizi metotları.
const etkinlikler = [
  { ad: "Bahar Konseri", kapasite: 500 },
  { ad: "Kariyer Günleri", kapasite: 800 },
  { ad: "Tiyatro Gecesi", kapasite: 250 },
];

// map: her elemanı dönüştürüp AYNI uzunlukta yeni bir dizi üretir.
const adlar = etkinlikler.map((e) => e.ad);
console.log("adlar:", adlar);

// filter: koşulu sağlayan elemanlardan yeni bir dizi üretir.
const buyukEtkinlikler = etkinlikler.filter((e) => e.kapasite >= 500);
console.log("buyukEtkinlikler:", buyukEtkinlikler);

// find: koşulu sağlayan İLK elemanı döndürür, bulunamazsa undefined.
const tiyatro = etkinlikler.find((e) => e.ad === "Tiyatro Gecesi");
console.log("tiyatro:", tiyatro);
// END dizi_metotlari

// BEGIN spread_kopyalama
// Yayma (spread) operatörü: bir dizinin/nesnenin elemanlarını "yayarak"
// sığ (shallow) bir kopyasını oluşturur — orijinal referansı DEĞİL, yeni
// bir dizi/nesne referansı üretir.
const etkinliklerKopya = [...etkinlikler];
etkinliklerKopya.push({ ad: "Yeni Etkinlik", kapasite: 100 });
console.log("etkinlikler.length:", etkinlikler.length); // 3 — orijinal etkilenmedi
console.log("etkinliklerKopya.length:", etkinliklerKopya.length); // 4

const etkinlikGuncel = { ...etkinlik, kapasite: 600 };
console.log("etkinlik.kapasite:", etkinlik.kapasite); // 500 — orijinal etkilenmedi
console.log("etkinlikGuncel.kapasite:", etkinlikGuncel.kapasite); // 600
// END spread_kopyalama
