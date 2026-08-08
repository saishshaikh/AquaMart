import React, { useEffect, useRef, useState } from 'react';
import { Bell, ShoppingCart, Search, User, LogOut, MapPin, Menu, X, Plus, FileText } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import gsap from "gsap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import useGetCity from "../hooks/useGetCurrentUser";
import { setUserData } from '../redux/userSlice';
import { serverUrl } from '../App';

function Nav1() {
  const { userData, city } = useSelector((state) => state.user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cityLoading, setCityLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Refs for GSAP
  const logoRef = useRef(null);
  const centerLinksRef = useRef(null);
  const rightRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const locationRef = useRef(null);

  // Check Admin / Owner
  const isAdmin = userData?.role === 'admin' || userData?.role === 'owner';

  // Logout Function
  const Hndlelogout = async () => {
    try {
      await axios.post(`${serverUrl}/api/auth/signout`, { withCredentials: true });
      dispatch(setUserData(null));
      navigate("/signin");
    } catch (error) {
      console.log("❌ Logout Error:", error.response?.data || error.message);
    }
  };

  // Get City Hook
  useGetCity();

  useEffect(() => {
    if (city || userData?.city) {
      setCityLoading(false);
    }
  }, [city, userData]);

  // GSAP Animations (Screenshot ki tarah smooth entry)
  useEffect(() => {
    gsap.from(logoRef.current, { x: -30, opacity: 0, duration: 0.8, ease: "power2.out" });
    gsap.from(centerLinksRef.current, { y: -15, opacity: 0, duration: 0.6, delay: 0.2, ease: "power2.out" });
    gsap.from(rightRef.current, { x: 30, opacity: 0, duration: 0.8, delay: 0.3, ease: "power2.out" });
  }, [isAdmin]);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100">
      
      {/* Navbar Container - Exact Screenshot Layout */}
      <div className="max-w-7xl mx-auto h-[70px] flex items-center justify-between px-4 lg:px-8">

        {/* ================= LEFT: LOGO (AquaMart Theme) ================= */}
        <div 
          ref={logoRef}
          className="flex items-center gap-1 cursor-pointer flex-shrink-0 group"
          onClick={() => navigate("/")}
        >
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110">
            <span className="text-lg md:text-xl">🐟</span>
          </div>
          <div className="flex items-baseline">
            <h1 className="text-lg md:text-xl font-bold text-gray-800 tracking-tight">
              Aqua<span className="text-blue-500">Mart</span>
            </h1>
          </div>
        </div>

        {/* ================= CENTER: LINKS / SEARCH ================= */}
        <div ref={centerLinksRef} className="hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2 gap-6">
          
          {/* 🌟 Admin/Owner Buttons */}
          {isAdmin ? (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate("/add-item")}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-cyan-50 text-cyan-600 hover:bg-cyan-100 transition-colors text-sm font-semibold"
              >
                <Plus size={16} /> Add Food Item
              </button>
              
              <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full hover:bg-gray-50 text-gray-700 transition-colors text-sm font-semibold">
                <FileText size={16} /> My Orders
              </button>
            </div>
          ) : (
            /* 🌟 Normal User Search Bar */
            <div className="flex items-center gap-6">
              <div className="relative hidden lg:flex items-center text-gray-500">
                <Search size={18} className="absolute left-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search fish, prawns..."
                  className="pl-10 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full outline-none focus:border-blue-400 focus:bg-white text-sm w-64 transition-all"
                />
              </div>

              <div className="flex items-center gap-1.5 text-gray-600 text-sm font-medium cursor-pointer hover:text-cyan-500 transition-colors">
                <MapPin size={18} className="text-blue-500" />
                <span>
                  {cityLoading ? "Loading..." : (city || userData?.city || "Mumbai")}
                </span>
              </div>
            </div>
          )}

        </div>

        {/* ================= RIGHT: ICONS & PROFILE ================= */}
        <div ref={rightRef} className="flex items-center gap-1.5 sm:gap-3">

          {/* Cart - Only for Normal Users */}
          {!isAdmin && (
            <button 
              className="relative p-2 rounded-full hover:bg-slate-50 transition-colors text-gray-700 hidden sm:block"
            >
              <ShoppingCart size={22} />
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-blue-500 rounded-full text-[10px] flex items-center justify-center text-white font-medium shadow-sm">
                0
              </span>
            </button>
          )}

          {/* Notification Bell */}
          <button className="relative p-2 rounded-full hover:bg-slate-50 transition-colors text-gray-700 hidden sm:block">
            <Bell size={22} />
            <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-400 rounded-full"></span>
          </button>

          {/* Mobile Menu Button (Visible on Small Screens) */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-full hover:bg-slate-50 transition-colors text-gray-700"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* User Avatar - (Screenshot jaisa 'A' but Blue theme) */}
          <div className="hidden md:flex items-center gap-2 cursor-pointer ml-1">
             <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/30">
               {userData?.fullName?.charAt(0).toUpperCase() || "A"}
             </div>
          </div>

          {/* Logout - Only for logged in users */}
          {userData && (
            <button 
              onClick={Hndlelogout}
              className="hidden lg:flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-full transition-colors duration-200 text-sm font-semibold"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          )}

        </div>

      </div>

      {/* ================= MOBILE MENU DROPDOWN (Fully Responsive) ================= */}
      {isMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="md:hidden absolute top-[70px] left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-xl p-5 space-y-4"
        >
          
          {/* Mobile Admin/User Links */}
          {isAdmin ? (
            <div className="space-y-2">
              <button onClick={() => { navigate("/add-item"); setIsMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 bg-cyan-50 text-cyan-600 px-4 py-3 rounded-full font-semibold text-sm">
                <Plus size={18} /> Add Food Item
              </button>
              <button onClick={() => setIsMenuOpen(false)} className="w-full flex items-center justify-center gap-2 bg-slate-50 text-gray-700 px-4 py-3 rounded-full font-semibold text-sm">
                <FileText size={18} /> My Orders
              </button>
            </div>
          ) : (
            // Mobile User Links
            <div className="space-y-3">
              {/* Search Bar for Mobile */}
              <div className="flex items-center bg-slate-50 rounded-full px-4 py-3 border border-slate-200">
                <Search size={18} className="text-gray-400" />
                <input type="text" placeholder="Search fish..." className="bg-transparent outline-none w-full ml-2 text-gray-700 text-sm" />
              </div>
              {/* Location for Mobile */}
              <div className="flex items-center justify-center px-2 py-2 bg-slate-50 rounded-full">
                 <span className="text-sm text-gray-700 font-medium flex items-center gap-2">
                   <MapPin size={16} className="text-blue-500" /> 
                   {cityLoading ? "Detecting..." : (city || userData?.city || "Mumbai")}
                 </span>
              </div>
            </div>
          )}

          <hr className="border-gray-100 my-2" />

          {/* Mobile Profile & Logout Section */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {userData?.fullName?.charAt(0).toUpperCase() || "A"}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 leading-tight">{userData?.fullName || "Guest"}</p>
                <p className="text-xs text-blue-500 font-medium capitalize leading-tight mt-0.5">{userData?.role || "User"}</p>
              </div>
            </div>
            
            <button onClick={Hndlelogout} className="flex items-center gap-1.5 bg-red-50 text-red-500 px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-100 transition-colors">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      )}

    </header>
  );
}

export default Nav1;