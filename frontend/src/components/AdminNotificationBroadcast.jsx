import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { 
  Bell, Send, Radio, Smartphone, Monitor, Sparkles, 
  CheckCircle2, AlertCircle, RefreshCw, Tag, Flame, 
  Gift, Package, Truck, Megaphone, Users, Image as ImageIcon, Link as LinkIcon
} from 'lucide-react';
import { serverUrl } from '../App';

const NOTIFICATION_TEMPLATES = [
  {
    name: "🔥 Weekend Seafood Bonanza",
    title: "🔥 Weekend Special: 20% OFF Fresh Surmai!",
    message: "Wild caught Silver Pomfret & Tiger Prawns fresh off the docks. Use code WEEKEND20 at checkout!",
    url: "/products?category=Fresh%20Fish",
    type: "discount",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600"
  },
  {
    name: "🐟 Morning Dock Fresh Catch",
    title: "🐟 Morning Haul Alert: Fresh Catch Just Landed!",
    message: "Surmai, Rawas, and White Shrimps arrived at Mumbai Harbour Terminal. Order before stock finishes!",
    url: "/products",
    type: "new_product",
    image: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=600"
  },
  {
    name: "🎁 Free Delivery Offer",
    title: "🎁 Free Express Delivery on Orders above ₹499",
    message: "Get ultra-fast insulated 30-min delivery with 100% ice pack cooling. Order now!",
    url: "/products",
    type: "offer",
    image: ""
  },
  {
    name: "🚚 30-Min Fast Dispatch Announcement",
    title: "🚚 Live GPS Tracking is now active in your area!",
    message: "Track your delivery partner live on radar map with verified 4-digit OTP security.",
    url: "/delivery",
    type: "delivery",
    image: ""
  }
];

