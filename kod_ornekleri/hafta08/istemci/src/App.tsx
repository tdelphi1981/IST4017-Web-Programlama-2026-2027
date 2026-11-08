import { BrowserRouter, Route, Routes } from 'react-router';
import { Duzen } from './bilesenler/Duzen.tsx';
import { EtkinliklerSayfasi } from './sayfalar/EtkinliklerSayfasi.tsx';
import { EtkinlikDetaySayfasi } from './sayfalar/EtkinlikDetaySayfasi.tsx';
import { BiletlerimSayfasi } from './sayfalar/BiletlerimSayfasi.tsx';
import { BulunamadiSayfasi } from './sayfalar/BulunamadiSayfasi.tsx';

// BEGIN app_router
// Uygulamanın TAMAMI artık BrowserRouter içinde yaşar; Routes içindeki
// Route'lar SIRAYLA değerlendirilir, İLK eşleşen yol RENDER edilir.
// Route element={<Duzen />} İÇİNE yerleştirilen İÇ Route'lar (index,
// "etkinlikler/:id", "biletlerim") HEP AYNI Duzen nav çubuğunun ALTINDA
// görünür (Duzen'in <Outlet /> yer tutucusu SAYESİNDE); path="*" EN SONDA
// tanımlanır, tanımsız her adres için BulunamadiSayfasi render edilir.
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Duzen />}>
          <Route index element={<EtkinliklerSayfasi />} />
          <Route path="etkinlikler/:id" element={<EtkinlikDetaySayfasi />} />
          <Route path="biletlerim" element={<BiletlerimSayfasi />} />
          <Route path="*" element={<BulunamadiSayfasi />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
// END app_router
