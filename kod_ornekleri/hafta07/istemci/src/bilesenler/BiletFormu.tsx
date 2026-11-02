import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import type { Bilet } from '../tipler.ts';
import { useSepet } from '../hooks/useSepet.ts';
import { ApiHatasi } from '../api/istemci.ts';
import { biletOlustur } from '../api/biletler.ts';

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

export function BiletFormu({ onBiletlerOlustu }: BiletFormuProps) {
  // BEGIN bilet_form_state
  // Tüm alanlar TEK bir useState çağrısında tutulur; bir alanı
  // güncellerken diğerlerini KORUMAK için yayma operatörü kullanılır
  // (Hf.4'ün değişmezlik ilkesinin form state'ine uygulanışı).
  const [form, setForm] = useState<BiletFormVeri>(BOS_FORM);
  const [hata, setHata] = useState<string | null>(null);
  const { secilenKoltuklar, sepetiTemizle } = useSepet();
  // END bilet_form_state
  const navigate = useNavigate();

  // BEGIN bilet_form_gonder_api
  // İlk satır e.preventDefault(): aksi halde tarayıcı VARSAYILAN
  // davranışıyla sayfayı yeniden yükler ve tüm React state'i sıfırlanır.
  // Doğrulama AYNI kalır (ad boş mu, sepette hiç koltuk yok mu); ama
  // artık her seçili koltuk için GERÇEK bir POST /biletler isteği
  // (biletOlustur) gönderilir. Sunucu bu ARADA koltuğu BAŞKASINA
  // satmışsa 409 döner — apiPost bunu bir ApiHatasi olarak fırlatır,
  // burada YAKALANIP kullanıcıya GÖSTERİLİR (Hf.6'da yalnızca curl ile
  // gözlenen bu iş kuralı artık GERÇEK arayüze yansır). Başarıda
  // useNavigate ile /biletlerim'e yönlendirilir.
  // BEGIN bilet_form_dogrulama
  async function submitEt(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (form.ad.trim() === '') {
      setHata('Ad alanı boş olamaz.');
      return;
    }
    if (secilenKoltuklar.length === 0) {
      setHata('Sepette en az bir koltuk seçili olmalı.');
      return;
    }
    // END bilet_form_dogrulama

    // BEGIN bilet_form_basarili
    try {
      const yeniBiletler = await Promise.all(
        secilenKoltuklar.map((koltuk) =>
          biletOlustur({ koltukId: koltuk.id, kullaniciAdi: form.ad }),
        ),
      );

      onBiletlerOlustu(yeniBiletler);
      sepetiTemizle();
      setHata(null);
      const kullaniciAdi = form.ad;
      setForm(BOS_FORM);
      navigate(`/biletlerim?kullaniciAdi=${encodeURIComponent(kullaniciAdi)}`);
      // END bilet_form_basarili
    } catch (e) {
      // BEGIN bilet_form_hata
      if (e instanceof ApiHatasi && e.status === 409) {
        setHata('Seçtiğiniz koltuklardan biri bu arada başkasına satıldı.');
      } else {
        setHata('Bilet oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
      }
      // END bilet_form_hata
    }
  }
  // END bilet_form_gonder_api

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
