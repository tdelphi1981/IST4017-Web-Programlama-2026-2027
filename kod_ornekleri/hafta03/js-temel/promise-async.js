// BEGIN promise_zinciri
// Bir Promise: "şu an sonucu yok ama ileride ya başarıyla ya hatayla
// sonuçlanacak" bir söz. Burada gecikmeli bir "bilet oluşturma" işlemini
// setTimeout ile sarıp .then()/.catch() zinciriyle tüketiyoruz.
function biletOlusturSoz(ad) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`${ad} için bilet oluşturuldu`);
    }, 200);
  });
}

console.log("[then] istek gönderildi");
biletOlusturSoz("Ayşe")
  .then((sonuc) => {
    console.log("[then] sonuç:", sonuc);
  })
  .catch((hata) => {
    console.error("[then] hata:", hata);
  });
// END promise_zinciri

// BEGIN async_await_ornek
// Aynı işlem, async/await ile senkron görünümlü biçimde: await yalnızca
// içinde bulunduğu async fonksiyonu duraklatır, TÜM programı bloklamaz.
async function biletOlusturAsync(ad) {
  console.log("[async] istek gönderildi");
  const sonuc = await biletOlusturSoz(ad);
  console.log("[async] sonuç:", sonuc);
  return sonuc;
}

biletOlusturAsync("Mehmet");
// END async_await_ornek
