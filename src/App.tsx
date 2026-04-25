import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { Home } from './pages/Home';
import { SectionPage } from './pages/SectionPage';
import { VoiceAssistant } from './components/VoiceAssistant';

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/section/:sectionId" element={<SectionPage />} />
        </Routes>
        <VoiceAssistant />
      </BrowserRouter>
    </LanguageProvider>
  );
}
