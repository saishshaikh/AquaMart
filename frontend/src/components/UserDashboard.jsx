import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  MapPin, Navigation, Star, Clock, ShieldCheck, Store, Utensils, 
  Tag, Package, Phone, Sparkles, Key, CheckCircle, Search, Flame, 
  ArrowRight, Copy, Check, Filter, Zap, ShoppingCart, ChevronRight,
  BookOpen, Waves, ChefHat, Headphones, Truck, Radio, CheckCircle2, 
  ChevronDown, ChevronUp, HelpCircle, Send, Home as HomeIcon, Grid, 
  Mail, Menu, X, Info, MessageSquare, ThermometerSnowflake, Bot,
  Sun, Moon, Compass, Bell
} from "lucide-react";
import axios from "axios";
import { serverUrl } from "../App";

import { categories } from "../data/Category";
import { useGetShopsByCity } from "../hooks/useGetShopsByCity"; 
import { useGetItemByCity } from "../hooks/useGetItemByCity"; 
import { addToCart, removeFromCart, toggleTheme } from "../redux/userSlice.js"; 
import LiveTrackingMap from "../components/LiveTrackingMap";
import Footer from "../components/Footer";
import { 
  isPushNotificationSupported, 
  getCurrentPushSubscription, 
  subscribeUserToPush, 
  unsubscribeUserFromPush 
} from "../utils/pushNotification";

// 🌟 DETAILED SEAFOOD CATEGORY KNOWLEDGE & SPOTLIGHT INFO
const categoryDetails = {
  "All": {
    name: "All Fresh & Sun-Cured Seafood",
    marathiName: "सर्व ताजे व सुके मासे",
    tagline: "Direct Dock Sourcing • 100% Chemical & Formalin Free",
    desc: "Explore the complete marketplace of morning ocean catches, live shellfish, and authentic sun-cured dry fish directly from certified local vendors.",
    chefTip: "Always rinse fresh catch under ice-cold water. For dry fish, soak in lukewarm water for 5 minutes before shallow frying with crushed garlic.",
    nutrition: "High Protein • Rich in Omega-3 EPA/DHA • Zero Added Preservatives",
    shelfLife: "Fresh Fish: 48 Hrs (0-4°C) | Dry Fish: 6 Months (Airtight)",
    bestDishes: ["Malvani Fish Curry", "Crispy Bombil Fry", "Butter Garlic Prawns", "Crab Masala"],
    colorDark: "from-cyan-500/20 via-slate-900/90 to-blue-600/20",
    colorLight: "from-cyan-50 via-white to-blue-50",
    borderDark: "border-cyan-500/40",
    borderLight: "border-cyan-300",
    accent: "text-cyan-500",
    badge: "🌊 ALL MARKETPLACE CATALOG"
  },
  "Dry Fish": {
    name: "Sun-Cured Traditional Dry Fish",
    marathiName: "पारंपरिक सुका मासा (Bombil, Jawla, Kardi)",
    tagline: "Naturally Sun-Dried • Pure Sea Salt • Coastal Specialty",
    desc: "Sun-dried along Maharashtra and Goa coastlines using pure sea salt. Packed with intense coastal flavor, calcium, and zero chemical preservatives.",
    chefTip: "Pan roast with onion, green chilies, garlic, and freshly ground red chili powder. Pair with warm rice bhakri or dal for the ultimate comfort meal.",
    nutrition: "High Protein (62g/100g) • High Natural Calcium • Low Fat",
    shelfLife: "6 Months in an airtight container at dry room temperature",
    bestDishes: ["Crispy Bombil Rava Fry", "Jawla & Onion Sukha", "Kardi Chutney", "Tarli Coconut Curry"],
    colorDark: "from-amber-500/20 via-slate-900/90 to-orange-600/20",
    colorLight: "from-amber-50 via-white to-orange-50",
    borderDark: "border-amber-500/40",
    borderLight: "border-amber-300",
    accent: "text-amber-500",
    badge: "🔥 100% SUN-CURED ORGANIC"
  },
  "Prawns": {
    name: "Wild Sea & Estuary Prawns",
    marathiName: "ताजी मोठी कोळंबी (Tiger & White Prawns)",
    tagline: "De-veined & Peeled • Sweet Succulent Taste",
    desc: "Wild ocean and creek prawns caught daily. Juicy, tender meat with zero shrinkage when cooked gently. Available with whole head or peeled tail-on.",
    chefTip: "Do not overcook! Sauté on medium-high heat for only 3 to 4 minutes until pink and lightly curled to preserve natural sweet juiciness.",
    nutrition: "Rich in Selenium, Zinc & Vitamin B12 • Lean Protein • Low Calorie",
    shelfLife: "48 Hours in 0-4°C refrigerator or up to 30 days frozen (-18°C)",
    bestDishes: ["Garlic Butter Prawns", "Koliwada Crispy Prawns", "Malvani Prawns Masala", "Prawns Biryani"],
    colorDark: "from-emerald-500/20 via-slate-900/90 to-teal-600/20",
    colorLight: "from-emerald-50 via-white to-teal-50",
    borderDark: "border-emerald-500/40",
    borderLight: "border-emerald-300",
    accent: "text-emerald-500",
    badge: "🦐 JUMBO TIGER & SEA VARIETIES"
  },
  "Crabs": {
    name: "Live Sea & Mangrove Mud Crabs",
    marathiName: "जिवंत चिंबोरी व खेकडे (Live Mud Crabs)",
    tagline: "Live Packed in Chill Packs • Dense Sweet Claw Meat",
    desc: "Sea crabs and mangrove mud crabs packed live in moisture-locked chill containers to guarantee maximum freshness and rich succulent claw meat.",
    chefTip: "Crack the main claws gently with a pestle before simmering in curry so the rich roasted coconut and black pepper masala seeps deep inside.",
    nutrition: "High in Omega-3, Phosphorus & Natural Copper • Immunity Booster",
    shelfLife: "Prepare fresh within 24 hours of doorstep delivery",
    bestDishes: ["Chettinad Crab Curry", "Crab Roast Masala", "Butter Pepper Crab", "Konkani Chimbori Rassa"],
    colorDark: "from-rose-500/20 via-slate-900/90 to-red-600/20",
    colorLight: "from-rose-50 via-white to-red-50",
    borderDark: "border-rose-500/40",
    borderLight: "border-rose-300",
    accent: "text-rose-500",
    badge: "🦀 LIVE CHILL-PACKED HARVEST"
  },
  "Fresh Fish": {
    name: "Morning Harbor Ocean Fresh Catch",
    marathiName: "ताजा समुद्र मासा (Surmai, Pomfret, Rawas)",
    tagline: "Ozone-Washed • Precision Sliced • 0-4°C Chill Packed",
    desc: "Caught at dawn, immediately chilled, de-scaled, and precision-sliced. No formalin, no synthetic ice glaze — 100% pure taste of the ocean.",
    chefTip: "Marinate with lemon/kokum, turmeric, ginger-garlic paste, and coarse rava (semolina) crust for restaurant-style crispy tawa fry.",
    nutrition: "Rich in EPA/DHA Omega-3 Fatty Acids • Heart Health • Lean Muscle Fuel",
    shelfLife: "Cook within 48 hours for best flavor and texture",
    bestDishes: ["Surmai Rava Tawa Fry", "Silver Pomfret Curry", "Rawas Fish Tikka", "Bangda Fry"],
    colorDark: "from-blue-500/20 via-slate-900/90 to-cyan-600/20",
    colorLight: "from-blue-50 via-white to-cyan-50",
    borderDark: "border-blue-500/40",
    borderLight: "border-blue-300",
    accent: "text-blue-500",
    badge: "🐟 DOCK FRESH MORNING HAUL"
  },
  "Lobsters": {
    name: "Exotic Coastal Rock & Spiny Lobsters",
    marathiName: "समुद्री लॉबस्टर (Gourmet Shellfish)",
    tagline: "Ocean Gourmet Delicacy • Plump Juicy Tail Meat",
    desc: "Wild rock and spiny lobsters sourced from deep rocky reefs. A luxury dining experience brought straight to your home kitchen.",
    chefTip: "Split the tail lengthwise down the middle, brush generously with garlic parsley butter, and grill on high heat for 6-8 minutes.",
    nutrition: "Pure Lean Protein • High in Vitamin B12, Copper and Zinc",
    shelfLife: "Cook within 24 hours of arrival",
    bestDishes: ["Herb Butter Grilled Lobster", "Lobster Thermidor", "Spicy Tawa Roast Lobster"],
    colorDark: "from-purple-500/20 via-slate-900/90 to-indigo-600/20",
    colorLight: "from-purple-50 via-white to-indigo-50",
    borderDark: "border-purple-500/40",
    borderLight: "border-purple-300",
    accent: "text-purple-500",
    badge: "🦞 GOURMET OCEAN CATCH"
  },
  "Oysters": {
    name: "Fresh Coastal Oysters & Clams",
    marathiName: "ताजे शिंपले व कालवं (Oysters & Tisrya)",
    tagline: "Naturally Harvested • Shucked & Cleaned • Briny Flavor",
    desc: "Fresh tidal oysters and clams hand-harvested from clean coastal estuaries. Rich in minerals and distinct oceanic sweetness.",
    chefTip: "Steam for 3 to 5 minutes until shells pop open gently, or toss with caramelized shallots, green chilies, and freshly grated coconut.",
    nutrition: "Highest Dietary Source of Zinc • Iron & Vitamin B12 Rich",
    shelfLife: "Cook fresh within 24 hours of delivery",
    bestDishes: ["Tisrya Masala Sukha", "Garlic Butter Steamed Oysters", "Oyster Fry with Kokum"],
    colorDark: "from-teal-500/20 via-slate-900/90 to-emerald-600/20",
    colorLight: "from-teal-50 via-white to-emerald-50",
    borderDark: "border-teal-500/40",
    borderLight: "border-teal-300",
    accent: "text-teal-500",
    badge: "🦪 TIDAL HARVEST SHUCKED"
  }
};

