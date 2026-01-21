import { useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useLanguage } from '../context/LanguageContext';

export default function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
    reducedMotion,
    setReducedMotion,
    screenReaderMode,
    setScreenReaderMode,
    announce,
  } = useAccessibility();
  
  const { currentLang, changeLanguage, t, languages } = useLanguage();

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    announce(`Font size changed to ${size}`);
  };

  const handleContrastToggle = () => {
    setHighContrast(!highContrast);
    announce(`High contrast ${!highContrast ? 'enabled' : 'disabled'}`);
  };

  const handleMotionToggle = () => {
    setReducedMotion(!reducedMotion);
    announce(`Motion ${!reducedMotion ? 'reduced' : 'enabled'}`);
  };

  const handleScreenReaderToggle = () => {
    setScreenReaderMode(!screenReaderMode);
    announce(`Screen reader mode ${!screenReaderMode ? 'enabled' : 'disabled'}`);
  };

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    announce(`Language changed to ${languages.find(l => l.code === langCode)?.name}`);
  };

  return (
    <>
      {/* Floating Accessibility Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#53556586] hover:bg-[#525577] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
        aria-label={t('a11y.settings')}
        aria-expanded={isOpen}
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Accessibility Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#505b74] to-[#181e2c] p-4 flex items-center justify-between">
            <h3 className="text-white font-bold text-lg">{t('a11y.settings')}</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg p-1"
              aria-label={t('a11y.close')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {/* Font Size */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('a11y.fontSize')}
              </label>
              <div className="flex gap-2">
                {['small', 'medium', 'large', 'xl'].map((size) => (
                  <button
                    key={size}
                    onClick={() => handleFontSizeChange(size)}
                    className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all ${
                      fontSize === size
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    aria-pressed={fontSize === size}
                  >
                    {size === 'small' && 'A'}
                    {size === 'medium' && 'A+'}
                    {size === 'large' && 'A++'}
                    {size === 'xl' && 'A+++'}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('a11y.language')}
              </label>
              <select
                value={currentLang}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Toggle Switches */}
            <div className="space-y-3">
              {/* High Contrast */}
              <div className="flex items-center justify-between">
                <label htmlFor="highContrast" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('a11y.contrast')}
                </label>
                <button
                  id="highContrast"
                  onClick={handleContrastToggle}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    highContrast ? 'bg-[#1d1f34]' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  role="switch"
                  aria-checked={highContrast}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      highContrast ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between">
                <label htmlFor="reducedMotion" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('a11y.reducedMotion')}
                </label>
                <button
                  id="reducedMotion"
                  onClick={handleMotionToggle}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    reducedMotion ? 'bg-indigo-700' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  role="switch"
                  aria-checked={reducedMotion}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      reducedMotion ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Screen Reader Mode */}
              <div className="flex items-center justify-between">
                <label htmlFor="screenReader" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('a11y.screenReader')}
                </label>
                <button
                  id="screenReader"
                  onClick={handleScreenReaderToggle}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    screenReaderMode ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  role="switch"
                  aria-checked={screenReaderMode}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      screenReaderMode ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Settings are saved automatically
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Skip to Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:shadow-lg"
      >
        {t('a11y.skipToContent')}
      </a>
    </>
  );
}
