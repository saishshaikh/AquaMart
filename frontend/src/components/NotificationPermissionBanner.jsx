import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Bell, X, Sparkles, Check, Flame, ShieldCheck, AlertCircle } from 'lucide-react';
import { 
  isPushNotificationSupported, 
  getCurrentPushSubscription, 
  subscribeUserToPush 
} from '../utils/pushNotification';

const NotificationPermissionBanner = () => {
  const theme = useSelector((state) => state.user?.theme || "dark");
  const isLight = theme === "light";

  const [isVisible, setIsVisible] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Check if push is supported
    if (!isPushNotificationSupported()) return;

    // Check if user already granted permission or dismissed recently
    if (Notification.permission === 'granted') return;

    const dismissedUntil = localStorage.getItem('aquamart_notif_dismissed_until');
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      return;
    }

    // Delay display slightly (3.5 seconds) so user gets comfortable with the page first
    const timer = setTimeout(async () => {
      try {
        const existingSub = await getCurrentPushSubscription();
        if (!existingSub && Notification.permission !== 'denied') {
          setIsVisible(true);
        }
      } catch (err) {
        // Safe fail
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  const handleEnable = async () => {
    setIsSubscribing(true);
    setStatusMessage('');

    try {
      await subscribeUserToPush();
      setIsSuccess(true);
      setStatusMessage('🎉 Notifications enabled! Check your screen for a welcome alert.');
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    } catch (error) {
      console.log('Push subscription error:', error);
      if (Notification.permission === 'denied') {
        setStatusMessage('Permission was denied in browser settings. You can re-enable anytime.');
      } else {
        setStatusMessage(error.message || 'Could not enable notifications.');
      }
      setTimeout(() => {
        setIsVisible(false);
      }, 3500);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Remember dismissal for 2 days
    localStorage.setItem('aquamart_notif_dismissed_until', (Date.now() + 2 * 24 * 60 * 60 * 1000).toString());
  };

  if (!isVisible) return null;

  return (
    <aside 
      aria-label="Notification Permission Request"
      className="fixed bottom-20 sm:bottom-6 left-4 sm:left-6 z-50 max-w-sm sm:max-w-md w-[calc(100vw-32px)] animate-in slide-in-from-bottom-5 duration-400"
    >
      <div className={`p-4 sm:p-5 rounded-3xl border shadow-2xl backdrop-blur-2xl transition-all ${
        isLight
          ? 'bg-white/95 border-cyan-500/30 text-slate-900 shadow-slate-300/80'
          : 'bg-slate-950/95 border-cyan-500/30 text-white shadow-black/80'
      }`}>

        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-cyan-500/30">
            <Bell size={20} className="animate-bounce" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs sm:text-sm font-black tracking-tight flex items-center gap-1.5">
                <span>Get notified about new offers & updates 🔔</span>
              </h4>
              <button 
                onClick={handleDismiss}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 -mr-1 rounded-lg transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X size={15} />
              </button>
            </div>

            <p className={`text-[11px] sm:text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Receive instant alerts for fresh morning hauls 🐟, weekend seafood discounts 🔥, and real-time live order dispatch tracking 🚚.
            </p>

            {statusMessage && (
              <div className={`mt-2.5 p-2 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 ${
                isSuccess 
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400'
              }`}>
                {isSuccess ? <Check size={14} /> : <AlertCircle size={14} />}
                <span>{statusMessage}</span>
              </div>
            )}

            {!isSuccess && (
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={handleEnable}
                  disabled={isSubscribing}
                  className="flex-1 py-2 px-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-cyan-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSubscribing ? (
                    <span className="animate-pulse">Enabling...</span>
                  ) : (
                    <>
                      <Sparkles size={13} />
                      <span>Enable Notifications</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDismiss}
                  disabled={isSubscribing}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                >
                  Not Now
                </button>
              </div>
            )}

          </div>
        </div>

      </div>
    </aside>
  );
};

export default NotificationPermissionBanner;