const AdminNotificationBroadcast = () => {
  const theme = useSelector((state) => state.user?.theme || "dark");
  const isLight = theme === "light";

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [url, setUrl] = useState('/products');
  const [image, setImage] = useState('');
  const [type, setType] = useState('promo');
  const [target, setTarget] = useState('all');

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await axios.get(`${serverUrl}/api/notification/stats`, {
        withCredentials: true
      });
      if (res.data?.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.log("Could not fetch notification stats:", err.message);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleApplyTemplate = (tmpl) => {
    setTitle(tmpl.title);
    setMessage(tmpl.message);
    setUrl(tmpl.url);
    setImage(tmpl.image || '');
    setType(tmpl.type);
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setErrorMessage("Title and message are required.");
      return;
    }

    setSending(true);
    setErrorMessage('');
    setSendResult(null);

    try {
      const res = await axios.post(
        `${serverUrl}/api/notification/broadcast`,
        {
          title,
          message,
          url,
          image: image.trim() || undefined,
          type,
          target
        },
        { withCredentials: true }
      );

      if (res.data?.success) {
        setSendResult(res.data);
        fetchStats();
      }
    } catch (err) {
      console.error("Broadcast failed:", err);
      setErrorMessage(err.response?.data?.message || err.message || "Broadcast sending failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`rounded-3xl border p-6 sm:p-8 space-y-8 backdrop-blur-xl shadow-2xl ${
      isLight 
        ? 'bg-white/90 border-slate-200 text-slate-900 shadow-slate-200/60' 
        : 'bg-slate-900/70 border-white/10 text-white shadow-black/60'
    }`}>
      
      {/* HEADER & SUBSCRIBER METRICS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
              <Megaphone size={20} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Web Push Broadcast & Notifications 📢
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Send instant push notifications to mobile & desktop browsers of subscribed seafood customers.
              </p>
            </div>
          </div>
        </div>

        {/* SUBSCRIBER METRICS CHIPS */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className={`px-4 py-2.5 rounded-2xl border flex items-center gap-2.5 ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'
          }`}>
            <Smartphone size={17} className="text-cyan-500" />
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Total Subscribers</p>
              <p className="text-sm font-black text-cyan-500">{stats?.totalSubscribers ?? 0}</p>
            </div>
          </div>

          <div className={`px-4 py-2.5 rounded-2xl border flex items-center gap-2.5 ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'
          }`}>
            <Monitor size={17} className="text-blue-500" />
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Mobile / Desktop</p>
              <p className="text-sm font-black">
                {stats?.mobileSubscribers ?? 0} <span className="text-slate-500 font-normal">/</span> {stats?.desktopSubscribers ?? 0}
              </p>
            </div>
          </div>

          <button
            onClick={fetchStats}
            disabled={loadingStats}
            title="Refresh Subscriber Counts"
            className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
            }`}
          >
            <RefreshCw size={16} className={loadingStats ? "animate-spin text-cyan-500" : ""} />
          </button>
        </div>
      </div>

      {/* QUICK TEMPLATES */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-500 flex items-center gap-1.5">
          <Sparkles size={14} /> Quick Broadcast Templates
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {NOTIFICATION_TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyTemplate(tmpl)}
              className={`p-3 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-98 cursor-pointer ${
                isLight 
                  ? 'bg-slate-50 hover:bg-cyan-50/50 border-slate-200 hover:border-cyan-400' 
                  : 'bg-white/5 hover:bg-cyan-500/10 border-white/10 hover:border-cyan-500/30'
              }`}
            >
              <p className="text-xs font-bold truncate">{tmpl.name}</p>
              <p className={`text-[11px] truncate mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{tmpl.title}</p>
            </button>
          ))}
        </div>
      </div>

      {/* MAIN BROADCAST FORM & LIVE PREVIEW GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* FORM (7 Cols) */}
        <form onSubmit={handleBroadcast} className="lg:col-span-7 space-y-4">
          
          {/* Notification Title */}
          <div>
            <label className="block text-xs font-bold mb-1.5 flex items-center justify-between">
              <span>Notification Title *</span>
              <span className="text-[10px] text-slate-500">{title.length}/60 chars</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 🔥 Weekend Mega Sale: 25% OFF Surmai!"
              maxLength={80}
              required
              className={`w-full px-4 py-3 rounded-2xl border text-xs font-medium outline-none transition-all ${
                isLight 
                  ? 'bg-white border-slate-300 text-slate-900 focus:border-cyan-500' 
                  : 'bg-slate-950 border-white/10 text-white focus:border-cyan-400'
              }`}
            />
          </div>

          {/* Message Body */}
          <div>
            <label className="block text-xs font-bold mb-1.5 flex items-center justify-between">
              <span>Message Body *</span>
              <span className="text-[10px] text-slate-500">{message.length}/160 chars</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Fresh catch just landed! Order fresh Pomfret, King Fish & Tiger Prawns before stock runs out."
              rows={3}
              maxLength={200}
              required
              className={`w-full px-4 py-3 rounded-2xl border text-xs font-medium outline-none transition-all resize-none ${
                isLight 
                  ? 'bg-white border-slate-300 text-slate-900 focus:border-cyan-500' 
                  : 'bg-slate-950 border-white/10 text-white focus:border-cyan-400'
              }`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Target URL */}
            <div>
              <label className="block text-xs font-bold mb-1.5 flex items-center gap-1">
                <LinkIcon size={12} /> Target URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="/products or /home"
                className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-white/10 text-white'
                }`}
              />
            </div>

            {/* Notification Type */}
            <div>
              <label className="block text-xs font-bold mb-1.5 flex items-center gap-1">
                <Tag size={12} /> Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs outline-none cursor-pointer ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-white/10 text-white'
                }`}
              >
                <option value="promo">🎁 New Offer / Promo</option>
                <option value="discount">🔥 Discount / Sale</option>
                <option value="new_product">🐟 Fresh Catch Arrival</option>
                <option value="delivery">🚚 Delivery Updates</option>
                <option value="announcement">📢 Announcement</option>
              </select>
            </div>

          </div>

          {/* Optional Image Banner URL */}
          <div>
            <label className="block text-xs font-bold mb-1.5 flex items-center gap-1">
              <ImageIcon size={12} /> Image / Banner URL (Optional)
            </label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://images.unsplash.com/... (optional banner)"
              className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs outline-none ${
                isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-white/10 text-white'
              }`}
            />
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-xs font-bold mb-2 flex items-center gap-1">
              <Users size={13} /> Target Audience
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "all", label: "All Subscribers 🌐" },
                { id: "registered", label: "Registered Users 👤" },
                { id: "guests", label: "Guest Devices 📱" }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTarget(t.id)}
                  className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold transition-all text-center cursor-pointer ${
                    target === t.id
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 border-cyan-400 shadow-md'
                      : isLight
                        ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Result */}
          {sendResult && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs space-y-1">
              <div className="flex items-center gap-2 font-black text-sm">
                <CheckCircle2 size={16} /> Broadcast Sent Successfully!
              </div>
              <p className="text-[11px] opacity-90">{sendResult.message}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={sending || !title.trim() || !message.trim()}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-2xl shadow-xl shadow-cyan-500/25 transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              {sending ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Broadcasting Web Push...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Send Live Web Push Broadcast</span>
                </>
              )}
            </button>
          </div>

        </form>

        {/* LIVE MOBILE & DESKTOP NOTIFICATION PREVIEW (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-500 flex items-center gap-1.5">
            <Smartphone size={14} /> Live Notification Preview
          </h4>

          {/* Preview Card Mockup */}
          <div className={`p-4 rounded-3xl border shadow-xl space-y-3 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-cyan-500/30'
          }`}>
            
            {/* Header bar of notification */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-white/5">
              <div className="flex items-center gap-1.5">
                <img src="/aquamart-logo.png" alt="AquaMart" className="w-4 h-4 rounded-full object-cover" />
                <span className="font-bold text-slate-300">AquaMart Web Push</span>
              </div>
              <span className="font-mono text-[10px]">now</span>
            </div>

            {/* Notification content body */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-md">
                <Bell size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <h5 className="text-xs sm:text-sm font-black leading-snug">
                  {title || "🔥 Weekend Special: Fresh Surmai & Pomfret!"}
                </h5>
                <p className={`text-[11px] sm:text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  {message || "Selected wild catch is on flat 20% discount today. Harvested fresh from docks!"}
                </p>
              </div>
            </div>

            {/* Optional Banner Preview */}
            {image && (
              <div className="rounded-2xl overflow-hidden border border-white/10 max-h-36">
                <img src={image} alt="Broadcast Banner" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Simulated Action buttons */}
            <div className="pt-1 flex items-center gap-2">
              <div className="flex-1 py-1.5 bg-cyan-500/20 text-cyan-500 text-center rounded-xl text-[10px] font-bold border border-cyan-500/30">
                View Now 🌊
              </div>
              <div className={`py-1.5 px-3 rounded-xl text-[10px] font-semibold ${
                isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-400'
              }`}>
                Dismiss
              </div>
            </div>

          </div>

          <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed space-y-1 ${
            isLight ? 'bg-cyan-50/50 border-cyan-200 text-slate-700' : 'bg-cyan-950/30 border-cyan-500/20 text-cyan-200'
          }`}>
            <p className="font-bold flex items-center gap-1.5">
              <Sparkles size={13} className="text-cyan-400" /> Web-Push Production Highlights:
            </p>
            <ul className="list-disc list-inside text-[11px] opacity-90 space-y-0.5">
              <li>Subscribers receive alerts on Android Chrome, Windows, macOS & Linux.</li>
              <li>Notifications work even if the browser tab is currently closed.</li>
              <li>Tapping opens the specified target URL directly.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminNotificationBroadcast;
