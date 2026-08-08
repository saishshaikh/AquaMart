import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux'; // ✅ Redux import
import { Store, ArrowRight } from 'lucide-react';
import gsap from 'gsap';

function AdminDashboard() {
  const navigate = useNavigate();
  const { myShopData } = useSelector((state) => state.owner); // ✅ Redux se shop data check
  
  // Refs for GSAP
  const cardRef = useRef(null);
  const iconRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const btnRef = useRef(null);
  const footerRef = useRef(null);

  // GSAP Animation (Sirf tab chalega jab card render hoga)
  useEffect(() => {
    // Agar shop data already hai, toh animation ki zaroorat nahi, card dikhega hi nahi
    if (myShopData) return; 

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

  }, [myShopData]); // ✅ myShopData change hone par dobara check karega

  // ✅ AGAR SHOP DATA PEHLE SE HAI, TOH KUCH BHI MAT DIKHAO (Return null)
  if (myShopData) {
    return null; 
  }

  return (
    <div className="min-h-[calc(100vh-70px)] bg-[#fdfbf7] flex items-center justify-center p-4">
      
      {/* White Card */}
      <div 
        ref={cardRef}
        className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 p-8 w-full max-w-sm flex flex-col items-center"
      >
        
        {/* Icon Container */}
        <div 
          ref={iconRef}
          className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mb-5"
        >
          <Store size={40} className="text-blue-500" />
        </div>

        {/* Heading */}
        <h2 ref={titleRef} className="text-xl font-bold text-gray-800 mb-1">
          Start Your Business
        </h2>
        <p ref={descRef} className="text-gray-400 text-sm mb-6">
          Become a seller on AquaMart
        </p>

        {/* 🟢 SIRF EK BUTTON: Get Started */}
        <button
          ref={btnRef}
          onClick={() => navigate("/create-shop")}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-blue-500/30"
        >
          Get Started <ArrowRight size={18} />
        </button>

        {/* 📍 Niche ka "Must" Text */}
        <p ref={footerRef} className="text-xs text-gray-400 mt-4 text-center">
          <span className="font-semibold text-red-500">*Must</span> verify your shop details before publishing.
        </p>

      </div>
    </div>
  );
}

export default AdminDashboard;