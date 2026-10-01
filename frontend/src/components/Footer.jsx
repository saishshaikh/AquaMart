import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Fish, ShieldCheck, Truck, Clock, Phone, Mail, MapPin, 
  ArrowRight, Heart, Send, CheckCircle2, Lock, Sparkles, Award
} from 'lucide-react';
import { FaInstagram, FaWhatsapp, FaTwitter, FaFacebook, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer className="relative bg-slate-950 border-t border-cyan-500/20 text-slate-300 pt-16 pb-8 overflow-hidden font-sans mt-16">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-cyan-500/10 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-20 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* TOP TRUST & HYGIENE PROMISES BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Truck size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">30-Min Fast Dispatch</h4>
              <p className="text-xs text-slate-400">Live GPS tracking + OTP</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Chemical-Free</h4>
              <p className="text-xs text-slate-400">Ozone cleaned & lab tested</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Authentic Sun-Cured</h4>
              <p className="text-xs text-slate-400">Coastal dry fish & prawns</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Lock size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Secure Payments</h4>
              <p className="text-xs text-slate-400">UPI, Cards, COD & Wallets</p>
            </div>
          </div>
        </div>

        {/* MAIN 4-COLUMN FOOTER LINKS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Col 1: Brand & Mission (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div 
              className="flex items-center gap-2.5 cursor-pointer group"
              onClick={() => navigate("/")}
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 border border-white/20">
                <Fish className="text-white w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tighter">
                Aqua<span className="text-cyan-400">Mart</span>
              </h2>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              India's premier modern digital marketplace for wild ocean fish and sun-cured coastal dry seafood. Harvested fresh from the docks of Mumbai, Malvan & Goa straight to your kitchen pan.
            </p>

            <div className="space-y-1.5 text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-cyan-400 shrink-0" />
                <span>Harbor Terminal 4, Ferry Wharf, Mumbai, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-cyan-400 shrink-0" />
                <span>+91 (800) 278-AQUA (Toll Free)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-cyan-400 shrink-0" />
                <span>support@aquamart.in</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
              <a href="#" className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-cyan-500/20 border border-slate-800 hover:border-cyan-500/40 flex items-center justify-center text-slate-300 hover:text-cyan-400 transition-all">
                <FaInstagram size={15} />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-emerald-500/20 border border-slate-800 hover:border-emerald-500/40 flex items-center justify-center text-slate-300 hover:text-emerald-400 transition-all">
                <FaWhatsapp size={15} />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-blue-500/20 border border-slate-800 hover:border-blue-500/40 flex items-center justify-center text-slate-300 hover:text-blue-400 transition-all">
                <FaTwitter size={15} />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-blue-600/20 border border-slate-800 hover:border-blue-600/40 flex items-center justify-center text-slate-300 hover:text-blue-500 transition-all">
                <FaFacebook size={15} />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/40 flex items-center justify-center text-slate-300 hover:text-rose-400 transition-all">
                <FaYoutube size={15} />
              </a>
            </div>
          </div>

          {/* Col 2: Seafood Categories (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider text-cyan-400">
              Seafood Categories
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">🌊 Wild Surmai & Silver Pomfret</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">🔥 Sun-Cured Bombil (Bombay Duck)</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">🦐 Tiger Prawns & White Shrimps</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">🦀 Live Sea Mud Crabs</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">🍲 Dried Tarli & Bangda Combos</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">🦐 Golden Sun-Kissed Jawla & Kardi</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">🦪 Oysters, Squids & Shellfish</a></li>
            </ul>
          </div>

          {/* Col 3: Customer Services & Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider text-cyan-400">
              Customer Hub
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><button onClick={() => navigate('/my-orders')} className="hover:text-cyan-400 transition-colors text-left">Track Live Order & OTP</button></li>
              <li><button onClick={() => navigate('/cart')} className="hover:text-cyan-400 transition-colors text-left">Shopping Cart</button></li>
              <li><button onClick={() => navigate('/home')} className="hover:text-cyan-400 transition-colors text-left">Marketplace Home</button></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Quality & Hygiene Policy</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Fulfillment Zones</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Contact Support</a></li>
            </ul>
          </div>

          {/* Col 4: Daily Catch Alert Newsletter (3 cols) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider text-cyan-400">
              Daily Catch Alerts
            </h3>
            <p className="text-xs text-slate-400">
              Subscribe to get instant morning haul notifications & flat 20% discount coupon vouchers.
            </p>

            {subscribed && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Subscribed to morning catch alerts!
              </div>
            )}

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-500 transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send size={13} />
                <span>Subscribe for Offers</span>
              </button>
            </form>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT & PAYMENT BADGES BAR */}
        <div className="border-t border-slate-800/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="flex items-center gap-1 text-center sm:text-left">
            © 2026 AquaMart Technologies Pvt. Ltd. All rights reserved. Made with <Heart size={12} className="text-rose-500 fill-rose-500 inline" /> for seafood lovers.
          </p>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-slate-400">Accepted Payments:</span>
            <div className="flex gap-1.5 text-[10px] font-bold text-slate-400">
              <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">UPI</span>
              <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">GPay</span>
              <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">PhonePe</span>
              <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">Cards</span>
              <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">COD</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
