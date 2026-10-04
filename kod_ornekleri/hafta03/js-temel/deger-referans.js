// BEGIN deger_referans
// İlkel değer: kopyalanarak atanır (C++'taki "int b = a;" gibi bir kopya).
let a = 5;
let b = a;
b = 10;
console.log("a:", a); // 5 — b'nin değişmesi a'yı etkilemez

// Nesne/dizi: değişken her zaman ortak belleğe işaret eden bir referans
// taşır (C++'taki T&/pointer semantiğine benzer; "kopya" seçeneği yoktur).
let dizi1 = [1, 2, 3];
let dizi2 = dizi1;
dizi2.push(4);
console.log("dizi1:", dizi1); // [1, 2, 3, 4] — dizi2 ile AYNI diziyi işaret eder

// Aynı fikir fonksiyon parametresinde de geçerlidir: dizi bir referans
// olarak geçirilir, fonksiyon içindeki değişiklik dışarıdan da görünür.
function ekle(dizi) {
  dizi.push(99);
}
let sayilar = [1, 2, 3];
ekle(sayilar);
console.log("sayilar:", sayilar); // [1, 2, 3, 99]
// END deger_referans
