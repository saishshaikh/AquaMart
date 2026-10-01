import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { 
  MapPin, Navigation, Star, Clock, ShieldCheck, Store, Utensils, 
  Tag, Package, Phone, Sparkles, Key, CheckCircle, Search, Flame, 
  ArrowRight, ShieldAlert, Award, Copy, Check, Filter, Layers, 
  Compass, Zap, ShoppingBag, ShoppingCart, DollarSign, ChevronRight
} from "lucide-react";
import axios from "axios";
import { serverUrl } from "../App";

import { categories } from "../data/Category";
import { useGetShopsByCity } from "../hooks/useGetShopsByCity"; 
import { useGetItemByCity } from "../hooks/useGetItemByCity"; 
import { addToCart, removeFromCart } from "../redux/userSlice.js"; 
import LiveTrackingMap from "../components/LiveTrackingMap";
import Footer from "../components/Footer";

const UserDashboard = () => {
  const dashboardRef = useRef(null);
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const categoryRef = useRef(null);
  const shopTitleRef = useRef(null);
  const shopsGridRef = useRef(null);
  const itemsTitleRef = useRef(null);
  const orderSectionRef = useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { city, address, shops, items, cartitems, userData } = useSelector((state) => state.user);

  const [myOrders, setMyOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchFilter, setSearchFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // 'all', 'dry', 'fresh'
  const [priceFilter, setPriceFilter] = useState("all"); // 'all', 'under200', '200to500', 'above500'
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  // 🌟 8 DYNAMIC ROTATING HERO POSTERS / BANNERS
  const heroPosters = [
    {
      id: 1,
      tag: "🌊 DAILY MORNING HARVEST",
      title: "Wild Caught King Surmai & Silver Pomfret",
      highlight: "100% Sea Fresh • No Preservatives",
      desc: "Cleaned, sliced, and ozone-washed morning catch direct from coastal docks of Malvan & Mumbai. Chilled and delivered in 30 minutes!",
      btnText: "🐟 Explore Fresh Ocean Catch",
      filterType: "fresh",
      badge: "FLAT 20% OFF",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
      bgGradient: "from-slate-950 via-slate-900 to-cyan-950",
      accentGlow: "bg-cyan-500/25",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=700"
    },
    {
      id: 2,
      tag: "🔥 TRADITIONAL SUN-CURED",
      title: "Authentic Coastal Dry Fish & Crispy Bombil",
      highlight: "Naturally Sun-Dried • Pure Sea Salt",
      desc: "Traditional sun-dried Bombay Duck (Sukha Bombil), Jawla, and Kardi prepared with zero chemical additives. Ideal for crispy tawa fry!",
      btnText: "🔥 Shop Dry Fish Specials",
      filterType: "dry",
      badge: "BUY 2 GET 10% OFF",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      bgGradient: "from-slate-950 via-slate-900 to-amber-950",
      accentGlow: "bg-amber-500/25",
      image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=700"
    },
    {
      id: 3,
      tag: "🦀 LIVE SHELLFISH & PRAWNS",
      title: "Juicy Jumbo Tiger Prawns & Live Mud Crabs",
      highlight: "Sweet Succulent Meat • Packed Alive",
      desc: "Fresh sea jumbo prawns de-veined or whole with live sea mud crabs delivered in moisture-controlled chill packs.",
      btnText: "🦐 Order Tiger Prawns & Crabs",
      filterType: "all",
      badge: "CHEF'S TOP PICK ⭐",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      bgGradient: "from-slate-950 via-slate-900 to-emerald-950",
      accentGlow: "bg-emerald-500/25",
      image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80&w=700"
    },
    {
      id: 4,
      tag: "🍲 FESTIVE CURRY COMBOS",
      title: "Dried Tarli, Bangda & Mandeli Curry Packs",
      highlight: "Head-Removed & Cleaned • Ready to Cook",
      desc: "Premium dried sardines, mackerel, and anchovies curated for authentic spicy coconut fish curries and coastal meals.",
      btnText: "🍛 View Dry Curry Combos",
      filterType: "dry",
      badge: "HOT SELLER 🔥",
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      bgGradient: "from-slate-950 via-slate-900 to-rose-950",
      accentGlow: "bg-rose-500/25",
      image: "https://images.unsplash.com/photo-1535400255456-984241443b29?auto=format&fit=crop&q=80&w=700"
    },
    {
      id: 5,
      tag: "⚡ LIMITED TIME FLASH DEAL",
      title: "Weekend Seafood Bonanza • Up to 35% Off",
      highlight: "Use Code: AQUA50 at Checkout",
      desc: "Apply promo code AQUA50 to get instant flat ₹50 discounts on premium fresh catch, lobster, and dry seafood boxes over ₹300!",
      btnText: "🎁 Claim Discount Now",
      filterType: "all",
      badge: "USE CODE: AQUA50",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      bgGradient: "from-slate-950 via-slate-900 to-purple-950",
      accentGlow: "bg-purple-500/25",
      image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=700"
    },
    {
      id: 6,
      tag: "🦐 COASTAL SPECIALITY",
      title: "Small Red Kardi & Golden Sun-Kissed Jawla",
      highlight: "Crispy Texture • Rich Coastal Umami",
      desc: "Small sun-cured prawns packed with calcium and protein — perfect for onion-garlic fry, spicy roasted chutney, or dal accompaniment.",
      btnText: "🦐 Browse Dried Prawns",
      filterType: "dry",
      badge: "100% ORGANIC",
      badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
      bgGradient: "from-slate-950 via-slate-900 to-yellow-950",
      accentGlow: "bg-yellow-500/25",
      image: "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&q=80&w=700"
    },
    {
      id: 7,
      tag: "🚀 EXPRESS DOORSTEP DISPATCH",
      title: "Chilled & Ozone-Washed to Your Door in 30 Mins",
      highlight: "Live GPS Tracking + 4-Digit Security OTP",
      desc: "Watch your delivery partner move live on Google/OpenStreetMap with estimated ETA and seamless doorstep OTP verification.",
      btnText: "⚡ Order Fast Track Delivery",
      filterType: "all",
      badge: "30-MIN EXPRESS ⚡",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      bgGradient: "from-slate-950 via-slate-900 to-blue-950",
      accentGlow: "bg-blue-500/25",
      image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&q=80&w=700"
    },
    {
      id: 8,
      tag: "🔪 CUSTOM PORTIONS & CUTS",
      title: "Steak Cuts, Boneless Fillet or Whole Dressed",
      highlight: "Zero Weight Loss • Precision Cleaned",
      desc: "Select customized weight options (250g, 500g, 1kg, 2kg) with free descaling, gutting, and hygienic vacuum sealing included.",
      btnText: "🌊 Choose Your Favorite Cut",
      filterType: "all",
      badge: "HYGIENE CERTIFIED",
      badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/40",
      bgGradient: "from-slate-950 via-slate-900 to-teal-950",
      accentGlow: "bg-teal-500/25",
      image: "https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&q=80&w=700"
    }
  ];

  const [currentPosterIndex, setCurrentPosterIndex] = useState(0);

  // ⏱️ CONTINUOUS AUTOMATIC POSTER CHANGE (Every 4 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPosterIndex((prev) => (prev + 1) % heroPosters.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [heroPosters.length]);

  const nextPoster = () => {
    setCurrentPosterIndex((prev) => (prev + 1) % heroPosters.length);
  };

  const prevPoster = () => {
    setCurrentPosterIndex((prev) => (prev - 1 + heroPosters.length) % heroPosters.length);
  };

  const activePoster = heroPosters[currentPosterIndex];

  const [selectedLocation, setSelectedLocation] = useState(
    city || localStorage.getItem("userLocation") || "Bhiwandi"
  );

  const [currentAddress, setCurrentAddress] = useState(
    address || localStorage.getItem("userAddress") || ""
  );

  useGetShopsByCity(selectedLocation);
  useGetItemByCity(selectedLocation);

  const fetchMyOrders = async () => {
    if (!userData?._id && !userData?.id) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoadingOrders(true);

    try {
      const response = await axios.get(`${serverUrl}/api/order/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        setMyOrders(response.data.orders || []);
      }
    } catch (err) {
      console.error("❌ Error fetching orders:", err.response?.data || err.message);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (userData?._id || userData?.id) {
      fetchMyOrders();
    }
  }, [userData?._id, userData?.id]);

  useEffect(() => {
    if (city) {
      setSelectedLocation(city);
      localStorage.setItem("userLocation", city);
    }
    if (address) {
      setCurrentAddress(address);
      localStorage.setItem("userAddress", address);
    }
  }, [city, address]);

  const copyCouponCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2000);
  };

  // Filter items based on Category, Search, Dry/Fresh, & Price Range
  const filteredItems = (items || []).filter((item) => {
    const matchesSearch = !searchFilter || 
      item.name?.toLowerCase().includes(searchFilter.toLowerCase()) || 
      item.category?.toLowerCase().includes(searchFilter.toLowerCase());

    const matchesCategory = selectedCategory === "All" || 
      item.category?.toLowerCase() === selectedCategory.toLowerCase();

    const isDry = item.category?.toLowerCase().includes("dry") || item.name?.toLowerCase().includes("dry") || item.name?.toLowerCase().includes("sukha");
    const matchesType = typeFilter === "all" ? true : typeFilter === "dry" ? isDry : !isDry;

    let matchesPrice = true;
    const price = Number(item.price) || 0;
    if (priceFilter === 'under200') matchesPrice = price < 200;
    else if (priceFilter === '200to500') matchesPrice = price >= 200 && price <= 500;
    else if (priceFilter === 'above500') matchesPrice = price > 500;

    return matchesSearch && matchesCategory && matchesType && matchesPrice;
  });

  return (
    <div
      ref={dashboardRef}
      className="relative min-h-screen overflow-hidden bg-[#070d18] text-slate-100 px-3 py-6 sm:px-6 lg:px-8"
    >
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed -right-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-32 -left-32 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-[1500px] space-y-6">
        
        {/* TOP ADDRESS & STATUS BAR */}
        {currentAddress && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 bg-slate-900/80 border border-cyan-500/30 px-4 py-2.5 rounded-2xl backdrop-blur-md shadow-lg shadow-cyan-500/5">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-slate-300 tracking-wide">
                Live Delivery to: <span className="text-cyan-400 font-bold">{currentAddress}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                <ShieldCheck size={12} /> 30-Min Fast Track Area
              </span>
            </div>
          </div>
        )}

        {/* 🌟 2-COLUMN MODERN MARKETPLACE LAYOUT (PROPER FULL-HEIGHT SIDEBAR + MAIN FEED) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ==================================================== */}
          {/* 🧭 PROPER UNIFIED FULL-HEIGHT MODERN SIDEBAR (3 COLS) */}
          {/* ==================================================== */}
          <aside className="lg:col-span-3 lg:sticky lg:top-24 h-auto lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-6">
            
            {/* 1. Header with Marketplace Title & Live Tag */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                  <Filter size={15} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Marketplace Filter</h3>
                  <p className="text-[10px] text-slate-400">Coastal Direct Haul</p>
                </div>
              </div>
              <span className="text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-full font-mono font-bold">
                {filteredItems.length} Live
              </span>
            </div>

            {/* 2. Main Harvest Types */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Harvest Type</p>
              
              <div className="space-y-1.5">
                {[
                  { label: "🌊 All Seafood", type: "all", desc: "Fresh & Sun-Cured Combined" },
                  { label: "🔥 Sun-Cured Dry Fish", type: "dry", desc: "Bombil, Jawla, Mandeli, Tarli" },
                  { label: "🐟 Fresh Ocean Catch", type: "fresh", desc: "Surmai, Pomfret, Prawns, Rawas" },
                ].map((btn) => (
                  <button
                    key={btn.type}
                    onClick={() => {
                      setTypeFilter(btn.type);
                      setSelectedCategory("All");
                    }}
                    className={`w-full text-left p-3 rounded-2xl transition-all flex items-center justify-between cursor-pointer border ${
                      typeFilter === btn.type
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold leading-tight">{btn.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{btn.desc}</p>
                    </div>
                    <ChevronRight size={14} className={typeFilter === btn.type ? "text-cyan-400" : "text-slate-600"} />
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Category Quick Filter List */}
            <div className="space-y-2 border-t border-slate-800/80 pt-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Specific Catch Category</p>
              
              <div className="grid grid-cols-2 gap-1.5">
                {["All", "Dry Fish", "Ocean Fish", "Prawns", "Crabs", "Oysters"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer border ${
                      selectedCategory === cat
                        ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <span className="truncate">{cat}</span>
                    {selectedCategory === cat && <Check size={12} className="text-slate-950 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Price & Budget Filter */}
            <div className="space-y-2 border-t border-slate-800/80 pt-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Price / Budget</p>
              
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: "All Prices", value: "all" },
                  { label: "< ₹200", value: "under200" },
                  { label: "₹200 - ₹500", value: "200to500" },
                  { label: "> ₹500", value: "above500" },
                ].map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPriceFilter(p.value)}
                    className={`px-3 py-2 rounded-xl text-[11px] font-semibold text-center transition-all cursor-pointer border ${
                      priceFilter === p.value
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Exclusive Coupon Box */}
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 border border-cyan-500/30 rounded-2xl p-4 shadow-xl space-y-2.5">
              <div className="flex items-center gap-1.5">
                <Zap size={15} className="text-amber-400 fill-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Flat ₹50 Promo Coupon</h4>
              </div>
              <p className="text-[11px] text-slate-300">
                Use code on orders above ₹300 for instant discount:
              </p>

              <div className="bg-slate-950 border border-dashed border-cyan-500/40 rounded-xl p-2 flex items-center justify-between">
                <span className="font-mono font-black text-cyan-300 text-xs tracking-widest pl-1">
                  AQUA50
                </span>
                <button
                  onClick={() => copyCouponCode("AQUA50")}
                  className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedCoupon ? <Check size={11} /> : <Copy size={11} />}
                  {copiedCoupon ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* 6. Quick Shortcuts (Cart & Orders) */}
            <div className="border-t border-slate-800/80 pt-4 space-y-2">
              <button
                onClick={() => navigate('/cart')}
                className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-xs font-bold text-slate-200 hover:text-cyan-400 flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2">
                  <ShoppingCart size={15} className="text-cyan-400" />
                  <span>My Cart</span>
                </span>
                <span className="bg-cyan-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {cartitems?.length || 0}
                </span>
              </button>

              <button
                onClick={() => navigate('/my-orders')}
                className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-xs font-bold text-slate-200 hover:text-cyan-400 flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2">
                  <Package size={15} className="text-cyan-400" />
                  <span>Order Tracking & OTP</span>
                </span>
                <ChevronRight size={14} className="text-slate-500" />
              </button>
            </div>

          </aside>

          {/* ==================================================== */}
          {/* 🌊 MAIN STOREFRONT FEED & AUTO CAROUSEL (9 COLS)   */}
          {/* ==================================================== */}
          <main className="lg:col-span-9 space-y-8">
            
            {/* 🌟 AUTO-ROTATING COMMERCIAL POSTERS / HERO CAROUSEL */}
            <div 
              ref={heroRef}
              className={`relative rounded-3xl overflow-hidden border border-cyan-500/30 bg-gradient-to-r ${activePoster.bgGradient} p-6 sm:p-9 shadow-2xl transition-all duration-700 min-h-[340px] flex flex-col justify-between`}
            >
              {/* Background Ambient Glow & Poster Backdrop */}
              <div className={`absolute -right-10 -bottom-10 w-80 h-80 ${activePoster.accentGlow} rounded-full blur-3xl pointer-events-none transition-all duration-700`} />
              
              <div className="absolute right-0 top-0 bottom-0 w-full sm:w-1/2 opacity-20 sm:opacity-40 overflow-hidden pointer-events-none">
                <img 
                  src={activePoster.image} 
                  alt={activePoster.title} 
                  className="w-full h-full object-cover transition-all duration-1000 transform scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
              </div>

              {/* Poster Content */}
              <div className="relative z-10 max-w-2xl space-y-3.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="inline-flex items-center gap-1.5 bg-slate-900/90 border border-white/10 px-3 py-1 rounded-full text-cyan-300 text-xs font-bold tracking-wider uppercase backdrop-blur-md shadow-md">
                    <Flame size={13} className="text-amber-400" /> {activePoster.tag}
                  </div>
                  <span className={`text-[11px] font-bold px-3 py-0.5 rounded-full border shadow-sm ${activePoster.badgeColor}`}>
                    {activePoster.badge}
                  </span>
                </div>
                
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight transition-all duration-500">
                  {activePoster.title}
                </h1>

                <p className="text-xs sm:text-sm font-semibold text-cyan-300 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-cyan-400" /> {activePoster.highlight}
                </p>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal max-w-xl">
                  {activePoster.desc}
                </p>

                {/* CTA Button & Quick Category Triggers */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setTypeFilter(activePoster.filterType)}
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-xs shadow-xl shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer transform hover:scale-105 active:scale-95"
                  >
                    {activePoster.btnText}
                    <ArrowRight size={14} />
                  </button>

                  <div className="flex items-center gap-1.5 bg-slate-900/70 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl text-xs text-slate-300">
                    <Clock size={13} className="text-cyan-400 animate-spin" />
                    <span>Auto-Rotating Banner {currentPosterIndex + 1}/8</span>
                  </div>
                </div>
              </div>

              {/* Carousel Controls: 8 Indicator Dots & Prev/Next Arrows */}
              <div className="relative z-10 flex items-center justify-between pt-5 mt-4 border-t border-white/10">
                {/* 8 Dots Navigation */}
                <div className="flex items-center gap-2">
                  {heroPosters.map((poster, idx) => (
                    <button
                      key={poster.id}
                      onClick={() => setCurrentPosterIndex(idx)}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        currentPosterIndex === idx 
                          ? 'w-7 bg-cyan-400 shadow-md shadow-cyan-400/50' 
                          : 'w-2 bg-slate-700 hover:bg-slate-500'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

                {/* Prev / Next Arrows */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevPoster}
                    className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs transition-colors shadow cursor-pointer font-bold"
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={nextPoster}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs transition-colors shadow cursor-pointer font-bold"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>

            {/* SEARCH & INLINE FILTER BAR */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-800">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search fresh or dry fish (e.g. Surmai, Bombil, Pomfret)..."
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <span className="text-xs text-slate-400 font-semibold shrink-0">Selected Category:</span>
                <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-xl">
                  {selectedCategory}
                </span>
              </div>
            </div>

            {/* CATEGORIES HORIZONTAL CAROUSEL */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2
                  ref={titleRef}
                  className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  Seafood Categories
                </h2>
                <span className="text-xs text-slate-400 hidden sm:inline-block">Click to filter →</span>
              </div>

              <div
                ref={categoryRef}
                className="flex gap-4 overflow-x-auto pb-3 pt-1 no-scrollbar scroll-smooth"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {categories.map((item, index) => (
                  <div 
                    key={`${item.category}-${index}`}
                    onClick={() => setSelectedCategory(item.category)}
                    className="flex flex-col items-center gap-2 cursor-pointer flex-shrink-0 text-center group"
                  >
                    <div className={`h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-full border-2 bg-slate-900 shadow-lg transition-all duration-300 group-hover:scale-105 ${
                      selectedCategory === item.category ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'border-slate-800'
                    }`}>
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.category}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-2xl">
                          🦐
                        </div>
                      )}
                    </div>
                    <span className={`text-[11px] sm:text-xs font-bold transition-colors ${
                      selectedCategory === item.category ? 'text-cyan-400' : 'text-slate-300 group-hover:text-cyan-400'
                    }`}>
                      {item.category}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* SHOPS SECTION */}
            <section>
              <div className="mb-5 flex items-center gap-2">
                <Store className="w-5 h-5 text-cyan-400" />
                <h3
                  ref={shopTitleRef}
                  className="text-lg sm:text-xl font-black tracking-tight text-white"
                >
                  Certified Seafood Shops in <span className="text-cyan-400">{selectedLocation}</span>
                </h3>
              </div>

              {shops && shops.length > 0 ? (
                <div 
                  ref={shopsGridRef}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                  {shops.map((shop) => (
                    <div
                      key={shop._id}
                      className="group bg-slate-900/70 backdrop-blur-xl rounded-2xl overflow-hidden border border-slate-800 shadow-xl hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] transition-all duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1"
                    >
                      <div className="relative h-40 w-full overflow-hidden bg-slate-950">
                        <img
                          src={shop.image || "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=600"}
                          alt={shop.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md text-cyan-400 border border-cyan-500/30 text-[11px] font-semibold px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow">
                          <MapPin size={11} className="text-cyan-400" />
                          {shop.city}
                        </div>
                      </div>
                      <div className="p-4 flex flex-col flex-grow justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                              {shop.name}
                            </h4>
                            <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-lg text-[11px] font-bold shrink-0">
                              <Star size={11} className="fill-emerald-400 text-emerald-400" />
                              {shop.rating || "4.9"}
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-400 mb-3 font-medium line-clamp-1">
                            {shop.shopCategory || "Fresh Seafood Hub"}
                          </p>
                        </div>
                        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                          <div className="flex items-center gap-1">
                            <Clock size={12} className="text-cyan-400" />
                            <span>20-30 mins</span>
                          </div>
                          <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                            <ShieldCheck size={12} />
                            <span>Verified</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 text-center border border-slate-800 shadow-xl max-w-md mx-auto">
                  <Store className="w-10 h-10 text-cyan-400 mx-auto mb-2 animate-pulse" />
                  <h4 className="text-sm font-bold text-white">No shops registered in {selectedLocation}</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Check back soon or create one from admin dashboard.
                  </p>
                </div>
              )}
            </section>

            {/* SUGGESTED BEST ITEMS SECTION */}
            <section>
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-cyan-400" />
                  <h3
                    ref={itemsTitleRef}
                    className="text-lg sm:text-xl font-black tracking-tight text-white"
                  >
                    Fresh Catch of the Day ({filteredItems.length})
                  </h3>
                </div>
              </div>

              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredItems.map((item) => {
                    const isItemInCart = cartitems?.some(
                      (cartItem) => (cartItem._id || cartItem.id) === (item._id || item.id)
                    );

                    const handleCartToggle = (e) => {
                      e.stopPropagation();
                      const safeData = {
                        ...item,
                        _id: item._id || item.id || `item_${Date.now()}_${Math.random()}`
                      };

                      if (isItemInCart) {
                        dispatch(removeFromCart(safeData));
                      } else {
                        dispatch(addToCart(safeData));
                      }
                    };

                    const isDry = item.category?.toLowerCase().includes("dry") || item.name?.toLowerCase().includes("dry") || item.name?.toLowerCase().includes("sukha");

                    return (
                      <div
                        key={item._id}
                        onClick={() => navigate(`/product/${item._id}`)}
                        className="group bg-slate-900/70 backdrop-blur-xl rounded-2xl overflow-hidden border border-slate-800 shadow-xl hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] transition-all duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1"
                      >
                        <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                          <img
                            src={item.image || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=600"}
                            alt={item.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                          
                          <div className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow ${
                            isDry ? 'bg-amber-500 text-slate-950' : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                          }`}>
                            {isDry ? 'Dry Special' : 'Fresh Catch 🌟'}
                          </div>

                          <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md text-cyan-400 border border-cyan-500/30 text-[11px] font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow">
                            <Tag size={11} className="text-cyan-400" />
                            {item.category || "Seafood"}
                          </div>
                        </div>

                        <div className="p-4 flex flex-col flex-grow justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-1 mb-1">
                              <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                                {item.name}
                              </h4>
                              <div className="text-cyan-400 font-extrabold text-base shrink-0 font-mono">
                                ₹{item.price}
                              </div>
                            </div>
                            <p className="text-xs text-slate-400 italic mb-3 line-clamp-2">
                              {item.description || "Cleaned thoroughly & moisture-locked for authentic coastal flavor!"}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-medium">
                            <div className="flex items-center gap-1 text-slate-400">
                              <Clock size={12} className="text-cyan-400" />
                              <span>30m Express</span>
                            </div>
                            
                            <button 
                              type="button"
                              onClick={handleCartToggle}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow-md cursor-pointer transition-all duration-200
                                ${isItemInCart 
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white' 
                                  : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500 hover:text-slate-950' 
                                }
                              `}
                            >
                              {isItemInCart ? "Remove" : "+ Add to Cart"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-8 text-center border border-slate-800 shadow-xl max-w-md mx-auto">
                  <Utensils className="w-10 h-10 text-cyan-400 mx-auto mb-2 animate-pulse" />
                  <h4 className="text-sm font-bold text-white">No seafood matching your filter</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Try searching for a different item or resetting the category filter.
                  </p>
                </div>
              )}
            </section>

            {/* MY RECENT ORDERS & LIVE OTP TRACKING SECTION */}
            <section ref={orderSectionRef} className="pt-2">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                    My Live Orders & Doorstep OTP Tracking
                  </h3>
                </div>
                {myOrders.length > 0 && (
                  <button
                    onClick={() => navigate('/my-orders')}
                    className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    View All Orders <ArrowRight size={12} />
                  </button>
                )}
              </div>

              {loadingOrders ? (
                <div className="text-center py-6 text-cyan-400 animate-pulse text-xs">Loading Live Orders...</div>
              ) : myOrders.length === 0 ? (
                <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 text-center border border-slate-800 shadow-xl">
                  <Package className="w-10 h-10 text-cyan-400/60 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-white">No active orders</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    When you place an order, live GPS tracking and 4-digit verification OTP will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {myOrders.slice(0, 2).map((order) => (
                    <div key={order._id} className="bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-xl p-5 space-y-3 hover:border-slate-700 transition-all">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400 font-mono">ORDER #{order._id?.slice(-6).toUpperCase()}</span>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          order.status === 'delivered' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                          order.status === 'out_for_delivery' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 animate-pulse' :
                          order.status === 'cancelled' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
                          'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="text-slate-300 text-xs flex justify-between items-center">
                        <span>Order Total:</span>
                        <span className="font-extrabold text-white text-base font-mono">₹{order.totalAmount}</span>
                      </div>

                      {/* 🔐 LIVE DELIVERY OTP DISPLAY */}
                      {order.deliveryOtp && order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <div className="bg-cyan-950/40 border border-cyan-500/40 rounded-2xl p-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Key className="w-4 h-4 text-cyan-400 shrink-0" />
                            <div>
                              <p className="text-[11px] font-bold text-cyan-200">Delivery Security OTP</p>
                              <p className="text-[10px] text-slate-400">Share with driver at arrival</p>
                            </div>
                          </div>
                          <span className="text-sm font-black font-mono text-cyan-300 tracking-widest bg-slate-900 px-3 py-1 rounded-xl border border-cyan-400 shadow-lg">
                            {order.deliveryOtp}
                          </span>
                        </div>
                      )}

                      {order.deliveryDetails?.deliveryBoyName && (
                        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-2.5 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                            {order.deliveryDetails.deliveryBoyName?.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-slate-200">{order.deliveryDetails.deliveryBoyName}</p>
                            <p className="text-[10px] text-slate-400">
                              📞 <a href={`tel:${order.deliveryDetails.deliveryBoyMobile}`} className="text-cyan-400 hover:underline">{order.deliveryDetails.deliveryBoyMobile}</a>
                            </p>
                          </div>
                        </div>
                      )}

                      {order.status === 'out_for_delivery' && (
                        <div className="mt-2 rounded-2xl overflow-hidden border border-slate-800">
                          <LiveTrackingMap 
                            orderId={order._id} 
                            deliveryAddress={order.deliveryAddress} 
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

          </main>
        </div>

      </div>

      {/* 🌊 MODERN 2026/2027 SEAFOOD FOOTER */}
      <Footer />
    </div>
  );
};

export default UserDashboard;