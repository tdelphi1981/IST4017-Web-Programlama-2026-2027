// BEGIN closure_sayac
// olusturSayac(), her çağrıldığında kendi bağımsız "deger" değişkenine
// sahip YENİ bir fonksiyon döndürür. Dönen iç fonksiyon, dış fonksiyon
// (olusturSayac) çoktan çalışmasını bitirmiş olsa bile "deger"e erişmeye
// devam eder — bu, closure'ın tanımıdır.
function olusturSayac() {
  let deger = 0;
  return function () {
    deger++;
    return deger;
  };
}

const sayac1 = olusturSayac();
const sayac2 = olusturSayac();

console.log("sayac1():", sayac1()); // 1
console.log("sayac1():", sayac1()); // 2
console.log("sayac2():", sayac2()); // 1 — sayac1'den bağımsız kendi deger'i
console.log("sayac1():", sayac1()); // 3
// END closure_sayac
