import React, { useRef, useState } from 'react';
import { FaLeaf, FaDrumstickBite, FaShoppingCart, FaTimes, FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, updateQuantity, removeFromCart } from '../redux/userSlice';
import gsap from 'gsap';

// ==========================================
// 1. ANIMATED CART BUTTON COMPONENT
// ==========================================
export function AnimatedCart({ onClick }) {
  const cartRef = useRef(null);
  
  const cartitems = useSelector((state) => state.user?.cartitems || []);
  const totalItemCount = cartitems.reduce((total, item) => total + (item.quantity || 1), 0);

  const handleMouseEnter = () => {
    if (window.innerWidth >= 768) {
      gsap.to(cartRef.current, { scale: 1.15, rotate: -10, duration: 0.3, ease: "power2.out" });
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth >= 768) {
      gsap.to(cartRef.current, { scale: 1, rotate: 0, duration: 0.3, ease: "power2.out" });
    }
  };

  const handleClick = (e) => {
    gsap.fromTo(
      cartRef.current,
      { scale: 0.9 },
      { scale: 1.25, duration: 0.15, yoyo: true, repeat: 1, ease: "power1.inOut" }
    );
    if (onClick) onClick(e);
  };

  return (
    <button
      ref={cartRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative flex items-center justify-center p-2.5 sm:p-3 rounded-full bg-cyan-500 text-white shadow-xl cursor-pointer outline-none transition-colors hover:bg-cyan-600"
    >
      <FaShoppingCart className="text-lg sm:text-xl" />
      {totalItemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white font-bold text-[10px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
          {totalItemCount}
        </span>
      )}
    </button>
  );
}

// ==========================================
// 2. FOOD CARD COMPONENT (MODERN UI + ANIMATIONS)
// ==========================================
export function FoodCard({ data }) {
  const cardRef = useRef(null);
  const imageRef = useRef(null);
  const dispatch = useDispatch();

  const [isAdded, setIsAdded] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  console.warn("🟡 FoodCard Render Ho Raha Hai! Data received:", data);

  if (!data) {
    console.error("❌ CRITICAL ERROR: FoodCard ko 'data' prop nahi mila!");
    return null;
  }

  const isDryFish = data.fishType === "dry";

  const handleMouseEnter = () => {
    if (window.innerWidth >= 768) {
      gsap.to(cardRef.current, { y: -8, boxShadow: "0px 20px 25px -5px rgba(0, 0, 0, 0.15)", duration: 0.3, ease: "power2.out" });
      gsap.to(imageRef.current, { scale: 1.1, duration: 0.4, ease: "power2.out" });
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth >= 768) {
      gsap.to(cardRef.current, { y: 0, boxShadow: "0px 10px 15px -3px rgba(0, 0, 0, 0.1)", duration: 0.3, ease: "power2.out" });
      gsap.to(imageRef.current, { scale: 1, duration: 0.4, ease: "power2.out" });
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    
    console.log("✅ CLICK DETECTED! Button clicked successfully!");
    
    const safeData = {
      ...data,
      _id: data._id || data.id || `item_${Date.now()}_${Math.random()}`
    };

    dispatch(addToCart(safeData));
    setIsAdded(true);

    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`w-full max-w-[250px] sm:w-[250px] rounded-2xl border-2 transition-all duration-300 ${
        isDryFish ? 'border-[#f5f5dc] bg-[#fffdd0]' : 'border-sky-400 bg-sky-50'
      } ${isRemoving ? 'pointer-events-none opacity-0 scale-90' : ''} 
      overflow-hidden flex flex-col shadow-md mx-auto`}
    >
      <div className='relative w-full h-[150px] sm:h-[170px] flex justify-center items-center overflow-hidden'>
        <div className='absolute top-3 right-3 bg-white rounded-full p-1.5 shadow z-10'>
          {data?.foodType === "veg" ? (
            <FaLeaf className='text-green-600 text-base sm:text-lg' />
          ) : (
            <FaDrumstickBite className='text-red-600 text-base sm:text-lg' />
          )}
        </div>
        <img
          ref={imageRef}
          src={data?.image}
          alt={data?.name || "Food"}
          className='w-full h-full object-cover'
        />
      </div>

      <div className="p-3 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-gray-800 truncate">{data?.name || "Delicious Fish"}</h3>
          <span className="text-[11px] sm:text-xs font-medium text-gray-500">
            {isDryFish ? "Dry Fish (Cream Theme)" : "Fresh Fish (Sky Blue Theme)"}
          </span>
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          <span className="font-bold text-cyan-600 text-sm">₹{data?.price || 299}</span>
          
          <button 
            type="button" 
            onClick={handleAddToCart}
            disabled={isAdded || isRemoving}
            className={`relative z-10 text-xs px-3 py-1.5 rounded-xl font-semibold shadow transition-all active:scale-95 cursor-pointer
              ${isAdded 
                ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                : 'bg-cyan-500 hover:bg-cyan-600 text-white'
              }
            `}
          >
            {isAdded ? (
              <span className="flex items-center gap-1">
                Added! <span className="text-sm">✅</span>
              </span>
            ) : (
              "Add to Cart"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}