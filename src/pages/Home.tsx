import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { historyData, appTranslation } from '../data';
import { Globe } from 'lucide-react';

export const Home: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const t = appTranslation[language];
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#index') {
      const el = document.getElementById('index');
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-[var(--color-brand-bg)]">
      <div className="fixed top-4 right-4 z-50">
        <label className="flex items-center gap-2 bg-[var(--color-brand-bg)]/90 backdrop-blur-md px-4 py-2 rounded-full border border-[var(--color-brand-heading)]/20 text-[var(--color-brand-heading)] shadow-md hover:bg-[var(--color-brand-bg)] transition-colors cursor-pointer">
          <Globe className="w-5 h-5" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'es' | 'ca')}
            className="bg-transparent outline-none font-serif text-base font-bold cursor-pointer appearance-none"
          >
            <option value="es">ES</option>
            <option value="ca">CA</option>
          </select>
        </label>
      </div>

      <section className="relative w-full h-[100vh] bg-black overflow-hidden flex items-center justify-center">
        <picture className="w-full h-full">
          <source media="(min-width: 800px)" srcSet="/images/portadahorizontal.jpg" />
          <source media="(min-width: 500px)" srcSet="/images/portadatablet.jpg" />
          <img 
             src="/images/portadamovil.jpg" 
             alt="Portada Tarragona" 
             className="w-full h-full object-cover object-center"
             onError={(e) => {
               (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIlMjMwMDAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9InNlcmlmIiBmb250LXNpemU9IjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjZmZmIj5Qb3J0YWRhPC90ZXh0Pjwvc3ZnPg==';
             }}
          />
        </picture>
      </section>

      <main id="index" className="w-full max-w-7xl mx-auto px-6 py-16 md:py-24">
        <h2 className="text-3xl font-serif text-[var(--color-brand-heading)] mb-12 text-center border-b border-[#7a4900]/20 pb-4">{t.sections}</h2>
        <div className="flex flex-col gap-12">
          {historyData.map((section) => (
            <div 
              key={section.id} 
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border hover:shadow-xl transition-shadow border-[#7a4900]/20 flex flex-col md:flex-row overflow-hidden"
            >
              <Link to={`/section/${section.id}`} className="md:w-1/3 w-full shrink-0 relative block group">
                  <img 
                     src={section.image} 
                     alt={section.title[language]} 
                     className="w-full h-full object-cover min-h-[16rem] group-hover:scale-105 transition-transform duration-700 ease-in-out"
                     onError={(e) => {
                       (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTZkYmFkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzZXJpZiIgZm9udC1zaXplPSI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzdhNDkwMCI+SW1hZ2VuIFNlY2Npb24gUGVuZGllbnRlPC90ZXh0Pjwvc3ZnPg==';
                     }}
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
              </Link>
              <div className="p-6 md:p-10 md:w-2/3 w-full flex flex-col">
                  <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                     <Link to={`/section/${section.id}`} className="text-2xl md:text-3xl font-serif font-bold text-[var(--color-brand-heading)] hover:text-amber-800 transition-colors">
                       {section.title[language]}
                     </Link>
                  </div>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {section.stages.map(stage => (
                       <li key={stage.id} className="group">
                         <Link to={`/section/${section.id}#${stage.id}`} className="flex items-start gap-3">
                            <span className="text-[var(--color-brand-heading)]/50 mt-1 shrink-0 group-hover:text-[var(--color-brand-heading)] transition-colors">▪</span>
                            <span className="text-sm md:text-base font-serif text-[var(--color-brand-text)] group-hover:text-amber-800 transition-colors leading-snug">
                              {stage.title[language]}
                            </span>
                         </Link>
                       </li>
                    ))}
                  </ul>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