const UserDashboard = ({ defaultSection = "home" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { city, address, shops, items, cartitems, userData, theme } = useSelector((state) => state.user);

  const isLight = theme === "light";

  // Active Main Section State: 'home', 'products', 'delivery', 'contact', 'about', 'faq'
  const [activeSection, setActiveSection] = useState(defaultSection);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const path = location.pathname.replace("/", "");
    if (["home", "products", "delivery", "contact", "about", "faq"].includes(path)) {
      setActiveSection(path);
    } else if (defaultSection) {
      setActiveSection(defaultSection);
    }
  }, [location.pathname, defaultSection]);

  const switchSection = (sectionName) => {
    setActiveSection(sectionName);
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [myOrders, setMyOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchFilter, setSearchFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [notifiedCategories, setNotifiedCategories] = useState({});
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // In-Page AI Prompt Query State
  const [aiInPageQuery, setAiInPageQuery] = useState("");

  const triggerAquaBotQuery = (queryText) => {
    const event = new CustomEvent("open-aquabot", { detail: { query: queryText } });
    window.dispatchEvent(event);
  };

  // Contact form state
  const [contactForm, setContactForm] = useState({ name: "", emailPhone: "", subject: "General Inquiry", message: "" });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // 🌟 8 DYNAMIC ROTATING HERO POSTERS
  const heroPosters = [
    {
      id: 1,
      tag: "🌊 DAILY MORNING HARVEST",
      title: "Wild Caught King Surmai & Silver Pomfret",
      highlight: "100% Sea Fresh • No Preservatives",
      desc: "Cleaned, sliced, and ozone-washed morning catch direct from coastal docks of Malvan & Mumbai. Chilled and delivered in 30 minutes!",
      btnText: "🐟 Explore Fresh Ocean Catch",
      filterCategory: "Fresh Fish",
      filterType: "fresh",
      badge: "FLAT 20% OFF",
      badgeColor: isLight ? "bg-cyan-100 text-cyan-800 border-cyan-300" : "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
      bgGradient: isLight ? "from-slate-100 via-white to-cyan-50" : "from-slate-950 via-slate-900 to-cyan-950",
      accentGlow: "bg-cyan-500/20",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=700"
    },
    {
      id: 2,
      tag: "🔥 TRADITIONAL SUN-CURED",
      title: "Authentic Coastal Dry Fish & Crispy Bombil",
      highlight: "Naturally Sun-Dried • Pure Sea Salt",
      desc: "Traditional sun-dried Bombay Duck (Sukha Bombil), Jawla, and Kardi prepared with zero chemical additives. Ideal for crispy tawa fry!",
      btnText: "🔥 Shop Dry Fish Specials",
      filterCategory: "Dry Fish",
      filterType: "dry",
      badge: "BUY 2 GET 10% OFF",
      badgeColor: isLight ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-amber-500/20 text-amber-300 border-amber-500/40",
      bgGradient: isLight ? "from-slate-100 via-white to-amber-50" : "from-slate-950 via-slate-900 to-amber-950",
      accentGlow: "bg-amber-500/20",
      image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=700"
    },
    {
      id: 3,
      tag: "🦀 LIVE SHELLFISH & PRAWNS",
      title: "Juicy Jumbo Tiger Prawns & Live Mud Crabs",
      highlight: "Sweet Succulent Meat • Packed Alive",
      desc: "Fresh sea jumbo prawns de-veined or whole with live sea mud crabs delivered in moisture-controlled chill packs.",
      btnText: "🦐 Order Tiger Prawns & Crabs",
      filterCategory: "Prawns",
      filterType: "all",
      badge: "CHEF'S TOP PICK ⭐",
      badgeColor: isLight ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      bgGradient: isLight ? "from-slate-100 via-white to-emerald-50" : "from-slate-950 via-slate-900 to-emerald-950",
      accentGlow: "bg-emerald-500/20",
      image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80&w=700"
    },
    {
      id: 4,
      tag: "🍲 FESTIVE CURRY COMBOS",
      title: "Dried Tarli, Bangda & Mandeli Curry Packs",
      highlight: "Head-Removed & Cleaned • Ready to Cook",
      desc: "Premium dried sardines, mackerel, and anchovies curated for authentic spicy coconut fish curries and coastal meals.",
      btnText: "🍛 View Dry Curry Combos",
      filterCategory: "Dry Fish",
      filterType: "dry",
      badge: "HOT SELLER 🔥",
      badgeColor: isLight ? "bg-rose-100 text-rose-800 border-rose-300" : "bg-rose-500/20 text-rose-300 border-rose-500/40",
      bgGradient: isLight ? "from-slate-100 via-white to-rose-50" : "from-slate-950 via-slate-900 to-rose-950",
      accentGlow: "bg-rose-500/20",
      image: "https://images.unsplash.com/photo-1535400255456-984241443b29?auto=format&fit=crop&q=80&w=700"
    },
    {
      id: 5,
      tag: "⚡ LIMITED TIME FLASH DEAL",
      title: "Weekend Seafood Bonanza • Up to 35% Off",
      highlight: "Use Code: AQUA50 at Checkout",
      desc: "Apply promo code AQUA50 to get instant flat ₹50 discounts on premium fresh catch, lobster, and dry seafood boxes over ₹300!",
      btnText: "🎁 Claim Discount Now",
      filterCategory: "All",
      filterType: "all",
      badge: "USE CODE: AQUA50",
      badgeColor: isLight ? "bg-purple-100 text-purple-800 border-purple-300" : "bg-purple-500/20 text-purple-300 border-purple-500/40",
      bgGradient: isLight ? "from-slate-100 via-white to-purple-50" : "from-slate-950 via-slate-900 to-purple-950",
      accentGlow: "bg-purple-500/20",
      image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=700"
    },
    {
      id: 6,
      tag: "🦐 COASTAL SPECIALITY",
      title: "Small Red Kardi & Golden Sun-Kissed Jawla",
      highlight: "Crispy Texture • Rich Coastal Umami",
      desc: "Small sun-cured prawns packed with calcium and protein — perfect for onion-garlic fry, spicy roasted chutney, or dal accompaniment.",
      btnText: "🦐 Browse Dried Prawns",
      filterCategory: "Dry Fish",
      filterType: "dry",
      badge: "100% ORGANIC",
      badgeColor: isLight ? "bg-yellow-100 text-yellow-800 border-yellow-300" : "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
      bgGradient: isLight ? "from-slate-100 via-white to-yellow-50" : "from-slate-950 via-slate-900 to-yellow-950",
      accentGlow: "bg-yellow-500/20",
      image: "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&q=80&w=700"
    },
    {
      id: 7,
      tag: "🚀 EXPRESS DOORSTEP DISPATCH",
      title: "Chilled & Ozone-Washed to Your Door in 30 Mins",
      highlight: "Live GPS Tracking + 4-Digit Security OTP",
      desc: "Watch your delivery partner move live on Google/OpenStreetMap with estimated ETA and seamless doorstep OTP verification.",
      btnText: "⚡ Order Fast Track Delivery",
      filterCategory: "All",
      filterType: "all",
      badge: "30-MIN EXPRESS ⚡",
      badgeColor: isLight ? "bg-blue-100 text-blue-800 border-blue-300" : "bg-blue-500/20 text-blue-300 border-blue-500/40",
      bgGradient: isLight ? "from-slate-100 via-white to-blue-50" : "from-slate-950 via-slate-900 to-blue-950",
      accentGlow: "bg-blue-500/20",
      image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&q=80&w=700"
    },
    {
      id: 8,
      tag: "🔪 CUSTOM PORTIONS & CUTS",
      title: "Steak Cuts, Boneless Fillet or Whole Dressed",
      highlight: "Zero Weight Loss • Precision Cleaned",
      desc: "Select customized weight options (250g, 500g, 1kg, 2kg) with free descaling, gutting, and hygienic vacuum sealing included.",
      btnText: "🌊 Choose Your Favorite Cut",
      filterCategory: "Fresh Fish",
      filterType: "all",
      badge: "HYGIENE CERTIFIED",
      badgeColor: isLight ? "bg-teal-100 text-teal-800 border-teal-300" : "bg-teal-500/20 text-teal-300 border-teal-500/40",
      bgGradient: isLight ? "from-slate-100 via-white to-teal-50" : "from-slate-950 via-slate-900 to-teal-950",
      accentGlow: "bg-teal-500/20",
      image: "https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&q=80&w=700"
    }
  ];

  const [currentPosterIndex, setCurrentPosterIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPosterIndex((prev) => (prev + 1) % heroPosters.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [heroPosters.length]);

  const nextPoster = () => setCurrentPosterIndex((prev) => (prev + 1) % heroPosters.length);
  const prevPoster = () => setCurrentPosterIndex((prev) => (prev - 1 + heroPosters.length) % heroPosters.length);
  const activePoster = heroPosters[currentPosterIndex];

  const selectedLocation = city || localStorage.getItem("userLocation") || "Mumbai";
  const currentAddress = address || localStorage.getItem("userAddress") || "";

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

  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [togglingPush, setTogglingPush] = useState(false);

  useEffect(() => {
    async function checkPushStatus() {
      if (isPushNotificationSupported()) {
        const sub = await getCurrentPushSubscription();
        setPushSubscribed(Boolean(sub) && Notification.permission === 'granted');
      }
    }
    checkPushStatus();
  }, []);

  const handleTogglePushNotifications = async () => {
    if (togglingPush) return;
    setTogglingPush(true);
    try {
      if (pushSubscribed) {
        await unsubscribeUserFromPush();
        setPushSubscribed(false);
      } else {
        await subscribeUserToPush();
        setPushSubscribed(true);
      }
    } catch (err) {
      console.log("Push notification toggle failed:", err.message);
    } finally {
      setTogglingPush(false);
    }
  };

  useEffect(() => {
    if (userData?._id || userData?.id) {
      fetchMyOrders();
    }
  }, [userData?._id, userData?.id]);

  const copyCouponCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2000);
  };

  const handleNotifyMe = (categoryName) => {
    setNotifiedCategories((prev) => ({ ...prev, [categoryName]: true }));
  };

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

  const activeCategoryInfo = categoryDetails[selectedCategory] || categoryDetails["All"];

  const getCategoryCount = (catName) => {
    if (!items) return 0;
    if (catName === "All") return items.length;
    return items.filter(item => item.category?.toLowerCase() === catName.toLowerCase()).length;
  };

  const activeLiveOrder = myOrders.find(o => o.status !== 'delivered' && o.status !== 'cancelled') || myOrders[0];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactForm({ name: "", emailPhone: "", subject: "General Inquiry", message: "" });
      setContactSubmitted(false);
    }, 4000);
  };

  const navMenuItems = [
    { id: "home", label: "Home", icon: HomeIcon, desc: "Highlights & Overview" },
    { id: "products", label: "Products Catalog", icon: Grid, badge: `${items?.length || 0}`, desc: "All Fresh & Dry Catch" },
    { id: "delivery", label: "Live Delivery & Map", icon: Truck, badge: myOrders.length > 0 ? `${myOrders.length}` : null, desc: "GPS & OTP Tracking" },
    { id: "about", label: "About AquaMart", icon: Info, desc: "Our Coastal Promise" },
    { id: "contact", label: "Contact Us", icon: Phone, desc: "24/7 Helpline & Desk" },
    { id: "faq", label: "FAQ & Seafood Guides", icon: HelpCircle, desc: "Cooking & Storage Care" },
  ];

  return (
    <div className={`relative min-h-screen px-3 sm:px-6 lg:px-8 py-4 sm:py-5 pb-24 sm:pb-8 transition-colors duration-300 ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#070d18] text-slate-100'
    }`}>
      {/* Background ambient lighting */}
      <div className={`pointer-events-none fixed -right-32 -top-32 h-[450px] w-[450px] rounded-full blur-[130px] ${
        isLight ? 'bg-cyan-200/40' : 'bg-cyan-500/10'
      }`} />
      <div className={`pointer-events-none fixed -bottom-32 -left-32 h-[450px] w-[450px] rounded-full blur-[130px] ${
        isLight ? 'bg-blue-200/40' : 'bg-blue-600/10'
      }`} />

      {/* MOBILE BACKDROP OVERLAY */}
      {mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      <div className="relative mx-auto max-w-[1650px] space-y-5 sm:space-y-6">

        {/* TOP STATUS BAR WITH DOCK & THEME TOGGLE */}
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-2xl border backdrop-blur-xl shadow-md transition-colors ${
          isLight ? 'bg-white/90 border-slate-200 shadow-slate-100' : 'bg-slate-900/90 border-cyan-500/30 shadow-cyan-500/5'
        }`}>
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className={`lg:hidden p-2 rounded-xl text-cyan-500 active:scale-95 transition-colors ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200' : 'bg-slate-800 hover:bg-slate-700'
                }`}
                aria-label="Toggle Sidebar Menu"
              >
                {mobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
              </button>

              <div className="flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-cyan-500 animate-pulse shrink-0" />
                <div className="text-xs sm:text-sm font-medium">
                  <span className={`hidden xs:inline ${isLight ? 'text-slate-500' : 'text-slate-300'}`}>Dock: </span>
                  <span className="text-cyan-500 font-bold">{selectedLocation}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-xl flex items-center gap-1">
                <ShieldCheck size={12} /> 30-Min Fast Track
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2.5">
            <button
              onClick={() => dispatch(toggleTheme())}
              className={`text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 border transition-all cursor-pointer ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
              }`}
            >
              {isLight ? <Moon size={13} className="text-slate-700" /> : <Sun size={13} className="text-amber-400" />}
              <span>{isLight ? "Dark Mode" : "Light Mode"}</span>
            </button>

            <button 
              onClick={() => switchSection("delivery")}
              className="text-xs font-bold text-cyan-500 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 px-3 py-1 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Radio size={13} className="text-cyan-500 animate-pulse" /> Live Radar
            </button>
          </div>
        </div>

        {/* 🌟 2-COLUMN STRUCTURED RESPONSIVE LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-7 items-start">

          {/* ==================================================== */}
          {/* 🧭 1. PROFESSIONAL MODERN LEFT SIDEBAR (3 COLS)      */}
          {/* ==================================================== */}
          <aside className={`
            lg:col-span-3 lg:sticky lg:top-24 h-auto lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto 
            rounded-3xl p-4 sm:p-5 shadow-xl space-y-5 border transition-colors
            ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/95 border-slate-800'}
            ${mobileSidebarOpen ? 'block fixed inset-x-3 top-16 z-50 max-h-[85vh] overflow-y-auto' : 'hidden lg:block'}
          `}>
            
            {/* Sidebar Brand Header */}
            <div className={`flex items-center justify-between border-b pb-3 ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                  <Utensils size={15} />
                </div>
                <div>
                  <h3 className={`text-xs sm:text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>AquaMart Portal</h3>
                  <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Coastal Seafood Hub</p>
                </div>
              </div>

              {mobileSidebarOpen && (
                <button onClick={() => setMobileSidebarOpen(false)} className="lg:hidden text-slate-400 p-1">
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Main Navigation Menu */}
            <div className="space-y-1.5">
              <p className={`text-[10px] font-bold uppercase tracking-widest pl-1 mb-1.5 ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>Navigation Menu</p>
              
              {navMenuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => switchSection(item.id)}
                    className={`w-full text-left p-2.5 sm:p-3 rounded-2xl transition-all flex items-center justify-between cursor-pointer border ${
                      isActive
                        ? isLight 
                          ? 'bg-cyan-50 text-cyan-800 border-cyan-400 font-bold shadow-sm'
                          : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/50 font-bold shadow-lg shadow-cyan-500/10'
                        : isLight
                          ? 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100'
                          : 'bg-slate-950/50 text-slate-300 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-xl ${
                        isActive 
                          ? isLight ? 'bg-cyan-500 text-white' : 'bg-cyan-500 text-slate-950' 
                          : isLight ? 'bg-slate-200 text-cyan-600' : 'bg-slate-900 text-cyan-400'
                      }`}>
                        <IconComponent size={15} />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold leading-tight">{item.label}</p>
                        <p className={`text-[10px] mt-0.5 truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{item.desc}</p>
                      </div>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold shrink-0 ml-2 ${
                        isActive 
                          ? isLight ? 'bg-cyan-500 text-white' : 'bg-cyan-500 text-slate-950' 
                          : isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-cyan-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Product Categories Sub-Menu in Sidebar */}
            <div className={`space-y-2 border-t pt-3.5 ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
              <div className="flex items-center justify-between">
                <p className={`text-[10px] font-bold uppercase tracking-widest pl-1 ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>Seafood Categories</p>
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    switchSection("products");
                  }}
                  className="text-[10px] text-cyan-500 hover:underline font-bold"
                >
                  View All
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {["All", "Dry Fish", "Fresh Fish", "Prawns", "Crabs", "Lobsters", "Oysters"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      switchSection("products");
                    }}
                    className={`text-left px-2 py-1.5 rounded-xl text-[11px] font-semibold transition-all flex items-center justify-between cursor-pointer border ${
                      selectedCategory === cat && activeSection === "products"
                        ? isLight ? 'bg-cyan-500 text-white font-bold border-cyan-500 shadow-sm' : 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md'
                        : isLight ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{cat}</span>
                    <span className="text-[10px] font-mono opacity-80">{getCategoryCount(cat)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Web Push Alerts Quick Option */}
            <div className={`p-2.5 rounded-2xl border flex items-center justify-between ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
            }`}>
              <div className="flex items-center gap-1.5">
                <Bell size={13} className={pushSubscribed ? "text-emerald-500 animate-pulse" : "text-slate-400"} />
                <span className="text-xs font-semibold">Catch & Deal Alerts</span>
              </div>
              <button
                onClick={handleTogglePushNotifications}
                disabled={togglingPush}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  pushSubscribed
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
                    : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-500 border border-cyan-500/30'
                }`}
              >
                <span>{togglingPush ? "..." : pushSubscribed ? "Active 🔔" : "Enable"}</span>
              </button>
            </div>

            {/* Theme Toggle Quick Option */}
            <div className={`p-2.5 rounded-2xl border flex items-center justify-between ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
            }`}>
              <span className="text-xs font-semibold">Theme Appearance</span>
              <button
                onClick={() => dispatch(toggleTheme())}
                className="px-2.5 py-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-500 border border-cyan-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                {isLight ? <Moon size={12} /> : <Sun size={12} />}
                <span>{isLight ? "Dark" : "Light"}</span>
              </button>
            </div>

            {/* Promo Code Box */}
            <div className={`border rounded-2xl p-3 shadow-md space-y-1.5 ${
              isLight ? 'bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200' : 'bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 border-cyan-500/40'
            }`}>
              <div className="flex items-center gap-1.5">
                <Zap size={13} className="text-amber-500 fill-amber-500" />
                <h4 className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>Flat ₹50 Coupon</h4>
              </div>
              <div className={`border border-dashed rounded-xl p-1.5 flex items-center justify-between ${
                isLight ? 'bg-white border-cyan-400' : 'bg-slate-950 border-cyan-500/50'
              }`}>
                <span className="font-mono font-black text-cyan-500 text-xs tracking-widest pl-1">
                  AQUA50
                </span>
                <button
                  onClick={() => copyCouponCode("AQUA50")}
                  className="px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-600 dark:text-cyan-300 border border-cyan-500/40 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedCoupon ? <Check size={10} /> : <Copy size={10} />}
                  {copiedCoupon ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            {/* Support Hotline Box */}
            <div className={`border-t pt-3 space-y-2 ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
              <div className={`border rounded-2xl p-2.5 flex items-center justify-between text-xs ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
              }`}>
                <div className="flex items-center gap-2">
                  <Headphones size={14} className="text-cyan-500" />
                  <div>
                    <p className={`font-bold text-[11px] ${isLight ? 'text-slate-900' : 'text-white'}`}>Toll-Free Support</p>
                    <p className="text-[10px] text-slate-500">1800-AQUAMART</p>
                  </div>
                </div>
                <a 
                  href="tel:18002782627"
                  className="px-2 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-bold"
                >
                  Call
                </a>
              </div>

              <button
                onClick={() => navigate('/cart')}
                className={`w-full py-2.5 px-3 border rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800' : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <ShoppingCart size={14} className="text-cyan-500" />
                  <span>My Cart</span>
                </span>
                <span className="bg-cyan-500 text-white dark:text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {cartitems?.length || 0} items
                </span>
              </button>
            </div>

          </aside>

          {/* ==================================================== */}
          {/* 🌊 2. DEDICATED SECTION-WISE MAIN CONTENT (9 COLS)   */}
          {/* ==================================================== */}
          <main className="lg:col-span-9 space-y-6 sm:space-y-8">

            {/* ================================================= */}
            {/* 🏠 SECTION: HOME PAGE (ONLY Clean Home Content)   */}
            {/* ================================================= */}
            {activeSection === "home" && (
              <div className="space-y-6 sm:space-y-8">
                
                {/* 1. Hero Banner Carousel */}
                <div 
                  className={`relative rounded-3xl overflow-hidden border bg-gradient-to-r ${activePoster.bgGradient} p-5 sm:p-10 shadow-xl transition-all duration-700 min-h-[340px] flex flex-col justify-between ${
                    isLight ? 'border-slate-200' : 'border-cyan-500/30'
                  }`}
                >
                  <div className={`absolute -right-10 -bottom-10 w-80 sm:w-96 h-80 sm:h-96 ${activePoster.accentGlow} rounded-full blur-3xl pointer-events-none`} />
                  
                  <div className="absolute right-0 top-0 bottom-0 w-full sm:w-1/2 opacity-25 sm:opacity-45 overflow-hidden pointer-events-none">
                    <img 
                      src={activePoster.image} 
                      alt={activePoster.title} 
                      className="w-full h-full object-cover transition-all duration-1000 transform scale-105"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-r ${
                      isLight ? 'from-white via-white/80 to-transparent' : 'from-slate-950 via-slate-950/80 to-transparent'
                    }`} />
                  </div>

                  <div className="relative z-10 max-w-2xl space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className={`inline-flex items-center gap-1.5 border px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase backdrop-blur-md shadow-sm ${
                        isLight ? 'bg-white/90 border-slate-200 text-cyan-700' : 'bg-slate-900/90 border-white/10 text-cyan-300'
                      }`}>
                        <Flame size={12} className="text-amber-500" /> {activePoster.tag}
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-sm ${activePoster.badgeColor}`}>
                        {activePoster.badge}
                      </span>
                    </div>
                    
                    <h1 className={`text-xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                      {activePoster.title}
                    </h1>

                    <p className="text-xs sm:text-sm font-semibold text-cyan-600 dark:text-cyan-300 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-cyan-500" /> {activePoster.highlight}
                    </p>

                    <p className={`text-xs sm:text-sm leading-relaxed font-normal max-w-xl ${
                      isLight ? 'text-slate-600' : 'text-slate-300'
                    }`}>
                      {activePoster.desc}
                    </p>

                    <div className="flex flex-wrap items-center gap-2.5 pt-2">
                      <button
                        onClick={() => {
                          if (activePoster.filterCategory) setSelectedCategory(activePoster.filterCategory);
                          setTypeFilter(activePoster.filterType);
                          switchSection("products");
                        }}
                        className="px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white dark:text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-lg transition-all flex items-center gap-2 cursor-pointer transform hover:scale-105"
                      >
                        {activePoster.btnText}
                        <ArrowRight size={15} />
                      </button>

                      <button
                        onClick={() => switchSection("delivery")}
                        className={`px-3.5 py-2.5 sm:px-4 sm:py-3 border font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 ${
                          isLight ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200' : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700'
                        }`}
                      >
                        <Truck size={14} className="text-cyan-500" /> Track 30-Min Delivery
                      </button>
                    </div>
                  </div>

                  {/* Carousel Controls */}
                  <div className={`relative z-10 flex items-center justify-between pt-5 mt-3 border-t ${
                    isLight ? 'border-slate-200' : 'border-white/10'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      {heroPosters.map((poster, idx) => (
                        <button
                          key={poster.id}
                          onClick={() => setCurrentPosterIndex(idx)}
                          className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                            currentPosterIndex === idx ? 'w-6 sm:w-8 bg-cyan-500 shadow-md' : isLight ? 'w-2 bg-slate-300' : 'w-2 bg-slate-700'
                          }`}
                          aria-label={`Slide ${idx + 1}`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button onClick={prevPoster} className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
                        isLight ? 'bg-white text-slate-700 border-slate-200' : 'bg-slate-900/80 text-slate-300 border-slate-700'
                      }`}>
                        ← Prev
                      </button>
                      <button onClick={nextPoster} className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
                        isLight ? 'bg-cyan-50 text-cyan-700 border-cyan-200' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      }`}>
                        Next →
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Key Highlights Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  {[
                    { icon: ShieldCheck, title: "100% Chemical-Free", desc: "No formalin or preservatives", color: "text-emerald-500" },
                    { icon: ThermometerSnowflake, title: "0°C - 4°C Cold Chain", desc: "Insulated thermal chill packs", color: "text-cyan-500" },
                    { icon: Truck, title: "30-Min Express Catch", desc: "Direct from coastal docks", color: "text-blue-500" },
                    { icon: Key, title: "4-Digit Security OTP", desc: "Verified doorstep delivery", color: "text-amber-500" },
                  ].map((hl, i) => {
                    const Icon = hl.icon;
                    return (
                      <div key={i} className={`border rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between space-y-1.5 shadow-sm transition-colors ${
                        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-800'
                      }`}>
                        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${hl.color}`} />
                        <div>
                          <h4 className={`text-xs sm:text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{hl.title}</h4>
                          <p className={`text-[10px] sm:text-[11px] leading-tight mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{hl.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 3. Category Stories Preview Carousel */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm sm:text-lg font-black flex items-center gap-1.5 sm:gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      <Sparkles size={16} className="text-cyan-500" />
                      Explore by Category
                    </h3>
                    <button onClick={() => switchSection("products")} className="text-xs font-bold text-cyan-500 hover:underline">
                      View All Catalog →
                    </button>
                  </div>

                  <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 pt-1 no-scrollbar">
                    {categories.map((cat, idx) => (
                      <div 
                        key={idx}
                        onClick={() => {
                          setSelectedCategory(cat.category);
                          switchSection("products");
                        }}
                        className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 text-center group"
                      >
                        <div className={`h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-full border-2 group-hover:border-cyan-400 shadow-md transition-all duration-300 group-hover:scale-105 ${
                          isLight ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900'
                        }`}>
                          <img src={cat.image} alt={cat.category} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <span className={`text-[11px] sm:text-xs font-bold transition-colors ${
                          isLight ? 'text-slate-700 group-hover:text-cyan-600' : 'text-slate-300 group-hover:text-cyan-400'
                        }`}>
                          {cat.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 4. Certified Seafood Shops in City (Preview) */}
                <section className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500" />
                      <h3 className={`text-sm sm:text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Certified Seafood Hubs in <span className="text-cyan-500">{selectedLocation}</span>
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                    {(shops || []).slice(0, 3).map((shop) => (
                      <div
                        key={shop._id}
                        className={`rounded-2xl overflow-hidden border p-3 sm:p-3.5 space-y-2.5 transition-all shadow-sm ${
                          isLight ? 'bg-white border-slate-200 hover:border-cyan-400' : 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/40'
                        }`}
                      >
                        <div className="h-32 sm:h-36 rounded-xl overflow-hidden relative bg-slate-950">
                          <img src={shop.image || "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=600"} alt={shop.name} className="w-full h-full object-cover" />
                          <span className="absolute bottom-2 left-2 bg-slate-950/90 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <MapPin size={10} /> {shop.city}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <h4 className={`text-xs sm:text-sm font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{shop.name}</h4>
                          <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Star size={10} className="fill-emerald-500" /> {shop.rating || "4.9"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 5. Featured Morning Catch Preview */}
                <section className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500" />
                      <h3 className={`text-sm sm:text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Today's Featured Morning Catch
                      </h3>
                    </div>
                    <button
                      onClick={() => switchSection("products")}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 bg-cyan-500 hover:bg-cyan-400 text-white dark:text-slate-950 font-bold rounded-xl text-xs transition-all shadow flex items-center gap-1"
                    >
                      View All ({items?.length || 0}) <ArrowRight size={13} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {(items || []).slice(0, 3).map((item) => {
                      const isItemInCart = cartitems?.some((ci) => (ci._id || ci.id) === (item._id || item.id));
                      return (
                        <div
                          key={item._id}
                          onClick={() => navigate(`/product/${item._id}`)}
                          className={`group rounded-2xl overflow-hidden border p-3.5 sm:p-4 space-y-3 transition-all cursor-pointer shadow-sm ${
                            isLight ? 'bg-white border-slate-200 hover:border-cyan-400' : 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/40'
                          }`}
                        >
                          <div className="h-40 sm:h-44 rounded-xl overflow-hidden relative bg-slate-950">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <span className="absolute top-2 right-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500 text-white dark:text-slate-950">
                              {item.category}
                            </span>
                          </div>
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className={`text-xs sm:text-sm font-bold group-hover:text-cyan-500 transition-colors line-clamp-1 ${
                                isLight ? 'text-slate-900' : 'text-white'
                              }`}>{item.name}</h4>
                              <span className="text-cyan-500 font-extrabold text-sm sm:text-base font-mono">₹{item.price}</span>
                            </div>
                            <p className={`text-[11px] sm:text-xs mt-1 line-clamp-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{item.description}</p>
                          </div>
                          <div className={`flex justify-between items-center pt-2 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
                            <span className={`text-[10px] sm:text-[11px] flex items-center gap-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                              <Clock size={12} className="text-cyan-500" /> 30m Express
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isItemInCart) dispatch(removeFromCart(item));
                                else dispatch(addToCart(item));
                              }}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                                isItemInCart ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' : 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500 hover:text-white'
                              }`}
                            >
                              {isItemInCart ? "Remove" : "+ Add to Cart"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Big CTA Banner to Products Section */}
                  <div className={`border rounded-3xl p-5 sm:p-6 text-center space-y-2.5 shadow-sm ${
                    isLight ? 'bg-gradient-to-r from-slate-100 via-cyan-50 to-slate-100 border-cyan-200' : 'bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border-cyan-500/30'
                  }`}>
                    <h4 className={`text-sm sm:text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Looking for more fresh ocean varieties & sun-cured dry fish?
                    </h4>
                    <p className={`text-xs max-w-lg mx-auto ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      Explore our complete catalog of Bombil, Jawla, Surmai, Tiger Prawns, Live Crabs, Lobsters and seasonal catch.
                    </p>
                    <button
                      onClick={() => switchSection("products")}
                      className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white dark:text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-md transition-all inline-flex items-center gap-2"
                    >
                      🛍️ Open Full Products Catalog ({items?.length || 0} items) <ArrowRight size={15} />
                    </button>
                  </div>
                </section>

              </div>
            )}

            {/* ================================================= */}
            {/* 🛍️ SECTION: PRODUCTS PAGE + DEDICATED AQUABOT HUB */}
            {/* ================================================= */}
            {activeSection === "products" && (
              <div className="space-y-6 sm:space-y-7">
                
                {/* 1. Category Spotlight Banner */}
                <section className={`rounded-3xl border bg-gradient-to-br ${
                  isLight ? `${activeCategoryInfo.colorLight} ${activeCategoryInfo.borderLight}` : `${activeCategoryInfo.colorDark} ${activeCategoryInfo.borderDark}`
                } p-5 sm:p-8 shadow-md relative overflow-hidden`}>
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
                    <div className="space-y-2.5 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider px-3 py-1 rounded-xl border ${
                          isLight ? 'bg-white border-slate-200 text-cyan-700' : 'bg-slate-950/80 border-white/10 text-cyan-300'
                        }`}>
                          {activeCategoryInfo.badge}
                        </span>
                        <span className={`text-xs sm:text-sm font-semibold italic ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                          {activeCategoryInfo.marathiName}
                        </span>
                      </div>

                      <h2 className={`text-lg sm:text-2xl lg:text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {activeCategoryInfo.name}
                      </h2>

                      <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                        {activeCategoryInfo.desc}
                      </p>

                      <div className={`border rounded-2xl p-3 sm:p-3.5 flex items-start gap-2.5 shadow-sm ${
                        isLight ? 'bg-white/90 border-slate-200' : 'bg-slate-950/90 border-slate-800'
                      }`}>
                        <ChefHat className={`w-4 h-4 sm:w-5 sm:h-5 ${activeCategoryInfo.accent} shrink-0 mt-0.5`} />
                        <div>
                          <p className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Chef's Culinary Secret:</p>
                          <p className={`text-[11px] sm:text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{activeCategoryInfo.chefTip}</p>
                        </div>
                      </div>
                    </div>

                    <div className={`w-full lg:w-80 border rounded-2xl p-3.5 sm:p-4 space-y-2 text-xs shrink-0 shadow-md ${
                      isLight ? 'bg-white border-slate-200' : 'bg-slate-950/95 border-slate-800'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-amber-500" />
                        <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Nutritional Facts:</span>
                      </div>
                      <p className={`text-[11px] sm:text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{activeCategoryInfo.nutrition}</p>
                      <div className={`border-t pt-2 flex items-center justify-between text-xs ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
                        <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Shelf Life:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{activeCategoryInfo.shelfLife}</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 🌟 2. DEDICATED IN-PAGE AQUABOT AI ADVISOR & RECIPE SECTION */}
                <section className={`rounded-3xl border p-4 sm:p-6 shadow-md transition-colors ${
                  isLight ? 'bg-gradient-to-r from-cyan-50 via-white to-blue-50 border-cyan-200' : 'bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border-cyan-500/30'
                }`}>
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-cyan-500 text-white flex items-center justify-center shadow-md">
                          <Bot size={18} />
                        </div>
                        <h3 className={`text-sm sm:text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          AquaBot AI Seafood Catch Advisor
                        </h3>
                      </div>
                      <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                        Unsure which cut to choose or need a 10-minute recipe? Ask our coastal AI advisor directly:
                      </p>
                    </div>

                    {/* Quick Query Pills */}
                    <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
                      {[
                        "How to fry crispy Bombil? 👨‍🍳",
                        "Show fresh Surmai prices 🐟",
                        "Prawns vs Crabs difference? 🦐",
                        "Active promo codes 🎟️"
                      ].map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => triggerAquaBotQuery(prompt)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-left ${
                            isLight 
                              ? 'bg-white hover:bg-cyan-100 text-cyan-800 border-cyan-200 shadow-sm'
                              : 'bg-slate-950/80 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                          }`}
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                {/* 3. Filters & Search Control Bar */}
                <div className={`border rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-md ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
                }`}>
                  <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
                    <div className="relative w-full sm:w-80">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-500 w-4 h-4" />
                      <input
                        type="text"
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        placeholder="Search by fish name..."
                        className={`w-full border rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:border-cyan-500 ${
                          isLight ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400' : 'bg-slate-950/80 border-slate-700 text-white placeholder:text-slate-500'
                        }`}
                      />
                    </div>

                    {/* Harvest Type Toggle */}
                    <div className={`flex items-center gap-1 p-1 rounded-xl border w-full sm:w-auto overflow-x-auto ${
                      isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
                    }`}>
                      {[
                        { label: "All Harvest", value: "all" },
                        { label: "🔥 Dry Fish", value: "dry" },
                        { label: "🐟 Fresh Ocean", value: "fresh" },
                      ].map((t) => (
                        <button
                          key={t.value}
                          onClick={() => setTypeFilter(t.value)}
                          className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all shrink-0 ${
                            typeFilter === t.value 
                              ? isLight ? 'bg-white text-cyan-800 shadow' : 'bg-cyan-500 text-slate-950 shadow' 
                              : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category Pills Bar */}
                  <div className={`flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-t pt-2.5 ${
                    isLight ? 'border-slate-100' : 'border-slate-800'
                  }`}>
                    <span className={`text-[11px] sm:text-xs font-semibold shrink-0 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Category:</span>
                    {["All", "Dry Fish", "Fresh Fish", "Prawns", "Crabs", "Lobsters", "Oysters"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-xl shrink-0 transition-all ${
                          selectedCategory === cat 
                            ? isLight ? 'bg-cyan-500 text-white shadow-sm' : 'bg-cyan-500 text-slate-950 shadow-md' 
                            : isLight ? 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200' : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {cat} ({getCategoryCount(cat)})
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Complete Products Catalog Grid */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-base sm:text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Marketplace Catch ({filteredItems.length} available)
                    </h3>
                  </div>

                  {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                      {filteredItems.map((item) => {
                        const isItemInCart = cartitems?.some((ci) => (ci._id || ci.id) === (item._id || item.id));
                        const isDry = item.category?.toLowerCase().includes("dry") || item.name?.toLowerCase().includes("dry") || item.name?.toLowerCase().includes("sukha");

                        return (
                          <div
                            key={item._id}
                            onClick={() => navigate(`/product/${item._id}`)}
                            className={`group rounded-2xl overflow-hidden border p-3.5 sm:p-4 space-y-3 transition-all cursor-pointer flex flex-col justify-between shadow-sm ${
                              isLight ? 'bg-white border-slate-200 hover:border-cyan-400' : 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/40'
                            }`}
                          >
                            <div className="h-40 sm:h-44 rounded-xl overflow-hidden relative bg-slate-950">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              <span className={`absolute top-2 right-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                isDry ? 'bg-amber-500 text-slate-950' : 'bg-cyan-500 text-white dark:text-slate-950'
                              }`}>
                                {item.category}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between items-start">
                                <h4 className={`text-xs sm:text-sm font-bold group-hover:text-cyan-500 transition-colors line-clamp-1 ${
                                  isLight ? 'text-slate-900' : 'text-white'
                                }`}>{item.name}</h4>
                                <span className="text-cyan-500 font-extrabold text-sm sm:text-base font-mono">₹{item.price}</span>
                              </div>
                              <p className={`text-[11px] sm:text-xs italic line-clamp-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{item.description}</p>
                            </div>

                            <div className={`flex justify-between items-center pt-2.5 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
                              <span className={`text-[10px] sm:text-[11px] flex items-center gap-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                <Clock size={12} className="text-cyan-500" /> 30m Express
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isItemInCart) dispatch(removeFromCart(item));
                                  else dispatch(addToCart(item));
                                }}
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                                  isItemInCart ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' : 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500 hover:text-white'
                                }`}
                              >
                                {isItemInCart ? "Remove" : "+ Add to Cart"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={`border rounded-3xl p-6 sm:p-8 text-center space-y-3 ${
                      isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
                    }`}>
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 mx-auto">
                        <Waves className="w-6 h-6 animate-pulse" />
                      </div>
                      <h4 className={`text-sm sm:text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Fresh {selectedCategory} is restocking for {selectedLocation}
                      </h4>
                      <p className={`text-xs max-w-md mx-auto ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Fishermen boats are landing next haul soon. Click below to receive instant alert when fresh stock arrives.
                      </p>
                      <button
                        onClick={() => handleNotifyMe(selectedCategory)}
                        className="px-4 py-2 bg-cyan-500 text-white dark:text-slate-950 font-bold text-xs rounded-xl shadow"
                      >
                        {notifiedCategories[selectedCategory] ? "✓ Alert Set for Next Catch" : "🔔 Notify Me on Next Catch"}
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ================================================= */}
            {/* 🚚 SECTION: DELIVERY & REAL-TIME GPS TRACKING     */}
            {/* ================================================= */}
            {activeSection === "delivery" && (
              <div className="space-y-6 sm:space-y-7">
                
                {/* Header Info */}
                <div className={`border rounded-3xl p-5 sm:p-8 space-y-2 shadow-sm ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-cyan-500/30'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-cyan-500/20 text-cyan-500 flex items-center justify-center">
                      <Truck size={18} />
                    </div>
                    <div>
                      <h2 className={`text-lg sm:text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>Live GPS Delivery & Harbor Radar</h2>
                      <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Real-time rider tracking with 4-digit doorstep security OTP</p>
                    </div>
                  </div>
                </div>

                {/* Active Order Live Tracker */}
                {activeLiveOrder ? (
                  <div className={`border rounded-3xl p-4 sm:p-7 space-y-5 shadow-xl ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-cyan-500/40'
                  }`}>
                    <div className={`flex flex-wrap items-center justify-between gap-2 border-b pb-3 ${
                      isLight ? 'border-slate-100' : 'border-slate-800'
                    }`}>
                      <div>
                        <span className={`text-[10px] sm:text-xs font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>TRACKING ORDER</span>
                        <h4 className={`text-sm sm:text-base font-black font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>#{activeLiveOrder._id?.slice(-8).toUpperCase()}</h4>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] sm:text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Order Amount</span>
                        <p className="text-base sm:text-lg font-black text-cyan-500 font-mono">₹{activeLiveOrder.totalAmount}</p>
                      </div>
                    </div>

                    {/* 4-Stage Stepper */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { step: "Order Placed", done: true, icon: CheckCircle2 },
                        { step: "Chilled & Packed", done: activeLiveOrder.status !== 'pending', icon: ThermometerSnowflake },
                        { step: "Out for Delivery", done: activeLiveOrder.status === 'out_for_delivery' || activeLiveOrder.status === 'delivered', icon: Truck },
                        { step: "Delivered", done: activeLiveOrder.status === 'delivered', icon: ShieldCheck }
                      ].map((st, i) => {
                        const Icon = st.icon;
                        return (
                          <div key={i} className={`p-2.5 rounded-2xl border text-center ${
                            st.done 
                              ? isLight ? 'bg-cyan-50 border-cyan-300 text-cyan-800 font-bold' : 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 font-bold'
                              : isLight ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-slate-950/50 border-slate-800 text-slate-500'
                          }`}>
                            <Icon size={15} className="mx-auto mb-1" />
                            <p className="text-[11px] sm:text-xs">{st.step}</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* OTP & Map Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                      <div className="space-y-3.5">
                        {/* 4-Digit Security OTP */}
                        {activeLiveOrder.deliveryOtp && activeLiveOrder.status !== 'delivered' && (
                          <div className={`border-2 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between shadow-md ${
                            isLight ? 'bg-cyan-50/80 border-cyan-400' : 'bg-gradient-to-r from-cyan-950/70 to-blue-950/70 border-cyan-400/50'
                          }`}>
                            <div className="flex items-center gap-2.5">
                              <Key className="w-5 h-5 text-cyan-500" />
                              <div>
                                <p className={`text-xs font-black uppercase ${isLight ? 'text-cyan-900' : 'text-cyan-200'}`}>Doorstep Security OTP</p>
                                <p className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Share with driver upon arrival</p>
                              </div>
                            </div>
                            <span className={`text-lg sm:text-xl font-black font-mono tracking-widest px-3.5 py-1 rounded-xl border ${
                              isLight ? 'bg-white text-cyan-700 border-cyan-400 shadow-sm' : 'bg-slate-950 text-cyan-300 border-cyan-400'
                            }`}>
                              {activeLiveOrder.deliveryOtp}
                            </span>
                          </div>
                        )}

                        {/* Driver Card */}
                        {activeLiveOrder.deliveryDetails?.deliveryBoyName ? (
                          <div className={`border rounded-2xl p-3.5 flex items-center justify-between ${
                            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
                          }`}>
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-xs">
                                {activeLiveOrder.deliveryDetails.deliveryBoyName.charAt(0)}
                              </div>
                              <div>
                                <p className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{activeLiveOrder.deliveryDetails.deliveryBoyName}</p>
                                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Assigned Delivery Partner</p>
                              </div>
                            </div>
                            <a
                              href={`tel:${activeLiveOrder.deliveryDetails.deliveryBoyMobile}`}
                              className="px-3 py-1.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1"
                            >
                              <Phone size={12} /> Call
                            </a>
                          </div>
                        ) : (
                          <div className={`border rounded-2xl p-3 text-xs flex items-center gap-2 ${
                            isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-950/60 border-slate-800 text-slate-400'
                          }`}>
                            <Clock size={13} className="text-cyan-500 animate-spin" />
                            <span>Assigning nearest delivery partner in {selectedLocation}...</span>
                          </div>
                        )}
                      </div>

                      <div className="rounded-2xl overflow-hidden border border-slate-700/50 bg-slate-950">
                        <LiveTrackingMap orderId={activeLiveOrder._id} deliveryAddress={activeLiveOrder.deliveryAddress} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`border rounded-3xl p-5 sm:p-7 space-y-4 shadow-sm ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <Radio size={18} className="text-emerald-500 animate-pulse" />
                      <h3 className={`text-sm sm:text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        30-Min Fast Track Radar Active for {selectedLocation}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className={`border rounded-2xl p-3.5 space-y-1.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'}`}>
                        <p className="font-bold text-cyan-600 dark:text-cyan-400">🛵 Live GPS Rider Fleet</p>
                        <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Riders equipped with thermal chill boxes are stationed near harbor docks.</p>
                      </div>
                      <div className={`border rounded-2xl p-3.5 space-y-1.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'}`}>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400">❄️ 0°C - 4°C Cold Packaging</p>
                        <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Seafood is kept in moisture-locked ice beds with zero temperature fluctuations.</p>
                      </div>
                      <div className={`border rounded-2xl p-3.5 space-y-1.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'}`}>
                        <p className="font-bold text-amber-600 dark:text-amber-400">🔐 OTP Secured Drop</p>
                        <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Doorstep delivery code ensures only you receive and inspect your fresh catch.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ================================================= */}
            {/* ℹ️ SECTION: ABOUT US PAGE (Dedicated About View)  */}
            {/* ================================================= */}
            {activeSection === "about" && (
              <div className="space-y-6 sm:space-y-7">
                <div className={`border rounded-3xl p-5 sm:p-9 space-y-3 shadow-sm ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-cyan-500/30'
                }`}>
                  <span className="text-[10px] sm:text-xs font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-xl border border-cyan-500/30">
                    🌊 The AquaMart Story
                  </span>
                  <h2 className={`text-xl sm:text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Direct Harbor Sourcing • 100% Zero-Formalin Seafood
                  </h2>
                  <p className={`text-xs sm:text-sm leading-relaxed max-w-3xl ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    Founded along Maharashtra's Konkan coastline, AquaMart bridges the gap between traditional coastal fishermen and modern kitchens. We cut out multiple intermediaries, guaranteeing the freshest catch at fair dock prices with laboratory-certified purity.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`border rounded-2xl p-4 space-y-2 shadow-sm ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs">
                      01
                    </div>
                    <h4 className={`text-xs sm:text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Direct Dock Procurement</h4>
                    <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Sourced fresh at 5 AM directly from jetty landing centers across Mumbai, Malvan, and Ratnagiri.
                    </p>
                  </div>

                  <div className={`border rounded-2xl p-4 space-y-2 shadow-sm ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold text-xs">
                      02
                    </div>
                    <h4 className={`text-xs sm:text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Ozone Wash & De-scaling</h4>
                    <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Hygienically cleaned and washed with purified ozone water to remove 99.9% bacteria without chemicals.
                    </p>
                  </div>

                  <div className={`border rounded-2xl p-4 space-y-2 shadow-sm ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">
                      03
                    </div>
                    <h4 className={`text-xs sm:text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Fair Fisherman Livelihood</h4>
                    <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Ensuring sustainable fishing communities and women-run self-help groups receive fair pricing.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ================================================= */}
            {/* 📞 SECTION: CONTACT US PAGE (Dedicated Contact)   */}
            {/* ================================================= */}
            {activeSection === "contact" && (
              <div className="space-y-6 sm:space-y-7">
                <div className={`border rounded-3xl p-5 sm:p-8 space-y-1.5 shadow-sm ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-cyan-500/30'
                }`}>
                  <h2 className={`text-xl sm:text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>Contact AquaMart Concierge</h2>
                  <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Our coastal harbor customer desk is available 7 days a week</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
                  <div className="lg:col-span-5 space-y-3.5">
                    <div className={`border rounded-2xl p-4 space-y-2 shadow-sm ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
                      <div className="flex items-center gap-2 text-cyan-500 font-bold text-xs sm:text-sm">
                        <Phone size={15} /> Toll-Free Helpline
                      </div>
                      <p className={`text-sm sm:text-base font-black font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>1800-AQUAMART</p>
                      <p className="text-[10px] text-slate-500">Daily 6:00 AM – 10:30 PM</p>
                    </div>

                    <div className={`border rounded-2xl p-4 space-y-2 shadow-sm ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
                      <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs sm:text-sm">
                        <MessageSquare size={15} /> WhatsApp Concierge
                      </div>
                      <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Instant assistance with morning catch updates and order tracking.</p>
                      <a 
                        href="https://wa.me/919999999999" 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        Chat on WhatsApp →
                      </a>
                    </div>

                    <div className={`border rounded-2xl p-4 space-y-2 shadow-sm ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
                      <div className="flex items-center gap-2 text-blue-500 font-bold text-xs sm:text-sm">
                        <MapPin size={15} /> Coastal Harbor Hubs
                      </div>
                      <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                        • Sassoon Docks Jetty, Colaba, Mumbai<br />
                        • Mirkarwada Coastal Harbor, Ratnagiri<br />
                        • Malvan Coastal Fishery Center, Sindhudurg
                      </p>
                    </div>
                  </div>

                  <div className={`lg:col-span-7 border rounded-3xl p-5 sm:p-7 space-y-3.5 shadow-md ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
                  }`}>
                    <h3 className={`text-sm sm:text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      <Mail size={15} className="text-cyan-500" /> Send an Inquiry or Feedback
                    </h3>

                    {contactSubmitted ? (
                      <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-2">
                        <CheckCircle size={24} className="text-emerald-500 mx-auto" />
                        <h4 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Thank you for your message!</h4>
                        <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Our customer support executive will contact you shortly.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleContactSubmit} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Your Name</label>
                            <input
                              type="text"
                              required
                              value={contactForm.name}
                              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                              placeholder="e.g. Saish Shaikh"
                              className={`w-full border rounded-xl px-3 py-2 text-xs outline-none focus:border-cyan-500 ${
                                isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Email / Phone</label>
                            <input
                              type="text"
                              required
                              value={contactForm.emailPhone}
                              onChange={(e) => setContactForm({ ...contactForm, emailPhone: e.target.value })}
                              placeholder="e.g. 9876543210"
                              className={`w-full border rounded-xl px-3 py-2 text-xs outline-none focus:border-cyan-500 ${
                                isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                              }`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Subject</label>
                          <select
                            value={contactForm.subject}
                            onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                            className={`w-full border rounded-xl px-3 py-2 text-xs outline-none focus:border-cyan-500 ${
                              isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                            }`}
                          >
                            <option value="General Inquiry">General Catch Inquiry</option>
                            <option value="Order Tracking">Order & Delivery Assistance</option>
                            <option value="Wholesale Bulk">Bulk / Restaurant Orders</option>
                            <option value="Feedback">Quality Feedback</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Your Message</label>
                          <textarea
                            rows={3}
                            required
                            value={contactForm.message}
                            onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                            placeholder="Tell us what you need help with..."
                            className={`w-full border rounded-xl px-3 py-2 text-xs outline-none focus:border-cyan-500 resize-none ${
                              isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                            }`}
                          />
                        </div>

                        <button
                          type="submit"
                          className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-white dark:text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
                        >
                          <Send size={12} /> Submit Message
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ================================================= */}
            {/* ❓ SECTION: FAQ & CULINARY GUIDES PAGE            */}
            {/* ================================================= */}
            {activeSection === "faq" && (
              <div className="space-y-6 sm:space-y-7">
                <div className={`border rounded-3xl p-5 sm:p-8 space-y-1.5 shadow-sm ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-cyan-500/30'
                }`}>
                  <h2 className={`text-xl sm:text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>Frequently Asked Questions & Seafood Guides</h2>
                  <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Everything you need to know about ordering, cleaning, cooking, and storage</p>
                </div>

                {/* FAQ Accordions */}
                <div className="space-y-2.5">
                  {[
                    {
                      q: "How does AquaMart guarantee 100% fresh, chemical-free catch?",
                      a: "Our seafood is procured directly from fishermen at jetty landing centers at 5 AM. We wash every piece in ozone-purified water and chill it at 0°C - 4°C with zero chemical preservatives or formalin."
                    },
                    {
                      q: "How does the 4-digit doorstep delivery OTP work?",
                      a: "When your order is dispatched, an encrypted 4-digit code is generated in your dashboard. You share this code with the delivery partner only after receiving and inspecting your chill-pack."
                    },
                    {
                      q: "What is the shelf life of Sun-Cured Dry Fish vs Fresh Ocean Catch?",
                      a: "Sun-cured dry fish (Bombil, Jawla, Kardi) stays perfectly fresh for 6 months in an airtight glass container at room temperature. Fresh catch should be cooked within 48 hours or frozen at -18°C."
                    },
                    {
                      q: "Can I request custom cuts (curry cut, steak fry slices, de-veined)?",
                      a: "Yes! All seafood items come precision cleaned, de-scaled, gutted, and sliced according to your selected portion preferences with zero weight reduction loss."
                    },
                    {
                      q: "What is your refund / freshness guarantee policy?",
                      a: "If you are not 100% satisfied with the quality of your catch upon doorstep arrival, our delivery partner will immediately issue a replacement or full refund."
                    }
                  ].map((faq, i) => (
                    <div key={i} className={`border rounded-2xl overflow-hidden transition-all shadow-sm ${
                      isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
                    }`}>
                      <button
                        onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                        className={`w-full p-3.5 sm:p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold hover:text-cyan-500 ${
                          isLight ? 'text-slate-800' : 'text-white'
                        }`}
                      >
                        <span>{faq.q}</span>
                        {openFaqIndex === i ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                      {openFaqIndex === i && (
                        <div className={`p-3.5 sm:p-4 pt-0 text-xs leading-relaxed border-t mt-1 ${
                          isLight ? 'text-slate-600 border-slate-100' : 'text-slate-300 border-slate-800/60'
                        }`}>
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Culinary Masterclass */}
                <div className={`border rounded-3xl p-5 sm:p-6 space-y-3.5 shadow-sm ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-800'
                }`}>
                  <h3 className={`text-sm sm:text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    <BookOpen size={15} className="text-cyan-500" /> Coastal Cooking & Care Masterclass
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className={`border rounded-2xl p-3.5 space-y-1.5 ${
                      isLight ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-950/80 border-slate-800'
                    }`}>
                      <p className="font-bold text-amber-500">🔥 Crispy Dry Fish Secret</p>
                      <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                        Wash Sukha Bombil in warm water for 2 mins, pat completely dry, then shallow fry on medium-high heat with minimal oil and crushed garlic.
                      </p>
                    </div>

                    <div className={`border rounded-2xl p-3.5 space-y-1.5 ${
                      isLight ? 'bg-cyan-50/60 border-cyan-200' : 'bg-slate-950/80 border-slate-800'
                    }`}>
                      <p className="font-bold text-cyan-500">🐟 Golden Rava Crust</p>
                      <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                        Marinate Surmai or Pomfret with Malvani masala & kokum agal for 20 mins. Coat in fine rava (semolina) mixed with rice flour for supreme crunch.
                      </p>
                    </div>

                    <div className={`border rounded-2xl p-3.5 space-y-1.5 ${
                      isLight ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-950/80 border-slate-800'
                    }`}>
                      <p className="font-bold text-emerald-500">🦐 3-Minute Juicy Prawns</p>
                      <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                        Flash-fry prawns on high heat for maximum 3-4 minutes to retain sweet natural sea juices without turning rubbery.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </main>
        </div>

      </div>

      {/* ==================================================== */}
      {/* 📱 3. SLEEK MOBILE BOTTOM NAVIGATION BAR (Phones/Tablets) */}
      {/* ==================================================== */}
      <nav aria-label="Mobile Navigation" className={`lg:hidden fixed bottom-0 inset-x-0 z-30 border-t px-3 py-2 flex items-center justify-around shadow-2xl backdrop-blur-2xl transition-colors ${
        isLight ? 'bg-white/95 border-slate-200 shadow-slate-200' : 'bg-slate-950/95 border-slate-800 shadow-black'
      }`}>
        <button
          onClick={() => switchSection("home")}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            activeSection === "home" ? 'text-cyan-500 font-bold' : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'
          }`}
        >
          <HomeIcon size={18} />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => switchSection("products")}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            activeSection === "products" ? 'text-cyan-500 font-bold' : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Grid size={18} />
          <span className="text-[10px]">Products</span>
        </button>

        <button
          onClick={() => switchSection("delivery")}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all relative ${
            activeSection === "delivery" ? 'text-cyan-500 font-bold' : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Truck size={18} />
          <span className="text-[10px]">Tracking</span>
          {myOrders.length > 0 && (
            <span className="absolute -top-0.5 right-1 w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
          )}
        </button>

        <button
          onClick={() => navigate('/cart')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all relative ${
            isLight ? 'text-slate-500 hover:text-cyan-600' : 'text-slate-400 hover:text-cyan-400'
          }`}
        >
          <ShoppingCart size={18} />
          <span className="text-[10px]">Cart</span>
          {cartitems?.length > 0 && (
            <span className="absolute -top-1 right-2 bg-cyan-500 text-white dark:text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {cartitems.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            mobileSidebarOpen ? 'text-cyan-500 font-bold' : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Menu size={18} />
          <span className="text-[10px]">Menu</span>
        </button>
      </nav>

      {/* 🌊 MODERN 2026/2027 SEAFOOD FOOTER */}
      <Footer />
    </div>
  );
};

export default UserDashboard;