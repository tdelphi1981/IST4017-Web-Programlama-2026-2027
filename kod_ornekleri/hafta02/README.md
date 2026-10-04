# Hafta 2 — Kod Örnekleri

Bu klasör dersin ikinci haftası için yalnızca düz **`.html`** ve **`.css`**
dosyaları içerir. `istemci/`/`sunucu/` klasörü ve npm/Vite/TypeScript bu
haftada **yoktur** (bunlar Hf.3'ten itibaren başlar). Sayfaları tarayıcıda
doğrudan çift tıklayarak açmak yeterlidir; isteğe bağlı olarak aynı klasörde
`python3 -m http.server` ile bir sunucu açıp
`http://localhost:8000/index.html` adresinden de görüntüleyebilirsiniz — bu,
Hafta 1'de `curl` ile alınan cevabın aynı statik dosyanın bu kez gerçek bir
HTTP isteği/cevabı üzerinden geldiğini gösterir (Hf.1 Ünite 2 "statik
içerik" kavramına geri bağ).

## Dosyalar

| Dosya | Ne içerir |
|---|---|
| `index.html` | Etkinlik listesi sayfası: belge iskeleti, semantik landmark öğeleri (`header`+`nav`+`main`+`footer`), başlık hiyerarşisi, 3 etkinlik kartı (`article.etkinlik-karti`), bir etkinlik listesi tablosu. |
| `etkinlik-detay.html` | Tek bir etkinliğin detay sayfası: bilet alma adımlarının kısa bir sıralı listesi, 3×4'lük bir koltuk planı ızgarası ve bir bilet formu iskeleti (henüz `action`/gönderim yok). |
| `stiller.css` | Her iki sayfanın da bağladığı ortak stil dosyası: KTÜ paleti renk/tipografi tanımları, kutu modeli sıfırlama, nav'ı yatay/dikey dizen flex kuralları, kart ve koltuk grid'leri, `768px` eşikli duyarlı kırılım. |

## Etiketler (`\kodkesit` ile çekilecek, 13 adet)

| Dosya | Etiket |
|---|---|
| `index.html` | `belge_iskeleti`, `semantik_landmark`, `baslik_hiyerarsisi`, `etkinlik_karti`, `etkinlik_tablosu` |
| `etkinlik-detay.html` | `koltuk_plani`, `bilet_formu` |
| `stiller.css` | `renk_tipografi`, `kutu_sifirlama`, `nav_flex`, `kart_grid`, `koltuk_grid`, `duyarli_kirinim` |

Etiketler HTML'de `<!-- BEGIN etiket -->`/`<!-- END etiket -->`, CSS'te
`/* BEGIN etiket */`/`/* END etiket */` biçimindedir ve **iç içe değildir**
(`semantik_landmark` yalnızca `header`/`nav`/`main`'in açılışını taslak
olarak gösterir; `main`'in gerçek içeriği — başlık hiyerarşisi, kartlar,
tablo — kendi ayrı etiketleriyle hemen ardından, aynı `main` içinde ama
başka bir kesitte yer alır; bu sayede iki etiket bölgesi asla üst üste
binmez).

## Beklenen çıktılar (özet)

- `index.html` dar ekranda (mobil, varsayılan stil) nav öğelerini ve
  etkinlik kartlarını **tek sütun** halinde alt alta gösterir; ekran
  `768px` eşiğini aştığında (`duyarli_kirinim` medya sorgusu) nav çubuğu
  **yatay** bir flex satırına, kart listesi **3 sütunlu** bir grid'e
  dönüşür.
- `etkinlik-detay.html` açıldığında koltuk planı 3×4'lük düzenli bir
  ızgara olarak görünür (koltuklar henüz tıklanamaz, yalnızca görsel);
  bilet formu etiket-girdi çiftleriyle (ad soyad, tarih, bilet adedi,
  koltuk sınıfı) görünür ama `action` olmadığından "Gönder" düğmesine
  basıldığında sayfa aynı kalır (bu davranış Hf.3'te eklenecek).
- `stiller.css` içindeki `box-sizing: border-box` kuralı
  (`kutu_sifirlama`) olmadan kartların/formun genişlik hesapları
  beklenenden geniş çıkar; eklendikten sonra düzelir.

## Notlar

- Ekstra paket/araç kurulumu gerekmez; yalnız güncel bir tarayıcı
  (Chrome/Firefox/Edge) ve isteğe bağlı Python 3.12+'ın standart
  `http.server` modülü kullanılır.
- Renkler yalnız KTÜ paleti (`platform/araclar/sekil/palet.json`)
  değerleriyle `stiller.css`'in başındaki `:root` özel özelliklerinde
  tanımlıdır (`--renk-lacivert`, `--renk-mavi`, vb.).
- Doğrulama: her iki HTML dosyası `tidy -q -e` ile uyarısız/hatasız
  geçer; `python3 -m http.server` ile servis edilip üç dosya da
  `curl -sI` ile `200 OK` döner.
