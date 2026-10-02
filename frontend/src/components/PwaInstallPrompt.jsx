import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Download, X, Smartphone, Check, Sparkles } from 'lucide-react';

const PwaInstallPrompt = () => {
  const theme = useSelector((state) => state.user?.theme || "dark");
  const isLight = theme === "light";

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone mode (installed)
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      // Prevent default mini-infobar
      e.preventDefault();
      setDeferredPrompt(e);

      // Check if user dismissed install prompt recently
      const dismissedUntil = localStorage.getItem('aquamart_pwa_dismissed_until');
      if (!dismissedUntil || Date.now() > parseInt(dismissedUntil, 10)) {
        setTimeout(() => setShowInstallBanner(true), 5000);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
      console.log('AquaMart PWA installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show native install dialog
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    localStorage.setItem('aquamart_pwa_dismissed_until', (Date.now() + 5 * 24 * 60 * 60 * 1000).toString());
  };

  if (!showInstallBanner || isInstalled) return null;

  return (
    <div className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-50 max-w-sm sm:max-w-md w-[calc(100vw-24px)] animate-in fade-in slide-in-from-top-4 duration-300">
      <div className={`p-3.5 sm:p-4 rounded-3xl border shadow-2xl backdrop-blur-2xl flex items-center justify-between gap-3 ${
        isLight
          ? 'bg-white/95 border-cyan-500/30 text-slate-900 shadow-slate-300/80'
          : 'bg-slate-950/95 border-cyan-500/30 text-white shadow-black/80'
      }`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-md">
            <Smartphone size={20} />
          </div>
          <div className="min-w-0">
            <h5 className="text-xs sm:text-sm font-black truncate">Install AquaMart App</h5>
            <p className={`text-[11px] truncate ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Fast access & offline fresh catch catalog</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="py-1.5 px-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow transition-transform active:scale-95 flex items-center gap-1 cursor-pointer"
          >
            <Download size={13} />
            <span>Install</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Dismiss"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PwaInstallPrompt;
