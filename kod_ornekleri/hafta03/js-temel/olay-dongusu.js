// BEGIN olay_dongusu_sirasi
// JS tek iş parçacığında çalışır: çağrı yığını tamamen boşalmadan görev
// kuyruğundaki hiçbir iş alınmaz. setTimeout(fn, 0) bile "hemen" değil,
// "sıra gelince" demektir; mikro görev kuyruğu (Promise) makro görev
// kuyruğundan (setTimeout) ÖNCE boşaltılır.
console.log("A"); // senkron
setTimeout(() => console.log("B"), 0); // makro görev kuyruğu
Promise.resolve().then(() => console.log("C")); // mikro görev kuyruğu
console.log("D"); // senkron

// Beklenen sıra: A, D, C, B
// END olay_dongusu_sirasi
