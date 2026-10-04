// BEGIN prototip_zinciri
// Bir nesnede bulunmayan özellik, prototip zincirinde yukarı doğru aranır.
// Object.create ile elle bir prototip bağı kuruyoruz (C++'ta olmayan,
// çalışma zamanına özgü bir mekanizma).
const katilimciProto = {
  selamla() {
    return `Merhaba, ben ${this.ad}`;
  },
};

const katilimci1 = Object.create(katilimciProto);
katilimci1.ad = "Ayşe";

console.log(katilimci1.selamla()); // "Merhaba, ben Ayşe"
// katilimci1'in kendi üzerinde "selamla" YOK; JS bunu prototipinde bulur.
console.log("kendi özelliği mi?", Object.hasOwn(katilimci1, "selamla")); // false
// END prototip_zinciri

// BEGIN sinif_sozdizimi
// Aynı davranış, ES6 class söz dizimiyle: bu, prototip mekanizmasının
// üstüne kurulmuş okunaklı bir kısayoldur ("syntactic sugar").
class Katilimci {
  constructor(ad) {
    this.ad = ad;
  }

  selamla() {
    return `Merhaba, ben ${this.ad}`;
  }
}

const katilimci2 = new Katilimci("Mehmet");
console.log(katilimci2.selamla()); // "Merhaba, ben Mehmet"
// class ile tanımlanan metotlar da aslında prototip üzerindedir.
console.log(
  "selamla prototipte mi?",
  Object.hasOwn(Katilimci.prototype, "selamla")
); // true
// END sinif_sozdizimi
