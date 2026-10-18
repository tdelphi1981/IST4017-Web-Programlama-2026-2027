import { useState, type FormEvent } from 'react';
import type { Bilet } from '../tipler.ts';
import { useSepet } from '../hooks/useSepet.ts';

// BEGIN bilet_form_tipi
// Formun TÜM alanlarını tek bir tipte gruplar; koltukSinifi sınırlı bir
// seçenek kümesinden (standart/vip) gelir, Hf.2'nin bilet_formu HTML
// yapısının React karşılığıdır.
export interface BiletFormVeri {
  ad: string;
  koltukSinifi: 'standart' | 'vip';
  kampanyaOnay: boolean;
}

const BOS_FORM: BiletFormVeri = {
  ad: '',
  koltukSinifi: 'standart',
  kampanyaOnay: false,
};

interface BiletFormuProps {
  onBiletlerOlustu: (biletler: Bilet[]) => void;
}
// END bilet_form_tipi

let sonrakiBiletId = 1;

export function BiletFormu({ onBiletlerOlustu }: BiletFormuProps) {
  // BEGIN bilet_form_state
  // Tüm alanlar TEK bir useState çağrısında tutulur; bir alanı
  // güncellerken diğerlerini KORUMAK için yayma operatörü kullanılır
  // (Hf.4'ün değişmezlik ilkesinin form state'ine uygulanışı).
  const [form, setForm] = useState<BiletFormVeri>(BOS_FORM);
  const [hata, setHata] = useState<string | null>(null);
  const { secilenKoltuklar, sepetiTemizle } = useSepet();
  // END bilet_form_state

  // BEGIN bilet_form_dogrula_ve_submit
  // İlk satır e.preventDefault(): aksi halde tarayıcı VARSAYILAN
  // davranışıyla sayfayı yeniden yükler ve tüm React state'i sıfırlanır.
  // Sonra iki koşul kontrol edilir (ad boş mu, sepette hiç koltuk yok
  // mu); koşullardan biri sağlanmazsa hata state'i doldurulur ve Bilet[]
  // OLUŞTURULMAZ.
  // BEGIN bilet_form_dogrula_kosullar
  function submitEt(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (form.ad.trim() === '') {
      setHata('Ad alanı boş olamaz.');
      return;
    }
    if (secilenKoltuklar.length === 0) {
      setHata('Sepette en az bir koltuk seçili olmalı.');
      return;
    }
    // END bilet_form_dogrula_kosullar

    // BEGIN bilet_form_bilet_uret
    const satinAlmaZamani = new Date().toISOString();
    const yeniBiletler: Bilet[] = secilenKoltuklar.map((koltuk) => ({
      id: sonrakiBiletId++,
      koltukId: koltuk.id,
      kullaniciAdi: form.ad,
      satinAlmaZamani,
      durum: 'olusturuldu',
    }));

    onBiletlerOlustu(yeniBiletler);
    sepetiTemizle();
    setForm(BOS_FORM);
    setHata(null);
    // END bilet_form_bilet_uret
  }
  // END bilet_form_dogrula_ve_submit

  // BEGIN bilet_form_render
  return (
    <form className="bilet-formu" onSubmit={submitEt}>
      <label>
        Ad Soyad
        <input
          type="text"
          value={form.ad}
          onChange={(e) => setForm({ ...form, ad: e.target.value })}
        />
      </label>
      <label>
        Koltuk Sınıfı
        <select
          value={form.koltukSinifi}
          onChange={(e) =>
            setForm({
              ...form,
              koltukSinifi: e.target.value as BiletFormVeri['koltukSinifi'],
            })
          }
        >
          <option value="standart">Standart</option>
          <option value="vip">VIP</option>
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          checked={form.kampanyaOnay}
          onChange={(e) => setForm({ ...form, kampanyaOnay: e.target.checked })}
        />
        Kampanya duyurularını almak istiyorum
      </label>
      {hata && <p className="hata">{hata}</p>}
      <button type="submit">Bilet Oluştur</button>
    </form>
  );
  // END bilet_form_render
}
