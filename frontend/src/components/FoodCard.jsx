import React, { useRef } from 'react';
import { FaLeaf, FaDrumstickBite, FaShoppingCart } from 'react-icons/fa';
import gsap from 'gsap';

// 1. Animated Cart Component (Fully Responsive)
export function AnimatedCart({ itemCount = 0, onClick }) {
  const cartRef = useRef(null);

  const handleMouseEnter = () => {
    // Mobile pe hover kaam nahi karta, isliye yeh sirf tablets/desktops par chalega
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
      className="relative flex items-center justify-center p-2.5 sm:p-3 rounded-full bg-[#ff4d2d] text-white shadow-xl cursor-pointer outline-none tap-highlight-transparent"
    >
      <FaShoppingCart className="text-lg sm:text-xl" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-white text-[#ff4d2d] font-bold text-[10px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
          {itemCount}
        </span>
      )}
    </button>
  );
}


// 2. Food Card Component (Responsive width & theme based on Fish Type)
export function FoodCard({ data }) {
  const cardRef = useRef(null);
  const imageRef = useRef(null);

  const isDryFish = data?.fishType === "dry";

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

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      // w-full max-w-[250px] lagane se yeh mobile par screen ke hisab se adjust hoga aur bada hone par 250px rahega
      className={`w-full max-w-[250px] sm:w-[250px] rounded-2xl border-2 ${
        isDryFish ? 'border-[#f5f5dc] bg-[#fffdd0]' : 'border-sky-400 bg-sky-50'
      } overflow-hidden flex flex-col cursor-pointer shadow-md transition-all duration-300 mx-auto`}
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

      <div className="p-3">
        <h3 className="font-bold text-sm sm:text-base text-gray-800 truncate">{data?.name || "Delicious Fish"}</h3>
        <span className="text-[11px] sm:text-xs font-medium text-gray-500">
          {isDryFish ? "Dry Fish (Cream Theme)" : "Fresh Fish (Sky Blue Theme)"}
        </span>
      </div>
    </div>
  );
}