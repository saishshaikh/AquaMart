import React, { useEffect, useRef, useState } from 'react';
import { Bell, ShoppingCart, Search, User, LogOut, MapPin, Menu, X, Home } from "lucide-react";
import { useSelector, useDispatch } from "react-redux"; // 👈 useDispatch import karna zaroori hai
import gsap from "gsap";
import axios from "axios"; // 👈 axios import karna zaroori hai

import useGetCity from "../hooks/useGetCurrentUser";
import { setUserData } from '../redux/userSlice';
import { serverUrl } from '../App'; // 👈 serverUrl import karna zaroori hai

function Nav1() {
  const { userData, city } = useSelector((state) => state.user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cityLoading, setCityLoading] = useState(true);
  
  const logoRef = useRef(null);
  const searchRef = useRef(null);
  const rightRef = useRef(null);
  const cartRef = useRef(null);
  const bellRef = useRef(null);
  const userRef = useRef(null);
  const logoutRef = useRef(null);
  const locationRef = useRef(null);
  const mobileMenuRef = useRef(null);
  
  const dispatch = useDispatch();

  // 🛠️ Fixed Logout Function (Backticks `` used instead of '')
  const Hndlelogout = async () => {
    try {
      await axios.post(`${serverUrl}/api/auth/signout`, { withCredentials: true });
      dispatch(setUserData(null));
    } catch (error) {
      console.log("❌ Logout Error:", error.response?.data || error.message);
    }
  };

  // Call the custom hook to get city
  useGetCity();

  // Update loading state when city or userData.city changes
  useEffect(() => {
    if (city || userData?.city) {
      setCityLoading(false);
    }
  }, [city, userData]);

  useEffect(() => {
    // Logo entrance
    gsap.from(logoRef.current, {
      x: -50,
      opacity: 0,
      duration: 1,
      ease: "back.out(1.7)",
    });

    // Search bar
    gsap.from(searchRef.current, {
      y: -20,
      opacity: 0,
      duration: 0.8,
      delay: 0.2,
      ease: "power3.out",
    });

    // Location
    gsap.from(locationRef.current, {
      y: -20,
      opacity: 0,
      duration: 0.8,
      delay: 0.3,
      ease: "power3.out",
    });

    // Right section
    gsap.from(rightRef.current, {
      x: 50,
      opacity: 0,
      duration: 1,
      delay: 0.1,
      ease: "back.out(1.7)",
    });

    // Stagger
    gsap.from([cartRef.current, bellRef.current, userRef.current, logoutRef.current], {
      y: -30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      delay: 0.4,
      ease: "power3.out",
    });

    // Mobile menu animation
    if (mobileMenuRef.current) {
      gsap.from(mobileMenuRef.current, {
        x: 300,
        opacity: 0,
        duration: 0.4,
        ease: "power3.out",
      });
    }

  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      
      <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-4 sm:px-6">

        {/* Logo */}
        <div 
          ref={logoRef}
          className="flex items-center gap-2 cursor-pointer group flex-shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xl shadow-md shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
            🐟
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Aqua<span className="text-blue-500">Mart</span>
            </h1>
          </div>
        </div>

        {/* Location - Dynamic city */}
        <div 
          ref={locationRef}
          className="hidden md:flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1.5 hover:bg-gray-200 transition-colors cursor-pointer"
        >
          <MapPin size={16} className="text-blue-500" />
          {cityLoading ? (
            <span className="text-sm text-gray-400 flex items-center gap-1">
              <span className="inline-block w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
              Detecting...
            </span>
          ) : (
            <span className="text-sm text-gray-700 font-medium">
              {city || userData?.city || "Mumbai"}
            </span>
          )}
        </div>

        {/* Search */}
        <div 
          ref={searchRef}
          className="hidden lg:flex items-center bg-gray-100 rounded-full px-4 py-2 w-80 hover:bg-gray-200 transition-colors focus-within:bg-gray-200 focus-within:ring-2 focus-within:ring-blue-400"
        >
          <Search size={18} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search fish, prawns..."
            className="bg-transparent outline-none w-full ml-2 text-gray-700 placeholder:text-gray-400 text-sm"
          />
        </div>

        {/* Right Section */}
        <div 
          ref={rightRef}
          className="flex items-center gap-1.5 sm:gap-2"
        >

          {/* Dashboard */}
          <div className="hidden md:flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1.5 hover:bg-gray-200 transition-colors cursor-pointer">
            <Home size={16} className="text-blue-500" />
            <span className="text-sm text-gray-700 font-medium hidden xl:inline">Dashboard</span>
          </div>

          {/* Cart */}
          <button 
            ref={cartRef}
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ShoppingCart size={20} className="text-gray-700" />
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-blue-500 text-xs flex items-center justify-center text-white font-medium">
              2
            </span>
          </button>

          {/* Bell */}
          <button 
            ref={bellRef}
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors hidden sm:block"
          >
            <Bell size={20} className="text-gray-700" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? (
              <X size={20} className="text-gray-700" />
            ) : (
              <Menu size={20} className="text-gray-700" />
            )}
          </button>

          {/* User */}
          <div 
            ref={userRef}
            className="hidden md:flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white">
              <User size={16} />
            </div>
            <div className="hidden xl:block">
              <p className="text-sm font-semibold text-gray-800 leading-tight">
                {userData?.fullName || "Guest"}
              </p>
              <p className="text-xs text-gray-500 leading-tight capitalize">
                {userData?.role || "User"}
              </p>
            </div>
          </div>

          {/* Logout Button (Fixed onClick placement) */}
          <button 
            ref={logoutRef}
            onClick={Hndlelogout}
            className="hidden md:flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-full transition-colors duration-200 text-sm font-medium"
          >
            <LogOut size={16} />
            <span className="hidden xl:inline">Logout</span>
          </button>
        </div>

      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg p-4"
        >
          {/* Search */}
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 mb-3">
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search fish..."
              className="bg-transparent outline-none w-full ml-2 text-gray-700 placeholder:text-gray-400 text-sm"
            />
          </div>

          {/* Navigation Links */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Home size={18} className="text-blue-500" />
              <span className="text-gray-700">Dashboard</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              <MapPin size={18} className="text-blue-500" />
              <span className="text-gray-700">
                {cityLoading ? "Detecting..." : (city || userData?.city || "Mumbai")}
              </span>
            </div>
          </div>

          <hr className="my-3 border-gray-200" />

          {/* User Info */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white">
              <User size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {userData?.fullName || "Guest"}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {userData?.role || "User"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mb-3">
            <button className="flex-1 flex items-center justify-center gap-2 bg-gray-100 rounded-full px-4 py-2 text-gray-700 text-sm hover:bg-gray-200 transition-colors">
              <ShoppingCart size={16} />
              <span>Cart (2)</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 bg-gray-100 rounded-full px-4 py-2 text-gray-700 text-sm hover:bg-gray-200 transition-colors">
              <Bell size={16} />
              <span>Alerts</span>
            </button>
          </div>

          {/* Logout (Mobile) */}
          <button 
            onClick={Hndlelogout}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition-colors text-sm font-medium"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}

    </header>
  );
}

export default Nav1;