import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Store, ArrowRight, Pencil, Fish, Plus, MapPin, 
  Globe, Droplets, Trash2, Sparkles, ShieldCheck, 
  TrendingUp, Package, Compass
} from 'lucide-react';
import gsap from 'gsap';

// ✅ Hook import kiya
import useGetMyShop from "../hooks/useGetMyShop";

function AdminDashboard() {
  const navigate = useNavigate();
  const { myShopData } = useSelector((state) => state.owner);
  
  // ✅ Redux se exact live location nikaali
  const { city: liveCity } = useSelector((state) => state.user);

  // ✅ Hook call kiya
  useGetMyShop();

  // Advanced Refs for Micro-interactions & Marine Life Orchestration
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

  // ✅ Advanced GSAP Marine Life & Ambient Animations
  useEffect(() => {
    // 1. Ambient Floating Wave Parallax
    const waveTween = gsap.to(waveRef.current, {
      y: 15,
      rotation: 0.5,
      repeat: -1,
      yoyo: true,
      duration: 5,
      ease: "sine.inOut"
    });

    // 2. Multi-layered Bubble Kinetics (Rich Marine Atmosphere)
    bubblesRef.current.forEach((bubble, index) => {
      if (!bubble) return;
      const randomXOffset = (index % 2 === 0 ? 1 : -1) * (25 + index * 8);
      gsap.fromTo(bubble, 
        { y: 60, opacity: 0, scale: 0.3 },
        {
          y: -550,
          x: `+= ${randomXOffset}`,
          opacity: 0.75,
          scale: 1.3,
          repeat: -1,
          duration: 3.5 + (index * 0.5),
          delay: index * 0.4,
          ease: "power1.out"
        }
      );
    });

    // 3. School of Colorful Background Fishes (Swimming across screen dynamically)
    schoolOfFishRef.current.forEach((fish, index) => {
      if (!fish) return;
      const isLeftToRight = index % 2 === 0;
      const startX = isLeftToRight ? -120 : window.innerWidth + 120;
      const endX = isLeftToRight ? window.innerWidth + 120 : -120;
      const randomY = 50 + Math.random() * (window.innerHeight - 150);
      const duration = 8 + (index * 2.5);

      gsap.fromTo(fish,
        {
          x: startX,
          y: randomY,
          scaleX: isLeftToRight ? 1 : -1,
          opacity: 0.2 + Math.random() * 0.5,
        },
        {
          x: endX,
          y: randomY + (Math.sin(index) * 80),
          repeat: -1,
          duration: duration,
          delay: index * 1.8,
          ease: "none"
        }
      );
    });

    // 4. Conditional Master Orchestration Timelines
    if (myShopData) {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      
      tl.fromTo(shopHeadingRef.current, 
        { y: -30, opacity: 0, filter: "blur(10px)" }, 
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 1 }
      )
      .fromTo(shopCardRef.current, 
        { y: 50, opacity: 0, scale: 0.96 }, 
        { y: 0, opacity: 1, scale: 1, duration: 0.9 },
        "-=0.6"
      )
      .fromTo(addItemCardRef.current, 
        { y: 50, opacity: 0, scale: 0.96 }, 
        { y: 0, opacity: 1, scale: 1, duration: 0.9 },
        "-=0.7"
      )
      .fromTo(fishIconRef.current, 
        { scale: 0, rotation: -45 }, 
        { scale: 1, rotation: 0, duration: 0.8, ease: "back.out(2)" },
        "-=0.5"
      );

      if (statsRef.current.length > 0) {
        tl.fromTo(statsRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 },
          "-=0.4"
        );
      }

      if (myShopData.items && myShopData.items.length > 0) {
        tl.fromTo(itemsListRef.current, 
          { y: 40, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.8 },
          "-=0.3"
        );
      }

      return () => {
        waveTween.kill();
      };
    }

    // Default Fallback Timeline (Get Started View)
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(cardRef.current, 
      { y: 60, opacity: 0, scale: 0.9, backdropFilter: "blur(0px)" }, 
      { y: 0, opacity: 1, scale: 1, backdropFilter: "blur(24px)", duration: 1 }
    )
    .fromTo(iconRef.current, 
      { scale: 0, rotate: -30, opacity: 0 }, 
      { scale: 1, rotate: 0, opacity: 1, duration: 0.8, ease: "back.out(1.8)" },
      "-=0.6"
    )
    .fromTo([titleRef.current, descRef.current], 
      { y: 25, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.12 },
      "-=0.4"
    )
    .fromTo(btnRef.current, 
      { y: 20, opacity: 0, scale: 0.95 }, 
      { y: 0, opacity: 1, scale: 1, duration: 0.6 },
      "-=0.3"
    )
    .fromTo(footerRef.current, 
      { y: 15, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.5 },
      "-=0.2"
    );

    return () => {
      waveTween.kill();
    };

  }, [myShopData]);

  // Hover Magnetic micro-interactions
  const handleMouseEnter = (e, scaleVal = 1.02) => {
    gsap.to(e.currentTarget, { scale: scaleVal, duration: 0.3, ease: "power2.out" });
  };

  const handleMouseLeave = (e) => {
    gsap.to(e.currentTarget, { scale: 1, duration: 0.3, ease: "power2.out" });
  };

  // ==========================================
  // ✅ COMMON MARINE BACKGROUND LAYER
  // ==========================================
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
        { color: "text-pink-400 drop-shadow-[0_0_10px_rgba(244,114,182,0.6)]", size: 20 },
        { color: "text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.6)]", size: 26 },
        { color: "text-teal-300 drop-shadow-[0_0_10px_rgba(45,212,191,0.6)]", size: 34 },
      ].map((fishItem, i) => (
        <div
          key={`fish-${i}`}
          ref={(el) => (schoolOfFishRef.current[i] = el)}
          className={`absolute pointer-events-none z-0 ${fishItem.color}`}
          style={{ willChange: 'transform' }}
        >
          <Fish size={fishItem.size} />
        </div>
      ))}

      {[...Array(14)].map((_, i) => (
        <div
          key={`bubble-${i}`}
          ref={(el) => (bubblesRef.current[i] = el)}
          className="absolute rounded-full bg-cyan-200/30 backdrop-blur-md border border-white/30 pointer-events-none z-0 shadow-[inset_0_0_4px_rgba(255,255,255,0.6)]"
          style={{
            width: `${10 + (i * 3)}px`,
            height: `${10 + (i * 3)}px`,
            left: `${5 + (i * 7)}%`,
            bottom: `-50px`,
          }}
        />
      ))}

      <div 
        ref={waveRef}
        className="absolute bottom-0 left-0 w-full h-36 pointer-events-none z-0 opacity-50"
      >
        <svg viewBox="0 0 1440 320" className="w-full h-full fill-cyan-500/20">
          <path d="M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,181.3C672,181,768,203,864,213.3C960,224,1056,224,1152,208C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
        </svg>
      </div>
    </>
  );

  // ==========================================
  // ✅ CASE 1: SHOP DATA EXISTS
  // ==========================================
  if (myShopData) {
    const totalItems = myShopData.items ? myShopData.items.length : 0;
    
    return (
      <div 
        ref={containerRef}
        className="relative min-h-[calc(100vh-70px)] bg-slate-950 bg-gradient-to-br from-slate-950 via-cyan-950/50 to-blue-950/70 overflow-hidden flex flex-col items-center justify-start p-4 sm:p-8 gap-8 pb-24 text-slate-100 selection:bg-cyan-500 selection:text-white"
      >
        {renderMarineBackground()}

        {/* Header Branding */}
        <div 
          ref={shopHeadingRef} 
          className="relative z-10 w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-2xl border border-cyan-500/20 px-6 py-4 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
              <Fish className="text-white w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                {myShopData.name}
                <ShieldCheck className="text-cyan-400 w-5 h-5 inline-block" />
              </h1>
              <p className="text-xs text-cyan-300/80 font-medium">Verified Marine Vendor Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-950/60 px-4 py-2 rounded-2xl border border-white/5">
            <Compass className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '12s' }} />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest">Status: <span className="text-emerald-400">Live</span></span>
          </div>
        </div>

        {/* Quick Analytics Metrics Bento Bar */}
        <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Catches", value: totalItems, icon: Package, color: "from-cyan-500/20 to-blue-500/20", border: "border-cyan-500/30" },
            { label: "Vendor Status", value: "Active", icon: TrendingUp, color: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/30" },
            // ✅ Yahan exact live location (liveCity) dikhegi
            { label: "Location Region", value: `${liveCity || myShopData.city || 'Coastal'}`, icon: MapPin, color: "from-blue-500/20 to-indigo-500/20", border: "border-blue-500/30" },
          ].map((stat, idx) => (
            <div 
              key={idx}
              ref={(el) => (statsRef.current[idx] = el)}
              onMouseEnter={(e) => handleMouseEnter(e, 1.03)}
              onMouseLeave={handleMouseLeave}
              className={`bg-gradient-to-br ${stat.color} backdrop-blur-xl border ${stat.border} p-5 rounded-3xl shadow-xl flex items-center justify-between transition-all duration-300 cursor-default`}
            >
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <h4 className="text-xl font-bold text-white mt-1">{stat.value}</h4>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                <stat.icon className="w-5 h-5 text-cyan-300" />
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid: Shop Info Card & Action CTA Card */}
        <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div 
            ref={shopCardRef}
            onMouseEnter={(e) => handleMouseEnter(e, 1.01)}
            onMouseLeave={handleMouseLeave}
            className="md:col-span-2 bg-slate-900/50 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 group"
          >
            <div className="relative w-full h-56 sm:h-72 overflow-hidden bg-slate-950">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 opacity-80" />
              <img 
                src={myShopData.image} 
                alt={myShopData.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1544551763-46a8e13571d8?w=800&h=400&fit=crop";
                }}
              />
              <button 
                onClick={() => navigate("/create-shop")}
                className="absolute top-4 right-4 bg-slate-900/80 hover:bg-cyan-600 text-slate-200 hover:text-white p-3 rounded-2xl shadow-xl backdrop-blur-xl border border-white/10 transition-all duration-300 z-20 flex items-center gap-2 group/btn"
                title="Edit Shop Details"
              >
                <Pencil size={18} className="group-hover/btn:rotate-12 transition-transform duration-300" />
                <span className="text-xs font-semibold pr-1 hidden sm:inline">Edit Shop</span>
              </button>
            </div>

            <div className="p-6 bg-slate-900/80 backdrop-blur-md flex flex-col gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Droplets className="text-cyan-400 w-5 h-5" />
                {myShopData.name}
              </h2>
              <div className="flex flex-col sm:flex-row gap-3 text-slate-400 text-sm">
                <p className="flex items-center gap-2 bg-slate-950/40 px-3 py-1.5 rounded-xl border border-white/5">
                  <MapPin size={15} className="text-cyan-400 shrink-0" />
                  {/* ✅ Yahan bhi liveCity dikhegi */}
                  <span>{liveCity || myShopData.city}, {myShopData.state}</span>
                </p>
                <p className="flex items-center gap-2 bg-slate-950/40 px-3 py-1.5 rounded-xl border border-white/5 truncate">
                  <Globe size={15} className="text-cyan-400 shrink-0" />
                  <span className="truncate">{myShopData.address}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Add Your Fresh Catch Action Card */}
          <div 
            ref={addItemCardRef}
            onMouseEnter={(e) => handleMouseEnter(e, 1.02)}
            onMouseLeave={handleMouseLeave}
            className="bg-slate-900/50 backdrop-blur-2xl border border-cyan-500/20 shadow-2xl rounded-3xl p-6 flex flex-col items-center justify-between text-center transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute -right-12 -top-12 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-500" />

            <div className="flex flex-col items-center w-full my-auto">
              <div 
                ref={fishIconRef}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-5 shadow-xl shadow-cyan-500/30 border border-white/20"
              >
                <Fish size={36} className="text-white" />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                Add Fresh Catch
              </h3>

              <p className="text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed">
                Publish today's ocean catch and let seafood lovers order instantly.
              </p>
            </div>

            <button
              onClick={() => navigate("/add-item")}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-2xl font-semibold shadow-lg shadow-cyan-500/30 transition-all duration-300 group-hover:scale-[1.02]"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
              <span>Add New Item</span>
            </button>
          </div>

        </div>

        {/* ITEMS LIST */}
        {myShopData.items && myShopData.items.length > 0 && (
          <div 
            ref={itemsListRef}
            className="relative z-10 w-full max-w-4xl flex flex-col gap-4 mt-4"
          >
            <div className="flex items-center justify-between px-2">
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                Your Menu Catches ({myShopData.items.length})
              </h3>
              <span className="text-xs text-slate-400 font-medium">Manage Inventory</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {myShopData.items.map((item, index) => (
                <div 
                  key={item._id || index}
                  onMouseEnter={(e) => handleMouseEnter(e, 1.01)}
                  onMouseLeave={handleMouseLeave}
                  className="group w-full bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-xl rounded-3xl overflow-hidden flex flex-col sm:flex-row items-center p-4 gap-4 hover:border-cyan-500/40 transition-all duration-300"
                >
                  <div className="w-full sm:w-28 h-40 sm:h-28 flex-shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-slate-950 relative">
                    <img 
                      src={item.image || item.imageUrl} 
                      alt={item.name || "Catch"} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1565538810643-b5bdb714103a?w=200&h=200&fit=crop";
                      }}
                    />
                    <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors duration-300" />
                  </div>

                  <div className="flex-1 flex flex-col justify-center text-center sm:text-left w-full">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-500/20 px-2.5 py-0.5 rounded-full w-fit mx-auto sm:mx-0 mb-1.5">
                      {item.category || "Seafood"}
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {item.name || item.itemName || item.title || "Unnamed Catch"}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                      {item.description || "Freshly caught and ready for delivery."}
                    </p>
                    <div className="text-base font-extrabold text-cyan-400 mt-2">
                      ₹{item.price || 0}
                    </div>
                  </div>

                  <div className="flex sm:flex-col gap-2 w-full sm:w-auto justify-center pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <button 
                      className="flex-1 sm:flex-none p-2.5 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 transition-all flex items-center justify-center gap-1.5"
                      onClick={() => navigate(`/edit-item/${item._id}`)}
                      title="Edit Item"
                    >
                      <Pencil size={16} />
                      <span className="text-xs sm:hidden font-medium">Edit</span>
                    </button>
                    <button 
                      className="flex-1 sm:flex-none p-2.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all flex items-center justify-center gap-1.5"
                      onClick={() => console.log("Delete item", item._id)}
                      title="Delete Item"
                    >
                      <Trash2 size={16} />
                      <span className="text-xs sm:hidden font-medium">Delete</span>
                    </button>
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
  // ✅ CASE 2: NO SHOP DATA
  // ==========================================
  return (
    <div 
      ref={containerRef}
      className="relative min-h-[calc(100vh-70px)] bg-slate-950 bg-gradient-to-br from-slate-950 via-cyan-950/50 to-blue-950/70 overflow-hidden flex items-center justify-center p-4 selection:bg-cyan-500 selection:text-white"
    >
      {renderMarineBackground()}

      <div 
        ref={cardRef}
        onMouseEnter={(e) => handleMouseEnter(e, 1.01)}
        onMouseLeave={handleMouseLeave}
        className="relative z-10 w-full max-w-md bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[2.5rem] p-8 sm:p-10 flex flex-col items-center text-center group"
      >
        <div 
          ref={iconRef}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center mb-6 shadow-xl shadow-cyan-500/30 border border-white/20"
        >
          <Store size={42} className="text-white" />
        </div>

        <h2 ref={titleRef} className="text-2xl font-black text-white mb-2 tracking-tight">
          Start Your Seafood Business
        </h2>
        
        <p ref={descRef} className="text-slate-400 text-sm mb-8 leading-relaxed">
          Dive into the vast ocean of digital market opportunities with AquaMart vendor suite.
        </p>

        <button
          ref={btnRef}
          onClick={() => navigate("/create-shop")}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-3.5 rounded-2xl transition-all duration-300 shadow-xl shadow-cyan-500/30 group-hover:scale-[1.02] active:scale-95"
        >
          <span>Get Started</span> 
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
        </button>

        <p ref={footerRef} className="text-xs text-slate-500 mt-6 text-center leading-relaxed">
          <span className="font-semibold text-rose-400">*Notice:</span> You must verify your business and shop credentials before active publishing.
        </p>

      </div>
    </div>
  );
}

export default AdminDashboard;