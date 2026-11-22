import { BrowserRouter, Route, Routes } from 'react-router';
import { OturumProvider } from './context/OturumContext.tsx';
import { Duzen } from './bilesenler/Duzen.tsx';
import { KorumaliRota } from './bilesenler/KorumaliRota.tsx';
import { EtkinliklerSayfasi } from './sayfalar/EtkinliklerSayfasi.tsx';
import { EtkinlikDetaySayfasi } from './sayfalar/EtkinlikDetaySayfasi.tsx';
import { BiletlerimSayfasi } from './sayfalar/BiletlerimSayfasi.tsx';
import { GirisSayfasi } from './sayfalar/GirisSayfasi.tsx';
import { KayitSayfasi } from './sayfalar/KayitSayfasi.tsx';
import { YoneticiPaneli } from './sayfalar/YoneticiPaneli.tsx';
import { BulunamadiSayfasi } from './sayfalar/BulunamadiSayfasi.tsx';

// BEGIN app_router
// Uygulamanın TAMAMI artık HEM BrowserRouter HEM OturumProvider içinde
// yaşar (OturumProvider dıştadır — useOturum() her rotada kullanılabilir
// olmalıdır, ör. Duzen'in nav çubuğu). "giris"/"kayit" herkese AÇIK
// rotalardır; "biletlerim" KorumaliRota İÇİNE, "yonetici" ise
// KorumaliRota rolGerekli="yonetici" İÇİNE alınır — giriş YAPMAMIŞ bir
// kullanıcı /biletlerim'e giderse ANINDA /giris'e yönlendirilir; giriş
// yapmış bir müşteri /yonetici'ye giderse bir "yetkiniz yok" mesajı görür.
export function App() {
  return (
    <BrowserRouter>
      <OturumProvider>
        <Routes>
          <Route element={<Duzen />}>
            <Route index element={<EtkinliklerSayfasi />} />
            <Route path="etkinlikler/:id" element={<EtkinlikDetaySayfasi />} />
            <Route path="giris" element={<GirisSayfasi />} />
            <Route path="kayit" element={<KayitSayfasi />} />
            <Route
              // BEGIN app_router_korumali
              path="biletlerim"
              element={
                <KorumaliRota>
                  <BiletlerimSayfasi />
                </KorumaliRota>
              }
              // END app_router_korumali
            />
            <Route
              path="yonetici"
              element={
                <KorumaliRota rolGerekli="yonetici">
                  <YoneticiPaneli />
                </KorumaliRota>
              }
            />
            <Route path="*" element={<BulunamadiSayfasi />} />
          </Route>
        </Routes>
      </OturumProvider>
    </BrowserRouter>
  );
}
// END app_router
