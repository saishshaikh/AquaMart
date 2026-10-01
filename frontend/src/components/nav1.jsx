import React, { useEffect, useRef, useState } from 'react';
import { ShoppingCart, Search, LogOut, MapPin, Menu, X, Plus, FileText, Fish, Package, Store } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import gsap from "gsap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { setUserData } from '../redux/userSlice';
import { serverUrl } from '../App';

function Nav1() {
  // 🔴 FIX 1: Direct State Selector Without Inline Fallback Objects
  const userData = useSelector((state) => state.user?.userData);
  const city = useSelector((state) => state.user?.city);
  const cartitems = useSelector((state) => state.user?.cartitems);
  const myShopData = useSelector((state) => state.owner?.myShopData); 
  const rawOrders = useSelector((state) => state.orders?.orders);

  // Safe Fallback Variables (Outside useSelector)
  const orders = rawOrders || [];
  const cartList = cartitems || [];

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cityLoading, setCityLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const logoRef = useRef(null);
  const centerSectionRef = useRef(null);
  const rightRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Cart item count (distinct items in basket)
  const totalItemCount = cartList.length;

  // Live Pending Orders Count
  const pendingOrderCount = orders.filter(o => 
    o.status === 'pending' || o.shopOrders?.some(so => so.shopStatus === 'pending')
  ).length;

  const showAddButton = (userData?.role === 'admin' || userData?.role === 'owner') && myShopData !== null && myShopData !== undefined;
  const showAdminLayout = userData?.role === 'admin' || userData?.role === 'owner';

  const Hndlelogout = async () => {
    try {
      await axios.post(`${serverUrl}/api/auth/signout`, {}, { withCredentials: true });
      dispatch(setUserData(null));
      navigate("/signin");
    } catch (error) {
      console.log("❌ Logout Error:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    if (city || userData?.city) {
      setCityLoading(false);
    }
  }, [city, userData]);

  // GSAP Entrance Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(logoRef.current, { y: -20, opacity: 0, duration: 0.8, ease: "power3.out" });
      gsap.from(centerSectionRef.current, { y: -20, opacity: 0, duration: 0.8, delay: 0.1, ease: "power3.out" });
      gsap.from(rightRef.current, { y: -20, opacity: 0, duration: 0.8, delay: 0.2, ease: "power3.out" });
    });
    return () => ctx.revert();
  }, []);

  // Handle Mobile Menu animation
  useEffect(() => {
    if (isMenuOpen) {
      gsap.fromTo(mobileMenuRef.current, 
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [isMenuOpen]);

  const UserAvatar = () => (
    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-cyan-500/20 border border-white/20 flex-shrink-0">
      {userData?.fullName?.charAt(0).toUpperCase() || "A"}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/20">
      
      <div className="max-w-[1400px] mx-auto h-[70px] sm:h-[75px] flex items-center justify-between px-3 sm:px-6 lg:px-8">

        {/* LEFT: LOGO */}
        <div 
          ref={logoRef}
          className="flex items-center gap-2 cursor-pointer flex-shrink-0 group"
          onClick={() => navigate("/")}
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 transition-transform duration-300 group-hover:scale-105 border border-white/20">
            <Fish className="text-white w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex items-baseline">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tighter">
              Aqua<span className="text-cyan-400">Mart</span>
            </h1>
          </div>
        </div>

        {/* CENTER: Desktop Navigation */}
        <div ref={centerSectionRef} className="hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2">
          {showAdminLayout ? (
            <div className="flex items-center gap-2.5 bg-white/5 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-full shadow-inner">
              {showAddButton && (
                <button 
                  onClick={() => navigate("/add-item")}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 text-xs sm:text-sm font-semibold shadow-md hover:shadow-cyan-500/20"
                >
                  <Plus size={16} /> Add Catch
                </button>
              )}
              {/* ✅ FIX: Shop Orders button tabhi dikhega jab myShopData exist karega */}
              {myShopData && (
                <button 
                  onClick={() => navigate("/shop-orders")} 
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-slate-200 hover:bg-white/10 transition-colors text-xs sm:text-sm font-semibold"
                >
                  <FileText size={16} /> Shop Orders
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4 lg:gap-6">
              <div className="relative hidden lg:flex items-center text-slate-300">
                <Search size={18} className="absolute left-4 text-cyan-500" />
                <input
                  type="text"
                  placeholder="Search premium seafood..."
                  className="pl-11 pr-5 py-2 bg-white/5 border border-white/10 rounded-full outline-none focus:border-cyan-500/50 focus:bg-white/10 text-white text-sm w-64 lg:w-80 transition-all placeholder:text-slate-500"
                />
              </div>
              <div className="flex items-center gap-2 text-slate-200 text-xs sm:text-sm font-medium cursor-pointer hover:text-cyan-400 transition-colors bg-white/5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/10">
                <MapPin size={18} className="text-cyan-400 flex-shrink-0" />
                <span className="truncate max-w-[120px] sm:max-w-none">{cityLoading ? "Detecting..." : (city || userData?.city || "Mumbai")}</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: ICONS & USER MENU */}
        <div ref={rightRef} className="flex items-center gap-1.5 sm:gap-3">
          
          {/* 🛒 CART ICON */}
          {!showAdminLayout && (
            <button 
              onClick={() => navigate("/cart")}
              className="relative p-2.5 sm:p-3 rounded-full hover:bg-white/10 transition-colors text-slate-200 group"
            >
              <ShoppingCart size={22} className="sm:w-6 sm:h-6" />
              {totalItemCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-[10px] sm:text-[11px] flex items-center justify-center text-white font-bold shadow-md group-hover:scale-110 transition-transform">
                  {totalItemCount}
                </span>
              )}
            </button>
          )}
          
          {/* 📦 ORDERS ICON */}
          <button 
            onClick={() => {
              if (userData?.role === 'admin' || userData?.role === 'owner') {
                navigate("/shop-orders"); 
              } else {
                navigate("/my-orders");   
              }
            }}
            className="relative p-2.5 sm:p-3 rounded-full hover:bg-white/10 transition-colors text-slate-200 group"
          >
            {userData?.role === 'admin' || userData?.role === 'owner' ? (
              <Store size={22} className="sm:w-6 sm:h-6" />
            ) : (
              <Package size={22} className="sm:w-6 sm:h-6" />
            )}
            
            {pendingOrderCount > 0 ? (
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full border-2 border-slate-950 flex items-center justify-center text-[9px] font-bold text-white animate-pulse">
                {pendingOrderCount}
              </span>
            ) : (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-950 animate-pulse"></span>
            )}
          </button>

          {/* Desktop User Info & Avatar */}
          <div className="hidden md:flex items-center gap-2.5 cursor-pointer ml-2 pl-3 border-l border-white/10">
             <UserAvatar />
             {userData && (
                <div className='hidden xl:block text-left'>
                    <p className="text-sm font-semibold text-white leading-tight">{userData?.fullName || "User"}</p>
                    <p className="text-xs text-cyan-400 capitalize mt-0.5">{userData?.role}</p>
                </div>
             )}
          </div>
          
          {/* Logout Button */}
          {userData && (
            <button onClick={Hndlelogout} className="hidden xl:flex items-center gap-2 bg-white/5 hover:bg-rose-500/10 text-rose-300 ml-1 px-3.5 py-2 rounded-2xl transition-all duration-200 text-xs sm:text-sm font-semibold border border-white/5 hover:border-rose-500/20">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors text-slate-200 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div ref={mobileMenuRef} className="md:hidden absolute top-[70px] sm:top-[75px] left-0 right-0 bg-slate-950/95 backdrop-blur-2xl border-b border-white/10 shadow-2xl p-5 space-y-4 z-50">
          
          {showAdminLayout ? (
            <div className="grid grid-cols-2 gap-2.5">
              {showAddButton && (
                <button onClick={() => { navigate("/add-item"); setIsMenuOpen(false); }} className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-3 rounded-2xl font-semibold text-xs sm:text-sm shadow-md">
                  <Plus size={16} /> Add Catch
                </button>
              )}
              {/* ✅ FIX: Mobile menu mein bhi check laga diya */}
              {myShopData && (
                <button onClick={() => { navigate("/shop-orders"); setIsMenuOpen(false); }} className="flex items-center justify-center gap-2 bg-white/5 text-slate-200 px-3 py-3 rounded-2xl font-semibold text-xs sm:text-sm border border-white/10">
                  <FileText size={16} /> Shop Orders
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center bg-white/5 rounded-full px-4 py-3 border border-white/10 focus-within:border-cyan-500 transition-all">
                <Search size={18} className="text-cyan-500 flex-shrink-0" />
                <input type="text" placeholder="Search seafood..." className="bg-transparent outline-none w-full ml-3 text-white text-xs sm:text-sm placeholder:text-slate-500" />
              </div>
              
              <button 
                onClick={() => { navigate("/my-orders"); setIsMenuOpen(false); }}
                className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-orange-500/20 text-orange-400 rounded-2xl border border-orange-500/30 hover:bg-orange-500/30 transition-colors"
              >
                <Package size={18} />
                <span className="text-sm font-semibold">My Orders</span>
              </button>

              <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 rounded-full border border-white/10">
                 <MapPin size={16} className="text-cyan-400 flex-shrink-0" /> 
                 <span className="text-xs sm:text-sm text-slate-200 font-medium truncate">
                   {cityLoading ? "Detecting..." : (city || userData?.city || "Mumbai")}
                 </span>
              </div>
            </div>
          )}
          
          <hr className="border-white/10" />

          <div className="flex items-center justify-between bg-white/5 p-3.5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3 overflow-hidden">
              <UserAvatar />
              <div className="truncate">
                <p className="text-sm font-bold text-white truncate">{userData?.fullName || "Guest"}</p>
                <p className="text-[11px] text-cyan-400 font-medium capitalize mt-0.5">{userData?.role || "User"}</p>
              </div>
            </div>
            {userData && (
              <button onClick={Hndlelogout} className="flex items-center gap-1.5 bg-rose-500/10 text-rose-300 px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-rose-500/20 transition-colors border border-rose-500/20 flex-shrink-0">
                <LogOut size={14} /> Logout
              </button>
            )}
          </div>
        </div>
      )}

    </header>
  );
}

export default Nav1;