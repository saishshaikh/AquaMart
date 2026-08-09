import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Store, ArrowRight, Pencil, Fish, Plus, MapPin, Globe, Droplets, Trash2 } from 'lucide-react';
import gsap from 'gsap';

// ✅ Hook import kiya
import useGetMyShop from "../hooks/useGetMyShop";

function AdminDashboard() {
  const navigate = useNavigate();
  const { myShopData } = useSelector((state) => state.owner);

  // ✅ Hook call kiya
  useGetMyShop();

  // Refs
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
  const itemsListRef = useRef(null);

  // ✅ GSAP Ocean Animations
  useEffect(() => {
    // Background Wave Animation
    gsap.to(waveRef.current, {
      y: 10,
      repeat: -1,
      yoyo: true,
      duration: 4,
      ease: "power1.inOut"
    });

    // Bubble Animation (Floating up)
    bubblesRef.current.forEach((bubble, index) => {
      gsap.to(bubble, {
        y: -300,
        opacity: 0,
        repeat: -1,
        duration: 4 + index,
        delay: index * 1.5,
        ease: "power1.inOut"
      });
    });

    if (myShopData) {
      const tl = gsap.timeline({ defaults: { ease: "back.out(1.7)" } });
      
      tl.fromTo(shopHeadingRef.current, 
        { y: -50, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8 }
      )
      .fromTo(shopCardRef.current, 
        { y: 40, opacity: 0, scale: 0.95 }, 
        { y: 0, opacity: 1, scale: 1, duration: 0.7 }
      )
      .fromTo(addItemCardRef.current, 
        { y: 40, opacity: 0, scale: 0.95 }, 
        { y: 0, opacity: 1, scale: 1, duration: 0.7 },
        "-=0.2"
      )
      .fromTo(fishIconRef.current, 
        { scale: 0, rotate: -25 }, 
        { scale: 1, rotate: 0, duration: 0.6 },
        "-=0.4"
      );

      if (myShopData.items && myShopData.items.length > 0) {
        tl.fromTo(itemsListRef.current, 
          { y: 30, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.6 },
          "-=0.2"
        );
      }

      return;
    }

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(cardRef.current, 
      { y: 50, opacity: 0, scale: 0.9 }, 
      { y: 0, opacity: 1, scale: 1, duration: 0.8 }
    )
    .fromTo(iconRef.current, 
      { scale: 0, rotate: -15, opacity: 0 }, 
      { scale: 1, rotate: 0, opacity: 1, duration: 0.6, ease: "back.out(1.7)" },
      "-=0.4"
    )
    .fromTo([titleRef.current, descRef.current], 
      { y: 20, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 },
      "-=0.3"
    )
    .fromTo(btnRef.current, 
      { y: 15, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.5 },
      "-=0.2"
    )
    .fromTo(footerRef.current, 
      { y: 10, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.4 },
      "-=0.1"
    );

  }, [myShopData]);

  // ==========================================
  // ✅ CASE 1: AGAR SHOP DATA HAI (Ocean Theme Dashboard)
  // ==========================================
  if (myShopData) {
    return (
      <div className="relative min-h-[calc(100vh-70px)] bg-gradient-to-b from-[#e0f7fa] via-[#b2ebf2] to-[#80deea] overflow-hidden flex flex-col items-center justify-center p-4 gap-8 pb-16">
        
        {/* 🫧 Floating Bubbles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            ref={(el) => (bubblesRef.current[i] = el)}
            className="absolute rounded-full bg-white/30 backdrop-blur-sm border border-white/20"
            style={{
              width: `${10 + Math.random() * 30}px`,
              height: `${10 + Math.random() * 30}px`,
              left: `${Math.random() * 100}%`,
              bottom: `-20px`,
            }}
          />
        ))}

        {/* 🌊 Bottom Wave */}
        <div 
          ref={waveRef}
          className="absolute bottom-0 left-0 w-full h-20 pointer-events-none"
        >
          <svg viewBox="0 0 1440 320" className="w-full h-full fill-[#4dd0e1]/40">
            <path d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,170.7C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
          </svg>
        </div>

        {/* Heading */}
        <h1 
          ref={shopHeadingRef} 
          className="relative z-10 text-2xl sm:text-3xl text-gray-800 flex items-center gap-3 font-bold mt-8 bg-white/50 backdrop-blur-md px-6 py-3 rounded-2xl shadow-sm"
        >
          <Fish className="text-cyan-600 w-8 h-8 animate-pulse" />
          Welcome to {myShopData.name}
        </h1>

        {/* 1. Shop Glass Card */}
        <div 
          ref={shopCardRef}
          className="relative z-10 w-full max-w-3xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl overflow-hidden"
        >
          <div 
            className="absolute top-4 right-4 bg-cyan-600/90 hover:bg-cyan-700 text-white p-2 rounded-full shadow-md backdrop-blur-sm transition-all duration-300 cursor-pointer z-10"
            onClick={() => navigate("/create-shop")}
          >
            <Pencil size={20} />
          </div>

          <img 
            src={myShopData.image} 
            alt={myShopData.name} 
            className="w-full h-48 sm:h-64 object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://images.unsplash.com/photo-1544551763-46a8e13571d8?w=800&h=400&fit=crop";
            }}
          />

          <div className="p-4 sm:p-6 bg-white/40 backdrop-blur-sm">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Droplets className="text-cyan-500" size={20} />
              {myShopData.name}
            </h1>
            <div className="flex flex-col gap-1 text-gray-600 text-sm">
              <p className="flex items-center gap-2">
                <MapPin size={16} className="text-cyan-500" />
                {myShopData.city}, {myShopData.state}
              </p>
              <p className="flex items-center gap-2">
                <Globe size={16} className="text-cyan-500" />
                {myShopData.address}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Add Your Fresh Catch Glass Card */}
        <div 
          ref={addItemCardRef}
          className="relative z-10 w-full max-w-md bg-white/60 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl p-6 hover:shadow-cyan-500/20 transition-shadow duration-300"
        >
          <div className="flex flex-col items-center text-center">
            
            <div 
              ref={fishIconRef}
              className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/30"
            >
              <Fish size={34} className="text-white" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              Add Your Fresh Catch
            </h2>

            <p className="text-gray-600 text-sm sm:text-base mb-6">
              List your fresh seafood items and let the ocean lovers order directly!
            </p>

            <button
              onClick={() => navigate("/add-item")}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-full font-medium shadow-lg shadow-cyan-500/40 transition-all duration-200"
            >
              <Plus size={18} />
              Add Catch
            </button>

          </div>
        </div>

        {/* ========== 3. ITEMS LIST (Fixed with Fallbacks) ========== */}
        {myShopData.items && myShopData.items.length > 0 && (
          <div 
            ref={itemsListRef}
            className="relative z-10 w-full max-w-3xl flex flex-col gap-4 mt-2"
          >
            <h3 className="text-xl font-bold text-gray-800 px-2">Your Menu / Catches</h3>
            {myShopData.items.map((item, index) => (
              <div 
                key={item._id || index}
                className="group w-full bg-white/60 backdrop-blur-xl border border-white/40 shadow-lg rounded-2xl overflow-hidden flex items-center p-4 gap-4 hover:shadow-cyan-500/20 transition-all duration-300"
              >
                {/* Item Image */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-xl overflow-hidden border border-white/30 bg-gray-100">
                  <img 
                    src={item.image || item.imageUrl} 
                    alt={item.name || "Catch"} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1565538810643-b5bdb714103a?w=200&h=200&fit=crop";
                    }}
                  />
                </div>

                {/* Item Details */}
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-lg font-bold text-gray-800">
                    {item.name || item.itemName || item.title || "Unnamed Catch"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Category: {item.category || "General"}
                  </p>
                  <p className="text-sm font-semibold text-cyan-600 mt-1">
                    ₹{item.price || 0}
                  </p>
                </div>

                {/* Edit & Delete Icons */}
                <div className="flex flex-col gap-2 self-center">
                  <button 
                    className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                    onClick={() => navigate(`/edit-item/${item._id}`)}
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                    onClick={() => console.log("Delete item", item._id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    );
  }

  // ==========================================
  // ✅ CASE 2: AGAR SHOP DATA NAHI HAI (Ocean Get Started)
  // ==========================================
  return (
    <div className="relative min-h-[calc(100vh-70px)] bg-gradient-to-b from-[#e0f7fa] via-[#b2ebf2] to-[#80deea] overflow-hidden flex items-center justify-center p-4">
      
      {/* 🫧 Bubbles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          ref={(el) => (bubblesRef.current[i] = el)}
          className="absolute rounded-full bg-white/30 backdrop-blur-sm border border-white/20"
          style={{
            width: `${10 + Math.random() * 30}px`,
            height: `${10 + Math.random() * 30}px`,
            left: `${Math.random() * 100}%`,
            bottom: `-20px`,
          }}
        />
      ))}

      {/* 🌊 Bottom Wave */}
      <div ref={waveRef} className="absolute bottom-0 left-0 w-full h-20 pointer-events-none">
        <svg viewBox="0 0 1440 320" className="w-full h-full fill-[#4dd0e1]/30">
          <path d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,170.7C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
        </svg>
      </div>

      {/* Glass Card */}
      <div 
        ref={cardRef}
        className="relative z-10 w-full max-w-sm bg-white/60 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-8 flex flex-col items-center"
      >
        <div 
          ref={iconRef}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mb-5 shadow-lg shadow-cyan-500/30"
        >
          <Store size={40} className="text-white" />
        </div>

        <h2 ref={titleRef} className="text-xl font-bold text-gray-800 mb-1">
          Start Your Seafood Business
        </h2>
        <p ref={descRef} className="text-gray-500 text-sm mb-6">
          Dive into the ocean of opportunities with AquaMart!
        </p>

        <button
          ref={btnRef}
          onClick={() => navigate("/create-shop")}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-cyan-500/30"
        >
          Get Started <ArrowRight size={18} />
        </button>

        <p ref={footerRef} className="text-xs text-gray-400 mt-4 text-center">
          <span className="font-semibold text-red-500">*Must</span> verify your shop details before publishing.
        </p>

      </div>
    </div>
  );
}

export default AdminDashboard;