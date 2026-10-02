import React, { useEffect, useRef, useState } from 'react';
import { ShoppingCart, Search, LogOut, MapPin, Menu, X, Plus, FileText, Fish, Package, Store, Sun, Moon } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import gsap from "gsap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { setUserData, toggleTheme } from '../redux/userSlice';
import { serverUrl } from '../App';

function Nav1() {
  const userData = useSelector((state) => state.user?.userData);
  const city = useSelector((state) => state.user?.city);
  const cartitems = useSelector((state) => state.user?.cartitems);
  const myShopData = useSelector((state) => state.owner?.myShopData); 
  const rawOrders = useSelector((state) => state.orders?.orders);
  const theme = useSelector((state) => state.user?.theme || "dark");

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

  const totalItemCount = cartList.length;

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

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(logoRef.current, { y: -20, opacity: 0, duration: 0.8, ease: "power3.out" });
      gsap.from(centerSectionRef.current, { y: -20, opacity: 0, duration: 0.8, delay: 0.1, ease: "power3.out" });
      gsap.from(rightRef.current, { y: -20, opacity: 0, duration: 0.8, delay: 0.2, ease: "power3.out" });
    });
    return () => ctx.revert();
  }, []);

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

  const isLight = theme === 'light';

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-200 ${
      isLight 
        ? 'bg-white/90 border-slate-200 shadow-md shadow-slate-200/50 text-slate-800' 
        : 'bg-slate-950/85 border-white/10 shadow-2xl shadow-black/20 text-white'
    }`}>
      
      <div className="max-w-[1450px] mx-auto h-[70px] sm:h-[75px] flex items-center justify-between px-3 sm:px-6 lg:px-8">

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
            <h1 className={`text-xl sm:text-2xl font-black tracking-tighter ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Aqua<span className="text-cyan-500">Mart</span>
            </h1>
          </div>
        </div>

        {/* CENTER: Desktop Navigation */}
        <div ref={centerSectionRef} className="hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2">
          {showAdminLayout ? (
            <div className={`flex items-center gap-2.5 backdrop-blur-sm border px-3 py-1.5 rounded-full shadow-inner ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'
            }`}>
              {showAddButton && (
                <button 
                  onClick={() => navigate("/add-item")}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 text-xs sm:text-sm font-semibold shadow-md hover:shadow-cyan-500/20"
                >
                  <Plus size={16} /> Add Catch
                </button>
              )}
              {myShopData && (
                <button 
                  onClick={() => navigate("/shop-orders")} 
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors text-xs sm:text-sm font-semibold ${
                    isLight ? 'text-slate-700 hover:bg-slate-200' : 'text-slate-200 hover:bg-white/10'
                  }`}
                >
                  <FileText size={16} /> Shop Orders
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4 lg:gap-6">
              <div className={`flex items-center gap-2 text-xs sm:text-sm font-medium cursor-pointer transition-colors px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border ${
                isLight 
                  ? 'bg-slate-100 text-slate-700 border-slate-200 hover:border-cyan-400' 
                  : 'bg-white/5 text-slate-200 border-white/10 hover:text-cyan-400'
              }`}>
                <MapPin size={16} className="text-cyan-500 flex-shrink-0" />
                <span className="truncate max-w-[120px] sm:max-w-none">{cityLoading ? "Detecting..." : (city || userData?.city || "Mumbai")}</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: ICONS & THEME TOGGLE & USER MENU */}
        <div ref={rightRef} className="flex items-center gap-1.5 sm:gap-2.5">
          
          {/* ☀️ / 🌙 THEME TOGGLE BUTTON */}
          <button
            onClick={() => dispatch(toggleTheme())}
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            className={`p-2 sm:p-2.5 rounded-full border transition-all shadow cursor-pointer active:scale-95 ${
              isLight 
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-amber-600' 
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-amber-400 hover:text-white'
            }`}
            aria-label="Toggle Theme"
          >
            {isLight ? <Moon size={19} className="text-indigo-600" /> : <Sun size={19} className="text-amber-400" />}
          </button>

          {/* 🛒 CART ICON */}
          {!showAdminLayout && (
            <button 
              onClick={() => navigate("/cart")}
              className={`relative p-2 sm:p-2.5 rounded-full transition-colors group ${
                isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <ShoppingCart size={20} className="sm:w-5 sm:h-5" />
              {totalItemCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold shadow-md group-hover:scale-110 transition-transform">
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
            className={`relative p-2 sm:p-2.5 rounded-full transition-colors group ${
              isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-white/10'
            }`}
          >
            {userData?.role === 'admin' || userData?.role === 'owner' ? (
              <Store size={20} className="sm:w-5 sm:h-5" />
            ) : (
              <Package size={20} className="sm:w-5 sm:h-5" />
            )}
            
            {pendingOrderCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border border-slate-950 flex items-center justify-center text-[9px] font-bold text-white animate-pulse">
                {pendingOrderCount}
              </span>
            )}
          </button>

          {/* Desktop User Info & Avatar */}
          <div className={`hidden md:flex items-center gap-2 cursor-pointer ml-1 pl-2.5 border-l ${
            isLight ? 'border-slate-200' : 'border-white/10'
          }`}>
             <UserAvatar />
             {userData && (
                <div className='hidden xl:block text-left'>
                    <p className={`text-xs font-semibold leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>{userData?.fullName || "User"}</p>
                    <p className="text-[10px] text-cyan-600 dark:text-cyan-400 capitalize">{userData?.role}</p>
                </div>
             )}
          </div>
          
          {/* Logout Button */}
          {userData && (
            <button onClick={Hndlelogout} className={`hidden xl:flex items-center gap-1.5 ml-1 px-3 py-1.5 rounded-xl transition-all text-xs font-semibold border ${
              isLight 
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200' 
                : 'bg-white/5 hover:bg-rose-500/10 text-rose-300 border-white/5 hover:border-rose-500/20'
            }`}>
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className={`md:hidden p-2 rounded-xl transition-colors focus:outline-none ${
              isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-white/10'
            }`}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div ref={mobileMenuRef} className={`md:hidden absolute top-[70px] sm:top-[75px] left-0 right-0 backdrop-blur-2xl border-b shadow-2xl p-4 space-y-3 z-50 ${
          isLight ? 'bg-white/95 border-slate-200 text-slate-800' : 'bg-slate-950/95 border-white/10 text-white'
        }`}>
          
          <div className={`flex items-center justify-between p-3 rounded-2xl border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'
          }`}>
            <span className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Theme Mode:</span>
            <button
              onClick={() => dispatch(toggleTheme())}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
                isLight ? 'bg-white text-indigo-600 border border-slate-300' : 'bg-slate-800 text-cyan-300'
              }`}
            >
              {theme === "light" ? <Sun size={14} className="text-amber-500" /> : <Moon size={14} className="text-amber-300" />}
              <span>{theme === "light" ? "Light Mode" : "Dark Mode"}</span>
            </button>
          </div>

          {showAdminLayout ? (
            <div className="grid grid-cols-2 gap-2">
              {showAddButton && (
                <button onClick={() => { navigate("/add-item"); setIsMenuOpen(false); }} className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-2.5 rounded-2xl font-semibold text-xs shadow-md">
                  <Plus size={15} /> Add Catch
                </button>
              )}
              {myShopData && (
                <button onClick={() => { navigate("/shop-orders"); setIsMenuOpen(false); }} className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl font-semibold text-xs border ${
                  isLight ? 'bg-slate-100 text-slate-800 border-slate-200' : 'bg-white/5 text-slate-200 border-white/10'
                }`}>
                  <FileText size={15} /> Shop Orders
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <button 
                onClick={() => { navigate("/my-orders"); setIsMenuOpen(false); }}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-orange-500/20 text-orange-400 rounded-2xl border border-orange-500/30 hover:bg-orange-500/30 transition-colors text-xs font-bold"
              >
                <Package size={16} />
                <span>My Orders</span>
              </button>
            </div>
          )}
          
          <hr className={isLight ? 'border-slate-200' : 'border-white/10'} />

          <div className={`flex items-center justify-between p-3 rounded-2xl border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'
          }`}>
            <div className="flex items-center gap-2.5 overflow-hidden">
              <UserAvatar />
              <div className="truncate">
                <p className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{userData?.fullName || "Guest"}</p>
                <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-medium capitalize">{userData?.role || "User"}</p>
              </div>
            </div>
            {userData && (
              <button onClick={Hndlelogout} className="flex items-center gap-1 bg-rose-500/10 text-rose-500 px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-rose-500/20 transition-colors border border-rose-500/20 flex-shrink-0">
                <LogOut size={13} /> Logout
              </button>
            )}
          </div>
        </div>
      )}

    </header>
  );
}

export default Nav1;