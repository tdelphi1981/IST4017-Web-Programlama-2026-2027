// BEGIN fonksiyon_tanimlari
// Fonksiyon bildirimi (declaration): programın her yerinden çağrılabilir
// (hoisting), C++'taki bir fonksiyon tanımına benzer.
function carp(x, y) {
  return x * y;
}

// Fonksiyon ifadesi (expression): bir değişkene atanan anonim/isimli bir
// fonksiyon; tanımlandığı satırdan ÖNCE çağrılamaz.
const topla = function (x, y) {
  return x + y;
};

console.log("carp(3, 4):", carp(3, 4)); // 12
console.log("topla(3, 4):", topla(3, 4)); // 7
// END fonksiyon_tanimlari

// BEGIN ok_fonksiyonu_this
const sayac = {
  deger: 0,
  // Normal fonksiyon: this, ÇAĞRILDIĞI yere göre belirlenir — burada
  // sayac.artirNormal() çağrısı içinde this === sayac.
  artirNormal: function () {
    this.deger++;
    console.log("artirNormal sonrası deger:", this.deger);
  },
  // Ok fonksiyonu: this, leksik olarak TANIMLANDIĞI yerden (dış kapsamdan)
  // gelir; nesne metodu olarak kullanıldığında this artık sayac DEĞİLDİR.
  artirOk: () => {
    console.log("artirOk içindeki this sayac mı?", this === sayac);
  },
};

sayac.artirNormal(); // deger: 1
sayac.artirOk(); // false — this sayac'a bağlı değildir (leksik this)
// END ok_fonksiyonu_this
