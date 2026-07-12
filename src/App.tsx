import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PresentationProvider } from './context/PresentationContext';
import { PresentationMode } from './components/PresentationMode';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Dag1 } from './pages/Dag1';
import { Dag2 } from './pages/Dag2';
import { Projekt } from './pages/Projekt';
import { Ordbog } from './pages/Ordbog';
import { Intune } from './pages/Intune';
import { AuthCallback } from './pages/AuthCallback';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <PresentationProvider>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="dag-1" element={<Dag1 />} />
              <Route path="dag-2" element={<Dag2 />} />
              <Route path="projekt" element={<Projekt />} />
              <Route path="ordbog" element={<Ordbog />} />
              <Route path="intune" element={<Intune />} />
            </Route>
          </Routes>
          <PresentationMode />
        </PresentationProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
