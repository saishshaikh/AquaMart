import React, { useRef, useState } from 'react';
import { FaLeaf, FaDrumstickBite, FaShoppingCart, FaTimes, FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
      className="relative flex items-center justify-center p-2.5 sm:p-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/30 cursor-pointer outline-none transition-colors hover:from-cyan-400 hover:to-blue-500"
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
// 2. FOOD CARD COMPONENT (DARK OCEAN THEME)
// ==========================================
export function FoodCard({ data }) {
  const cardRef = useRef(null);
  const imageRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isAdded, setIsAdded] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  if (!data) {
    return null;
  }

  const handleMouseEnter = () => {
    if (window.innerWidth >= 768) {
      gsap.to(cardRef.current, { y: -8, duration: 0.3, ease: "power2.out" });
      gsap.to(imageRef.current, { scale: 1.1, duration: 0.4, ease: "power2.out" });
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth >= 768) {
      gsap.to(cardRef.current, { y: 0, duration: 0.3, ease: "power2.out" });
      gsap.to(imageRef.current, { scale: 1, duration: 0.4, ease: "power2.out" });
    }
  };

  const handleCardClick = () => {
    if (data._id || data.id) {
      navigate(`/product/${data._id || data.id}`);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    
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
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`w-full max-w-[250px] sm:w-[250px] rounded-2xl border transition-all duration-300 cursor-pointer
        border-cyan-500/20 bg-slate-900/70 backdrop-blur-xl
        ${isRemoving ? 'pointer-events-none opacity-0 scale-90' : ''} 
        overflow-hidden flex flex-col shadow-lg shadow-black/30 hover:border-cyan-500/50 hover:shadow-cyan-500/10 mx-auto`}
    >
      {/* Image Section */}
      <div className='relative w-full h-[150px] sm:h-[170px] flex justify-center items-center overflow-hidden bg-slate-950'>
        {/* Food Type Badge */}
        <div className='absolute top-3 right-3 rounded-full p-1.5 shadow-lg z-10 bg-slate-900/80 backdrop-blur-md border border-white/10'>
          {data?.foodType === "veg" ? (
            <FaLeaf className='text-emerald-400 text-sm sm:text-base' />
          ) : (
            <FaDrumstickBite className='text-rose-400 text-sm sm:text-base' />
          )}
        </div>

        {/* Category Badge */}
        {data?.category && (
          <div className="absolute top-3 left-3 bg-cyan-500/20 backdrop-blur-md text-cyan-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-cyan-500/30 z-10 uppercase tracking-wider">
            {data.category}
          </div>
        )}

        <img
          ref={imageRef}
          src={data?.image}
          alt={data?.name || "Fish"}
          className='w-full h-full object-cover'
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1544551763-46a8e13571d8?w=400&h=300&fit=crop";
          }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
      </div>

      {/* Details Section */}
      <div className="p-3.5 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-white truncate">{data?.name || "Fresh Catch"}</h3>
          <span className="text-[11px] sm:text-xs font-medium text-slate-400 line-clamp-1">
            {data?.description || "Premium quality seafood"}
          </span>
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          {/* Price Section */}
          <div className="flex flex-col">
            <span className="font-bold text-cyan-400 text-base sm:text-lg">₹{data?.price || 299}</span>
            <span className="text-[10px] text-slate-500">per kg</span>
          </div>
          
          {/* Add to Cart Button */}
          <button 
            type="button" 
            onClick={handleAddToCart}
            disabled={isAdded || isRemoving}
            className={`relative z-10 text-xs px-3.5 py-2 rounded-xl font-semibold shadow-lg transition-all active:scale-95 cursor-pointer
              ${isAdded 
                ? 'bg-emerald-500 text-white shadow-emerald-500/30' 
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/30'
              }
            `}
          >
            {isAdded ? (
              <span className="flex items-center gap-1">
                Added! <span className="text-sm">✓</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <FaShoppingCart className="text-[10px]" /> Add
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}