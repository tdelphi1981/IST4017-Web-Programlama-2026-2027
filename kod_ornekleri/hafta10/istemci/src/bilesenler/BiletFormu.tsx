import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router';
import type { Bilet } from '../tipler.ts';
import { useSepet } from '../hooks/useSepet.ts';
import { useOturum } from '../hooks/useOturum.ts';
import { ApiHatasi } from '../api/istemci.ts';
import { biletOlustur } from '../api/biletler.ts';

// BEGIN bilet_form_tipi
// Formun TÜM alanlarını tek bir tipte gruplar; eski serbest metin
// kullaniciAdi alanı KALDIRILMIŞTIR (Hf.10: kim aldığı token'dan gelir) —
// yalnızca koltukSinifi/kampanyaOnay, Hf.2'nin bilet_formu HTML yapısının
// geri kalan React karşılığıdır.
export interface BiletFormVeri {
  koltukSinifi: 'standart' | 'vip';
  kampanyaOnay: boolean;
}

const BOS_FORM: BiletFormVeri = {
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
  const { kullanici, token } = useOturum();
  // END bilet_form_state
  const navigate = useNavigate();

  // Giriş YAPILMAMIŞSA form YERİNE bir uyarı+bağlantı gösterilir — bilet
  // almak (koltuk seçmek gibi) giriş GEREKTİRİR.
  if (kullanici === null) {
    return (
      <p className="giris-uyarisi">
        Bilet almak için <Link to="/giris">giriş yapın</Link>.
      </p>
    );
  }

  // BEGIN bilet_form_gonder_api
  // İlk satır e.preventDefault(): aksi halde tarayıcı VARSAYILAN
  // davranışıyla sayfayı yeniden yükler ve tüm React state'i sıfırlanır.
  // Sepette hiç koltuk yoksa doğrulama HATA verir; her seçili koltuk için
  // GERÇEK bir POST /biletler isteği (biletOlustur, token İLE) gönderilir.
  // Sunucu bu ARADA koltuğu BAŞKASINA satmışsa 409 döner — apiPost bunu
  // bir ApiHatasi olarak fırlatır, burada YAKALANIP kullanıcıya
  // GÖSTERİLİR. Başarıda useNavigate ile /biletlerim'e yönlendirilir.
  async function submitEt(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // BEGIN bilet_form_gonder_token
    if (secilenKoltuklar.length === 0) {
      setHata('Sepette en az bir koltuk seçili olmalı.');
      return;
    }

    try {
      const yeniBiletler = await Promise.all(
        secilenKoltuklar.map((koltuk) =>
          biletOlustur({ koltukId: koltuk.id }, token),
        ),
      );
      // END bilet_form_gonder_token

      // BEGIN bilet_form_gonder_409
      onBiletlerOlustu(yeniBiletler);
      sepetiTemizle();
      setHata(null);
      setForm(BOS_FORM);
      navigate('/biletlerim');
    } catch (e) {
      if (e instanceof ApiHatasi && e.status === 409) {
        setHata('Seçtiğiniz koltuklardan biri bu arada başkasına satıldı.');
      } else {
        setHata('Bilet oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    }
    // END bilet_form_gonder_409
  }
  // END bilet_form_gonder_api

  // BEGIN bilet_form_render
  return (
    <form className="bilet-formu" onSubmit={submitEt}>
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
