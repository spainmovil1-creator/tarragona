import React, { useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { historyData, appTranslation } from '../data';
import { ArrowLeft, Globe, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const SectionPage: React.FC = () => {
  const { sectionId } = useParams();
  const { language, setLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const t = appTranslation[language];

  const sectionIndex = historyData.findIndex(s => s.id === sectionId);
  const section = historyData[sectionIndex];

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
        window.scrollTo(0,0);
    }
  }, [location]);

  if (!section || sectionIndex === -1) {
    return <div className="p-10 text-center font-sans text-xl text-[var(--color-brand-heading)]">Sección no encontrada.</div>;
  }

  const getNavLinks = (stageIndex: number) => {
    let prevLink = null;
    if (stageIndex > 0) {
      prevLink = { to: `/section/${section.id}#${section.stages[stageIndex - 1].id}`, isSamePage: true, hash: section.stages[stageIndex - 1].id };
    } else if (sectionIndex > 0) {
      const prevSection = historyData[sectionIndex - 1];
      const targetStage = prevSection.stages[prevSection.stages.length - 1];
      prevLink = { to: `/section/${prevSection.id}#${targetStage.id}`, isSamePage: false, hash: targetStage.id };
    }

    let nextLink = null;
    if (stageIndex < section.stages.length - 1) {
      nextLink = { to: `/section/${section.id}#${section.stages[stageIndex + 1].id}`, isSamePage: true, hash: section.stages[stageIndex + 1].id };
    } else if (sectionIndex < historyData.length - 1) {
      const nextSection = historyData[sectionIndex + 1];
      const targetStage = nextSection.stages[0];
      nextLink = { to: `/section/${nextSection.id}#${targetStage.id}`, isSamePage: false, hash: targetStage.id };
    }

    return { prevLink, nextLink };
  };

  const handleNavClick = (navTarget: { to: string, isSamePage: boolean, hash: string }) => {
    navigate(navTarget.to, { replace: false });
  };

  return (
    <div className="min-h-screen bg-[var(--color-brand-bg)]">
      <div className="fixed top-4 left-4 z-50">
        <Link 
          to="/" 
          className="flex items-center gap-2 bg-[var(--color-brand-bg)]/90 backdrop-blur-md px-4 py-2 rounded-full border border-[var(--color-brand-heading)]/20 text-[var(--color-brand-heading)] shadow-md hover:bg-[var(--color-brand-bg)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-serif font-medium text-sm tracking-wide uppercase">{t.back}</span>
        </Link>
      </div>

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

      <main className="w-full pb-20 space-y-32">
        {section.stages.map((stage, index) => {
          const { prevLink, nextLink } = getNavLinks(index);
          return (
          <article 
            key={stage.id} 
            id={stage.id} 
            className="scroll-mt-16 w-full flex flex-col"
          >
            <div className="w-full relative mb-12 lg:mb-20">
                 <img 
                    src={stage.image} 
                    alt={stage.title[language]} 
                    className="w-full h-auto object-cover object-center"
                    onError={(e) => {
                       (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTZkYmFkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzZXJpZiIgZm9udC1zaXplPSI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzdhNDkwMCI+SW1hZ2VuIENhcGl0dWxvIFBlbmRpZW50ZTwvdGV4dD48L3N2Zz4=';
                    }}
                 />
                 <div className="absolute inset-x-0 bottom-0 h-40 md:h-64 bg-gradient-to-t from-[var(--color-brand-bg)] to-transparent pointer-events-none"></div>
            </div>
            
            <div className="w-full max-w-4xl mx-auto px-6">
               <h2 className="text-3xl lg:text-4xl font-serif font-bold mb-6 text-[var(--color-brand-heading)] leading-tight text-center">
                 {stage.title[language]}
               </h2>
               <div className="markdown-body font-serif text-base text-[var(--color-brand-text)] leading-relaxed text-justify">
                  <ReactMarkdown>{stage.content[language]}</ReactMarkdown>
               </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-[var(--color-brand-heading)]/20 mt-16 mb-10 mx-auto px-6 w-full max-w-4xl">
                 {prevLink ? (
                   <button 
                     onClick={() => handleNavClick(prevLink)}
                     className="flex items-center gap-2 text-base uppercase tracking-wide font-medium text-[var(--color-brand-text)] hover:text-amber-800 transition-colors py-2 px-4 rounded-lg hover:bg-black/5"
                   >
                     <ChevronLeft className="w-5 h-5" /> {language === 'es' ? 'Anterior' : 'Anterior'}
                   </button>
                 ) : <div className="w-24 hidden md:block"></div>}
                 
                 <Link to="/#index" className="flex items-center gap-2 text-sm md:text-base font-bold uppercase tracking-widest text-[var(--color-brand-heading)] hover:text-amber-800 transition-colors px-6 py-3 border border-[var(--color-brand-heading)]/30 rounded-full hover:bg-[var(--color-brand-heading)]/5">
                   <Home className="w-5 h-5" /> {t.sections}
                 </Link>
                 
                 {nextLink ? (
                   <button 
                     onClick={() => handleNavClick(nextLink)}
                     className="flex items-center gap-2 text-base uppercase tracking-wide font-medium text-[var(--color-brand-text)] hover:text-amber-800 transition-colors py-2 px-4 rounded-lg hover:bg-black/5"
                   >
                     {language === 'es' ? 'Siguiente' : 'Següent'} <ChevronRight className="w-5 h-5" />
                   </button>
                 ) : <div className="w-24 hidden md:block"></div>}
            </div>
          </article>
        )})}
      </main>
    </div>
  );
};
