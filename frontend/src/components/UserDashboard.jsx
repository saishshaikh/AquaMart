import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { gsap } from "gsap";
import { MapPin, Navigation, Star, Clock, ShieldCheck, Store, Utensils, Tag, Package, Phone } from "lucide-react";

import { categories } from "../data/Category";
import { useGetShopsByCity } from "../hooks/useGetShopsByCity"; 
import { useGetItemByCity } from "../hooks/useGetItemByCity"; 
import { addToCart, removeFromCart } from "../redux/userSlice.js"; 

// ✅ Naya Component (Live Tracking Map)
import LiveTrackingMap from "../components/LiveTrackingMap";

const UserDashboard = () => {
  // =========================
  // Refs
  // =========================
  const dashboardRef = useRef(null);
  const titleRef = useRef(null);
  const categoryRef = useRef(null);
  const shopTitleRef = useRef(null);
  const shopsGridRef = useRef(null);
  const itemsTitleRef = useRef(null);
  const orderSectionRef = useRef(null);

  // =========================
  // Redux & State
  // =========================
  const dispatch = useDispatch();
  const { city, address, shops, items, cartitems, userData } = useSelector((state) => state.user);

  // ✅ MY ORDERS STATE
  const [myOrders, setMyOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState(
    city || localStorage.getItem("userLocation") || "Bhiwandi"
  );

  const [currentAddress, setCurrentAddress] = useState(
    address || localStorage.getItem("userAddress") || ""
  );

  useGetShopsByCity(selectedLocation);
  useGetItemByCity(selectedLocation);

  // ✅ FETCH MY ORDERS (Delivery Boy Info ke saath)
  const fetchMyOrders = async () => {
    if (!userData?._id) return;
    setLoadingOrders(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${serverUrl}/api/order/get-user-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        setMyOrders(response.data.orders || []);
      }
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (userData?._id) {
      fetchMyOrders();
    }
  }, [userData?._id]);

  // Sync Redux state and localStorage
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

  useEffect(() => {
    const checkUserAndStorage = () => {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          if (parsedUser?.city) {
            setSelectedLocation(parsedUser.city);
            localStorage.setItem("userLocation", parsedUser.city);
          }
        } catch (e) {
          console.error(e);
        }
      }

      const currentLoc = localStorage.getItem("userLocation");
      if (currentLoc) setSelectedLocation(currentLoc);

      const savedAddr = localStorage.getItem("userAddress");
      if (savedAddr) setCurrentAddress(savedAddr);
    };

    checkUserAndStorage();

    window.addEventListener("storage", checkUserAndStorage);
    window.addEventListener("locationChange", checkUserAndStorage);

    return () => {
      window.removeEventListener("storage", checkUserAndStorage);
      window.removeEventListener("locationChange", checkUserAndStorage);
    };
  }, []);

  // =========================
  // GSAP Animation
  // =========================
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (titleRef.current) {
        tl.fromTo(titleRef.current, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 });
      }

      if (shopTitleRef.current) {
        tl.fromTo(shopTitleRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=0.4");
      }

      // Orders section animation
      if (orderSectionRef.current) {
        tl.fromTo(orderSectionRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=0.4");
      }
    }, dashboardRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={dashboardRef}
      className="relative min-h-screen overflow-hidden bg-slate-50 px-5 py-10 sm:px-8 lg:px-12"
    >
      <div className="pointer-events-none fixed -right-32 -top-32 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-32 -left-32 h-96 w-96 rounded-full bg-blue-300/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        
        {/* LIVE DETECTED ADDRESS BAR */}
        {currentAddress && (
          <div className="mb-6 flex items-center gap-2.5 bg-cyan-500/10 border border-cyan-500/20 px-4 py-2.5 rounded-2xl w-fit backdrop-blur-md">
            <Navigation className="w-4 h-4 text-cyan-600 animate-pulse shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-slate-700 tracking-wide">
              Live Location: <span className="text-cyan-800 font-bold">{currentAddress}</span>
            </span>
          </div>
        )}

        {/* CATEGORIES HEADER */}
        <div className="mb-6">
          <h2
            ref={titleRef}
            className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl"
          >
            Inspiration for your first order
          </h2>
        </div>

        {/* CATEGORIES SECTION */}
        <section className="mb-12">
          <div
            ref={categoryRef}
            className="flex gap-6 overflow-x-auto pb-4 pt-2 no-scrollbar scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {categories.map((item, index) => (
              <div 
                key={`${item.category}-${index}`}
                className="flex flex-col items-center gap-3 cursor-pointer flex-shrink-0 text-center group"
              >
                <div className="h-24 w-24 sm:h-28 sm:w-28 overflow-hidden rounded-full border-2 border-slate-200 bg-white shadow-md transition-all duration-300 group-hover:scale-105 group-hover:border-cyan-500 group-hover:shadow-xl">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.category}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl">
                      🦐
                    </div>
                  )}
                </div>
                <span className="text-sm font-bold text-slate-700 transition-colors group-hover:text-cyan-600">
                  {item.category}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* SHOPS SECTION */}
        <div className="mt-8 mb-6 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-cyan-600" />
          <h3
            ref={shopTitleRef}
            className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl"
          >
            Best Shop in <span className="text-cyan-600">{selectedLocation}</span>
          </h3>
        </div>

        {shops && shops.length > 0 ? (
          <div 
            ref={shopsGridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {shops.map((shop) => (
              <div
                key={shop._id}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1.5"
              >
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={shop.image || "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=600"}
                    alt={shop.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md text-slate-800 text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow">
                    <MapPin size={12} className="text-cyan-600" />
                    {shop.city}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-grow justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h4 className="text-base font-bold text-slate-800 group-hover:text-cyan-600 transition-colors line-clamp-1">
                        {shop.name}
                      </h4>
                      <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg text-xs font-bold shrink-0">
                        <Star size={12} className="fill-emerald-500 text-emerald-500" />
                        {shop.rating || "4.5"}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-3 font-medium">
                      {shop.shopCategory || "Fresh Seafood"}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-1">
                      <Clock size={13} className="text-cyan-600" />
                      <span>20-30 mins</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <ShieldCheck size={13} />
                      <span>Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-sm max-w-md mx-auto mb-16">
            <Store className="w-12 h-12 text-cyan-600 mx-auto mb-3 animate-bounce" />
            <h4 className="text-base font-bold text-slate-800">No shops found in {selectedLocation}</h4>
            <p className="text-xs text-slate-500 mt-1">
              Currently there are no registered shops in this city. Create one from the admin panel!
            </p>
          </div>
        )}

        {/* ================================================= */}
        {/* ✅ SUGGESTED BEST ITEMS SECTION (ADD/REMOVE BUTTON) */}
        {/* ================================================= */}
        <div className="mt-12 mb-6 flex items-center gap-2">
          <Utensils className="w-6 h-6 text-cyan-600" />
          <h3
            ref={itemsTitleRef}
            className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl"
          >
            Suggested Best Items in <span className="text-cyan-600">{selectedLocation}</span>
          </h3>
        </div>

        {items && items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) => {
              
              // ✅ Check karo ki ye item cart mein hai ya nahi
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
                  console.log("🔴 Removing Item from Cart:", safeData);
                  dispatch(removeFromCart(safeData));
                } else {
                  console.log("🟢 Adding Item to Cart:", safeData);
                  dispatch(addToCart(safeData));
                }
              };

              return (
                <div
                  key={item._id}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1.5"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={item.image || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=600"}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-80" />
                    <div className="absolute top-3 right-3 bg-cyan-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                      Best Catch 🌟
                    </div>
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md text-slate-800 text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow">
                      <Tag size={12} className="text-cyan-600" />
                      {item.category || "Seafood"}
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-grow justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <h4 className="text-base font-bold text-slate-800 group-hover:text-cyan-600 transition-colors line-clamp-1">
                          {item.name}
                        </h4>
                        <div className="text-cyan-700 font-extrabold text-sm shrink-0">
                          ₹{item.price}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 italic mb-3">
                        "Freshly caught, premium quality straight to your kitchen!"
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                      <div className="flex items-center gap-1 text-slate-500">
                        <Clock size={13} className="text-cyan-600" />
                        <span>Express Delivery</span>
                      </div>
                      
                      {/* ✅ TOGGLE BUTTON (Add / Remove) */}
                      <button 
                        type="button"
                        onClick={handleCartToggle}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm cursor-pointer transition-colors
                          ${isItemInCart 
                            ? 'bg-red-50 text-red-700 hover:bg-red-600 hover:text-white' 
                            : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-600 hover:text-white' 
                          }
                        `}
                      >
                        {isItemInCart ? "Remove" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-sm max-w-md mx-auto">
            <Utensils className="w-12 h-12 text-cyan-600 mx-auto mb-3 animate-bounce" />
            <h4 className="text-base font-bold text-slate-800">No items available in {selectedLocation}</h4>
            <p className="text-xs text-slate-500 mt-1">
              No items are currently listed for this city. Check back later or add items from admin panel!
            </p>
          </div>
        )}

        {/* ================================================= */}
        {/* ✅ MY ORDERS SECTION (Delivery Boy Info + Live Tracking) */}
        {/* ================================================= */}
        <div ref={orderSectionRef} className="mt-16">
          <div className="mb-6 flex items-center gap-2">
            <Package className="w-6 h-6 text-cyan-600" />
            <h3 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              My Recent Orders
            </h3>
          </div>

          {loadingOrders ? (
            <div className="text-center py-8 text-cyan-600 animate-pulse">Loading Orders...</div>
          ) : myOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-sm max-w-md mx-auto">
              <Package className="w-12 h-12 text-cyan-600 mx-auto mb-3 animate-bounce" />
              <h4 className="text-base font-bold text-slate-800">No orders yet</h4>
              <p className="text-xs text-slate-500 mt-1">
                When you place an order, you can track it here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {myOrders.map((order) => (
                <div key={order._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-slate-500">#{order._id?.slice(-6).toUpperCase()}</span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                      order.status === 'out_for_delivery' ? 'bg-orange-50 text-orange-700' :
                      order.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                      'bg-cyan-50 text-cyan-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="text-slate-600 text-sm mb-2">
                    <span className="font-bold">Total: </span>₹{order.totalAmount}
                  </div>

                  {/* 🚚 DELIVERY BOY INFO */}
                  {order.deliveryDetails?.deliveryBoyName && (
                    <div className="bg-slate-50 rounded-xl p-3 mb-2 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        {order.deliveryDetails.deliveryBoyName?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-700">{order.deliveryDetails.deliveryBoyName}</p>
                        <p className="text-[10px] text-slate-500">
                          📞 <a href={`tel:${order.deliveryDetails.deliveryBoyMobile}`} className="text-cyan-600">{order.deliveryDetails.deliveryBoyMobile}</a>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 🗺️ LIVE TRACKING MAP */}
                  {order.status === 'out_for_delivery' && (
                    <LiveTrackingMap 
                      orderId={order._id} 
                      deliveryAddress={order.deliveryAddress} 
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

// ✅ YEH LAST LINE BOHOT ZAROORI HAI (ERROR FIX)
export default UserDashboard;