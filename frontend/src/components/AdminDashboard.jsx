import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { 
  Store, ArrowRight, Pencil, Fish, Plus, MapPin, 
  Globe, Droplets, Trash2, Sparkles, ShieldCheck, 
  TrendingUp, Package, Compass, LayoutGrid
} from 'lucide-react';
import gsap from 'gsap';
import { serverUrl } from '../App';

import useGetMyShop from "../hooks/useGetMyShop";

function AdminDashboard() {
  const navigate = useNavigate();
  const { myShopData } = useSelector((state) => state.owner);
  const { city: liveCity, userData } = useSelector((state) => state.user);

  const [allShops, setAllShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState(null);
  const [loadingShops, setLoadingShops] = useState(false);

  useGetMyShop();

  // ✅ Fetch All Shops for Admin (With Authorization Header)
  useEffect(() => {
    if (userData?.role === 'admin') {
      const fetchAllShops = async () => {
        try {
          setLoadingShops(true);
          const token = localStorage.getItem('token');
          
          // 🔥 FIX: Headers mein Authorization token bhejo
          const response = await axios.get(`${serverUrl}/api/shop/all-shops`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data.success) {
            setAllShops(response.data.shops);
            // Auto-select the first shop
            if (response.data.shops.length > 0) {
              setSelectedShopId(response.data.shops[0]._id);
            }
          }
        } catch (error) {
          console.error("Error fetching all shops:", error);
        } finally {
          setLoadingShops(false);
        }
      };
      fetchAllShops();
    }
  }, [userData]);

  // GSAP Refs
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const iconRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const btnRef = useRef(null);
  const footerRef = useRef(null);
  const shopCardRef = useRef(null);
  const shopHeadingRef = useRef(null);
  const addItemCardRef = useRef(null);
  const fishIconRef = useRef(null);
  const waveRef = useRef(null);
  const bubblesRef = useRef([]);
  const schoolOfFishRef = useRef([]);
  const itemsListRef = useRef(null);
  const statsRef = useRef([]);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (waveRef.current) {
        gsap.to(waveRef.current, { y: 15, rotation: 0.5, repeat: -1, yoyo: true, duration: 5, ease: "sine.inOut" });
      }

      bubblesRef.current.forEach((bubble, index) => {
        if (!bubble) return;
        const randomXOffset = (index % 2 === 0 ? 1 : -1) * (25 + index * 8);
        gsap.fromTo(bubble, 
          { y: 60, opacity: 0, scale: 0.3 },
          { y: -550, x: `+= ${randomXOffset}`, opacity: 0.75, scale: 1.3, repeat: -1, duration: 3.5 + (index * 0.5), delay: index * 0.4, ease: "power1.out" }
        );
      });

      schoolOfFishRef.current.forEach((fish, index) => {
        if (!fish) return;
        const isLeftToRight = index % 2 === 0;
        const startX = isLeftToRight ? -120 : window.innerWidth + 120;
        const endX = isLeftToRight ? window.innerWidth + 120 : -120;
        const randomY = 50 + Math.random() * (window.innerHeight - 150);
        const duration = 8 + (index * 2.5);
        gsap.fromTo(fish, { x: startX, y: randomY, scaleX: isLeftToRight ? 1 : -1, opacity: 0.2 + Math.random() * 0.5 }, { x: endX, y: randomY + (Math.sin(index) * 80), repeat: -1, duration: duration, delay: index * 1.8, ease: "none" });
      });

      if (myShopData) {
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
        if (shopHeadingRef.current) tl.fromTo(shopHeadingRef.current, { y: -30, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 1 });
        if (shopCardRef.current) tl.fromTo(shopCardRef.current, { y: 50, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.9 }, "-=0.6");
        if (addItemCardRef.current) tl.fromTo(addItemCardRef.current, { y: 50, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.9 }, "-=0.7");
        if (fishIconRef.current) tl.fromTo(fishIconRef.current, { scale: 0, rotation: -45 }, { scale: 1, rotation: 0, duration: 0.8, ease: "back.out(2)" }, "-=0.5");
        if (statsRef.current.length > 0) tl.fromTo(statsRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 }, "-=0.4");
        if (itemsListRef.current && myShopData.items && myShopData.items.length > 0) tl.fromTo(itemsListRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, "-=0.3");
      } else {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        if (cardRef.current) tl.fromTo(cardRef.current, { y: 60, opacity: 0, scale: 0.9, backdropFilter: "blur(0px)" }, { y: 0, opacity: 1, scale: 1, backdropFilter: "blur(24px)", duration: 1 });
        if (iconRef.current) tl.fromTo(iconRef.current, { scale: 0, rotate: -30, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 0.8, ease: "back.out(1.8)" }, "-=0.6");
        if (titleRef.current && descRef.current) tl.fromTo([titleRef.current, descRef.current], { y: 25, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.12 }, "-=0.4");
        if (btnRef.current) tl.fromTo(btnRef.current, { y: 20, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.6 }, "-=0.3");
      }
    }, containerRef);
    
    return () => ctx.revert();
  }, [myShopData]);

  const handleMouseEnter = (e, scaleVal = 1.02) => gsap.to(e.currentTarget, { scale: scaleVal, duration: 0.3, ease: "power2.out" });
  const handleMouseLeave = (e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.3, ease: "power2.out" });

  const renderMarineBackground = () => (
    <>
      <div className="absolute top-10 left-1/4 w-[450px] h-[450px] bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 right-10 w-[400px] h-[400px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      {[
        { color: "text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]", size: 28 },
        { color: "text-rose-400 drop-shadow-[0_0_10px_rgba(251,113,133,0.6)]", size: 22 },
        { color: "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.6)]", size: 32 },
        { color: "text-purple-400 drop-shadow-[0_0_10px_rgba(192,132,252,0.6)]", size: 25 },
        { color: "text-cyan-300 drop-shadow-[0_0_10px_rgba(103,232,249,0.6)]", size: 30 },
      ].map((fishItem, i) => (
        <div key={`fish-${i}`} ref={(el) => (schoolOfFishRef.current[i] = el)} className={`absolute pointer-events-none z-0 ${fishItem.color}`} style={{ willChange: 'transform' }}><Fish size={fishItem.size} /></div>
      ))}
      {[...Array(10)].map((_, i) => (
        <div key={`bubble-${i}`} ref={(el) => (bubblesRef.current[i] = el)} className="absolute rounded-full bg-cyan-200/30 backdrop-blur-md border border-white/30 pointer-events-none z-0 shadow-[inset_0_0_4px_rgba(255,255,255,0.6)]" style={{ width: `${10 + (i * 3)}px`, height: `${10 + (i * 3)}px`, left: `${5 + (i * 9)}%`, bottom: `-50px` }} />
      ))}
      <div ref={waveRef} className="absolute bottom-0 left-0 w-full h-36 pointer-events-none z-0 opacity-50">
        <svg viewBox="0 0 1440 320" className="w-full h-full fill-cyan-500/20">
          <path d="M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,181.3C672,181,768,203,864,213.3C960,224,1056,224,1152,208C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
        </svg>
      </div>
    </>
  );

  // Helper to get selected shop's items
  const getSelectedShopItems = () => {
    if (!selectedShopId) return [];
    const shop = allShops.find(s => s._id === selectedShopId);
    return shop ? shop.items || [] : [];
  };

  // ==========================================
  // ✅ CASE 1: ADMIN DASHBOARD (Show All Shops)
  // ==========================================
  if (userData?.role === 'admin') {
    return (
      <div ref={containerRef} className="relative min-h-[calc(100vh-70px)] bg-slate-950 bg-gradient-to-br from-slate-950 via-cyan-950/50 to-blue-950/70 overflow-hidden flex flex-col items-center justify-start p-4 sm:p-8 gap-8 pb-24 text-slate-100">
        {renderMarineBackground()}

        {/* Header Branding */}
        <div ref={shopHeadingRef} className="relative z-10 w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-2xl border border-cyan-500/20 px-6 py-4 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30"><Fish className="text-white w-6 h-6 animate-bounce" /></div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Admin Dashboard <ShieldCheck className="text-cyan-400 w-5 h-5 inline-block" />
              </h1>
              <p className="text-xs text-cyan-300/80 font-medium">Manage all shops and their menus</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-950/60 px-4 py-2 rounded-2xl border border-white/5">
            <Compass className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '12s' }} />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest">Status: <span className="text-emerald-400">Live</span></span>
          </div>
        </div>

        {/* Shop Selection Grid */}
        <div className="relative z-10 w-full max-w-4xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-cyan-400" /> All Shops ({allShops.length})
          </h3>
          
          {loadingShops ? (
            <div className="text-center py-8 text-cyan-400 animate-pulse">Loading shops...</div>
          ) : allShops.length === 0 ? (
            <div className="text-center py-8 bg-slate-900/40 rounded-3xl border border-white/5">
              <Store className="mx-auto w-12 h-12 text-slate-600 mb-2" />
              <p className="text-slate-400">No shops created yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allShops.map((shop) => (
                <div 
                  key={shop._id}
                  onClick={() => setSelectedShopId(shop._id)}
                  onMouseEnter={(e) => handleMouseEnter(e, 1.02)}
                  onMouseLeave={handleMouseLeave}
                  className={`bg-slate-900/70 backdrop-blur-xl border rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 group ${
                    selectedShopId === shop._id 
                      ? 'border-cyan-500 ring-2 ring-cyan-500/50' 
                      : 'border-white/10 hover:border-cyan-500/50'
                  }`}
                >
                  {/* SHOP IMAGE DISPLAY */}
                  <div className="relative w-full h-48 overflow-hidden bg-slate-950">
                    <img 
                      src={shop.image || "https://images.unsplash.com/photo-1544551763-46a8e13571d8?w=800&h=400&fit=crop"} 
                      alt={shop.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1544551763-46a8e13571d8?w=800&h=400&fit=crop";
                      }}
                    />
                    
                    {/* Hover Action Buttons (Edit Shop) */}
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/create-shop");
                        }}
                        className="p-2 bg-slate-900/80 hover:bg-blue-600 rounded-xl text-blue-400 hover:text-white backdrop-blur-md border border-white/10 transition-all"
                        title="Edit Shop"
                      >
                        <Pencil size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 pt-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-lg">{shop.name}</h4>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin size={14} className="text-cyan-400" /> {shop.city}, {shop.state}
                    </p>
                    <p className="text-[10px] text-cyan-400 mt-2">{shop.items?.length || 0} Items available</p>
                    
                    {/* Add New Item Button */}
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/add-item");
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-cyan-500/20"
                      >
                        <Plus size={14} /> Add New Item
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Display Items of Selected Shop */}
        {selectedShopId && (
          <div ref={itemsListRef} className="relative z-10 w-full max-w-4xl flex flex-col gap-4 mt-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                Menu Items ({getSelectedShopItems().length})
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {getSelectedShopItems().map((item, index) => (
                <div key={item._id || index} onMouseEnter={(e) => handleMouseEnter(e, 1.01)} onMouseLeave={handleMouseLeave} className="group w-full bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-xl rounded-3xl overflow-hidden flex flex-col sm:flex-row items-center p-4 gap-4">
                  <div className="w-full sm:w-28 h-40 sm:h-28 flex-shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-slate-950 relative">
                    <img src={item.image || item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1565538810643-b5bdb714103a?w=200&h=200&fit=crop"; }} />
                  </div>
                  <div className="flex-1 flex flex-col justify-center text-center sm:text-left w-full">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-500/20 px-2.5 py-0.5 rounded-full w-fit mx-auto sm:mx-0 mb-1.5">{item.category || "Seafood"}</span>
                    <h4 className="text-base sm:text-lg font-bold text-white">{item.name || item.itemName}</h4>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{item.description}</p>
                    <div className="text-base font-extrabold text-cyan-400 mt-2">₹{item.price || 0}</div>
                  </div>
                  <div className="flex sm:flex-col gap-2 w-full sm:w-auto justify-center pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <button className="flex-1 sm:flex-none p-2.5 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 transition-all flex items-center justify-center gap-1.5" onClick={() => navigate(`/edit-item/${item._id}`)}><Pencil size={16} /><span className="text-xs sm:hidden">Edit</span></button>
                    <button className="flex-1 sm:flex-none p-2.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all flex items-center justify-center gap-1.5"><Trash2 size={16} /><span className="text-xs sm:hidden">Delete</span></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // ✅ CASE 2: NORMAL OWNER / NO SHOP DATA
  // ==========================================
  if (myShopData) {
    const totalItems = myShopData.items ? myShopData.items.length : 0;
    return (
      <div ref={containerRef} className="relative min-h-[calc(100vh-70px)] bg-slate-950 bg-gradient-to-br from-slate-950 via-cyan-950/50 to-blue-950/70 overflow-hidden flex flex-col items-center justify-start p-4 sm:p-8 gap-8 pb-24 text-slate-100">
        {renderMarineBackground()}
        {/* ... (Rest of your existing Owner Dashboard Code) ... */}
      </div>
    );
  }

  // ==========================================
  // ✅ CASE 3: NO SHOP DATA
  // ==========================================
  return (
    <div ref={containerRef} className="relative min-h-[calc(100vh-70px)] bg-slate-950 bg-gradient-to-br from-slate-950 via-cyan-950/50 to-blue-950/70 overflow-hidden flex items-center justify-center p-4 selection:bg-cyan-500 selection:text-white">
      {renderMarineBackground()}
      <div ref={cardRef} onMouseEnter={(e) => handleMouseEnter(e, 1.01)} onMouseLeave={handleMouseLeave} className="relative z-10 w-full max-w-md bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[2.5rem] p-8 sm:p-10 flex flex-col items-center text-center group">
        <div ref={iconRef} className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center mb-6 shadow-xl"><Store size={42} className="text-white" /></div>
        <h2 ref={titleRef} className="text-2xl font-black text-white mb-2">Start Your Business</h2>
        <p ref={descRef} className="text-slate-400 text-sm mb-8">Register your shop to accept live orders from customers.</p>
        <button ref={btnRef} onClick={() => navigate("/create-shop")} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3.5 rounded-2xl"><span>Get Started</span> <ArrowRight size={18} /></button>
      </div>
    </div>
  );
}

export default AdminDashboard;