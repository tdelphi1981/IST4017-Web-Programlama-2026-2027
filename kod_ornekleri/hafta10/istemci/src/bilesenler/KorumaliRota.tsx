import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useOturum } from '../hooks/useOturum.ts';

interface KorumaliRotaProps {
  children: ReactNode;
  rolGerekli?: 'yonetici';
}

// BEGIN korumali_rota_bilesen
// yukleniyor iken (localStorage'dan geri yükleme anı) KISA bir gösterge;
// kullanici === null iken /giris'e YÖNLENDİRİR (Hf.7'nin Route/Outlet
// bilgisinin üzerine inşa edilir) — bu 401'in istemci tarafındaki
// karşılığıdır ("SEN kimsin, önce giriş yap"). rolGerekli VERİLMİŞ ve
// kullanicinin rolü UYUŞMUYORSA Navigate YAPILMAZ (kullanıcı zaten giriş
// yapmıştır) — bunun yerine bir "yetkiniz yok" mesajı gösterilir; bu da
// 403'ün istemci tarafındaki karşılığıdır.
export function KorumaliRota({ children, rolGerekli }: KorumaliRotaProps) {
  // BEGIN korumali_rota_yonlendirme
  const { kullanici, yukleniyor } = useOturum();

  if (yukleniyor) {
    return <p className="sayfa-yukleniyor">Yükleniyor…</p>;
  }

  if (kullanici === null) {
    return <Navigate to="/giris" replace />;
  }
  // END korumali_rota_yonlendirme

  // BEGIN korumali_rota_yetki
  if (rolGerekli && kullanici.rol !== rolGerekli) {
    return (
      <p className="sayfa-hata">
        Bu sayfayı görüntülemek için {rolGerekli} yetkisine sahip olmalısınız.
      </p>
    );
  }

  return <>{children}</>;
  // END korumali_rota_yetki
}
// END korumali_rota_bilesen
