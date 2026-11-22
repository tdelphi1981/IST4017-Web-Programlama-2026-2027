import { useState, type FormEvent } from 'react';
import type { Etkinlik } from '../tipler.ts';
import { useOturum } from '../hooks/useOturum.ts';
import { useVeri } from '../hooks/useVeri.ts';
import { etkinlikleriGetir } from '../api/etkinlikler.ts';
import { apiPost, apiDelete, ApiHatasi } from '../api/istemci.ts';
import { Yukleniyor } from '../bilesenler/Yukleniyor.tsx';
import { HataMesaji } from '../bilesenler/HataMesaji.tsx';

interface EtkinlikOlusturGirdisi {
  baslik: string;
  tarih: string;
  mekan: string;
  kapasite: number;
  biletFiyati: number;
}

const BOS_FORM: EtkinlikOlusturGirdisi = {
  baslik: '',
  tarih: '',
  mekan: '',
  kapasite: 1,
  biletFiyati: 0,
};

// BEGIN yonetici_paneli_sayfasi
// KorumaliRota rolGerekli="yonetici" İÇİNE alınır (bkz. App.tsx) — bu
// sayfaya yalnızca yönetici rolündeki kullanıcılar ULAŞABİLİR. Yeni
// etkinlik ekleme formu POST /etkinlikler'e token ile istek atar; mevcut
// etkinlikleri listeleyip her biri için DELETE /etkinlikler/{id} + token
// çağıran bir "sil" düğmesi sunar.
export function YoneticiPaneli() {
  const { token } = useOturum();
  const [form, setForm] = useState<EtkinlikOlusturGirdisi>(BOS_FORM);
  const [hata, setHata] = useState<string | null>(null);
  const [yenilemeSayaci, setYenilemeSayaci] = useState(0);

  const durum = useVeri<Etkinlik[]>(
    (signal) => etkinlikleriGetir(undefined, signal),
    [yenilemeSayaci],
  );

  async function submitEt(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHata(null);
    try {
      await apiPost<EtkinlikOlusturGirdisi, Etkinlik>('/etkinlikler', form, {
        token,
      });
      setForm(BOS_FORM);
      setYenilemeSayaci((onceki) => onceki + 1);
    } catch (e) {
      if (e instanceof ApiHatasi) {
        setHata('Etkinlik eklenirken bir hata oluştu.');
      }
    }
  }

  async function etkinlikSil(id: number) {
    await apiDelete(`/etkinlikler/${id}`, { token });
    setYenilemeSayaci((onceki) => onceki + 1);
  }

  return (
    <>
      <section className="bolum">
        <h2>Yönetici Paneli — Yeni Etkinlik</h2>
        <form className="oturum-form" onSubmit={submitEt}>
          <label>
            Başlık
            <input
              type="text"
              value={form.baslik}
              onChange={(e) => setForm({ ...form, baslik: e.target.value })}
            />
          </label>
          <label>
            Tarih
            <input
              type="date"
              value={form.tarih}
              onChange={(e) => setForm({ ...form, tarih: e.target.value })}
            />
          </label>
          <label>
            Mekân
            <input
              type="text"
              value={form.mekan}
              onChange={(e) => setForm({ ...form, mekan: e.target.value })}
            />
          </label>
          <label>
            Kapasite
            <input
              type="number"
              min={1}
              value={form.kapasite}
              onChange={(e) => setForm({ ...form, kapasite: Number(e.target.value) })}
            />
          </label>
          <label>
            Bilet fiyatı (TL)
            <input
              type="number"
              min={0}
              value={form.biletFiyati}
              onChange={(e) =>
                setForm({ ...form, biletFiyati: Number(e.target.value) })
              }
            />
          </label>
          {hata && <p className="hata">{hata}</p>}
          <button type="submit">Etkinlik Ekle</button>
        </form>
      </section>

      <section className="bolum">
        <h2>Mevcut Etkinlikler</h2>
        {durum.tur === 'yukleniyor' && <Yukleniyor />}
        {durum.tur === 'hata' && <HataMesaji mesaj={durum.mesaj} />}
        {durum.tur === 'basarili' && (
          <ul className="yonetici-panel-liste">
            {durum.veri.map((etkinlik) => (
              <li key={etkinlik.id}>
                {etkinlik.baslik} — {etkinlik.tarih} · {etkinlik.mekan}
                <button type="button" onClick={() => etkinlikSil(etkinlik.id)}>
                  Sil
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
// END yonetici_paneli_sayfasi
