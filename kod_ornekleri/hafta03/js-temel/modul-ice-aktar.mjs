// BEGIN modul_ice_aktar
// import ile önceki dosyadan adlandırılmış export'u alıp kullanma.
import { fiyatHesapla } from "./modul-disa-aktar.mjs";

const toplam = fiyatHesapla(150, 3);
console.log("toplam:", toplam); // 450
// END modul_ice_aktar
