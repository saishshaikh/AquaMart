import React, { useRef } from "react";
import { gsap } from "gsap";

const CategoryCard = ({ category, image, index }) => {
  const cardRef = useRef(null);
  const imageRef = useRef(null);

  const handleMouseEnter = () => {
    gsap.to(cardRef.current, {
      y: -10,
      scale: 1.03,
      duration: 0.35,
      ease: "power3.out",
    });

    gsap.to(imageRef.current, {
      scale: 1.12,
      duration: 0.5,
      ease: "power3.out",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      y: 0,
      scale: 1,
      duration: 0.35,
      ease: "power3.out",
    });

    gsap.to(imageRef.current, {
      scale: 1,
      duration: 0.5,
      ease: "power3.out",
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white shadow-lg shadow-slate-200/60"
      style={{ opacity: 0 }}
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          ref={imageRef}
          src={image}
          alt={category}
          className="h-full w-full object-cover"
        />

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Number */}
        <div className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white backdrop-blur-md">
          {String(index + 1).padStart(2, "0")}
        </div>

        {/* Category name on image */}
        <div className="absolute bottom-5 left-5 right-5">
          <h3 className="text-xl font-bold text-white drop-shadow-lg">
            {category}
          </h3>
        </div>
      </div>

      {/* Bottom content */}
      <div className="flex items-center justify-between p-5">
        <span className="text-sm font-medium text-slate-500">
          Explore category
        </span>

        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-50 text-cyan-600 transition-colors duration-300 group-hover:bg-cyan-500 group-hover:text-white">
          →
        </span>
      </div>

      {/* Hover border */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl border border-transparent transition-colors duration-300 group-hover:border-cyan-400" />
    </div>
  );
};

export default CategoryCard;