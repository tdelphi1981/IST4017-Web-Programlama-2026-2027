import { createContext, useEffect, useState, type ReactNode } from 'react';
import type { Kullanici } from '../tipler.ts';
import { girisYap as girisYapApi, kayitOl as kayitOlApi } from '../api/auth.ts';

// BEGIN oturum_context_tipi
// Hf.5/7'nin SepetContext kalıbının YENİ bir örneği: token BELLEKTE
// tutulur (React state) + sayfa yenilemede kaybolmaması için localStorage'a
// bir YEDEK yazılır (brif "Kapsam ve hedefler" — httpOnly çerez + CSRF
// yönetiminin gereksiz karmaşıklığından KAÇINMAK için bilinçli bir karar;
// bu kararın XSS riski Hf.11'de ele alınır).
export interface OturumBaglami {
  kullanici: Kullanici | null;
  token: string | null;
  yukleniyor: boolean;
  girisYap: (kullaniciAdi: string, sifre: string) => Promise<void>;
  kayitOl: (kullaniciAdi: string, eposta: string, sifre: string) => Promise<void>;
  cikisYap: () => void;
}
// END oturum_context_tipi

export const OturumContext = createContext<OturumBaglami | null>(null);

const TOKEN_ANAHTARI = 'oturum-token';
const KULLANICI_ANAHTARI = 'oturum-kullanici';

// JWT'nin ORTA parçasını (payload) base64url çözer — bu bir DOĞRULAMA
// DEĞİLDİR (imza burada KONTROL EDİLMEZ, sunucu zaten kendi ürettiği
// token'ı döndürdüğü için buna GÜVENİLİR); yalnızca Ünite 2'nin "JWT
// KODLAMADIR, ŞİFRELEME DEĞİLDİR" dersinin somut bir uygulamasıdır — sub/
// rol claim'lerini bir /auth/me isteği ATMADAN doğrudan token'ın
// kendisinden OKUR.
function jwtPayloadCoz(token: string): { sub: string; rol: 'musteri' | 'yonetici' } {
  const [, payloadBolumu] = token.split('.');
  const json = atob(payloadBolumu.replace(/-/g, '+').replace(/_/g, '/'));
  return JSON.parse(json) as { sub: string; rol: 'musteri' | 'yonetici' };
}

interface OturumProviderProps {
  children: ReactNode;
}

// BEGIN oturum_provider
// İLK yüklendiğinde localStorage'dan hem token HEM kullanici nesnesini
// (JSON) okuyup geri yükler — ek bir ağ isteği GEREKMEZ. kayitOl() kayıt
// SONRASI otomatik olarak POST /auth/token ile GİRİŞ de yapar.
export function OturumProvider({ children }: OturumProviderProps) {
  // BEGIN oturum_provider_yukle
  const [kullanici, setKullanici] = useState<Kullanici | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const kayitliToken = localStorage.getItem(TOKEN_ANAHTARI);
    const kayitliKullanici = localStorage.getItem(KULLANICI_ANAHTARI);
    if (kayitliToken && kayitliKullanici) {
      setToken(kayitliToken);
      setKullanici(JSON.parse(kayitliKullanici) as Kullanici);
    }
    setYukleniyor(false);
  }, []);
  // END oturum_provider_yukle

  // BEGIN oturum_provider_giris
  function oturumuKaydet(yeniToken: string, yeniKullanici: Kullanici) {
    setToken(yeniToken);
    setKullanici(yeniKullanici);
    localStorage.setItem(TOKEN_ANAHTARI, yeniToken);
    localStorage.setItem(KULLANICI_ANAHTARI, JSON.stringify(yeniKullanici));
  }

  async function girisYap(kullaniciAdi: string, sifre: string) {
    const cevap = await girisYapApi(kullaniciAdi, sifre);
    const { sub, rol } = jwtPayloadCoz(cevap.accessToken);
    oturumuKaydet(cevap.accessToken, {
      id: Number(sub),
      kullaniciAdi,
      eposta: '',
      rol,
    });
  }
  // END oturum_provider_giris

  // BEGIN oturum_provider_kayit
  async function kayitOl(kullaniciAdi: string, eposta: string, sifre: string) {
    const yeniKullanici = await kayitOlApi({ kullaniciAdi, eposta, sifre });
    const cevap = await girisYapApi(kullaniciAdi, sifre);
    oturumuKaydet(cevap.accessToken, yeniKullanici);
  }
  // END oturum_provider_kayit

  function cikisYap() {
    setToken(null);
    setKullanici(null);
    localStorage.removeItem(TOKEN_ANAHTARI);
    localStorage.removeItem(KULLANICI_ANAHTARI);
  }

  const deger: OturumBaglami = {
    kullanici,
    token,
    yukleniyor,
    girisYap,
    kayitOl,
    cikisYap,
  };

  return <OturumContext.Provider value={deger}>{children}</OturumContext.Provider>;
}
// END oturum_provider
