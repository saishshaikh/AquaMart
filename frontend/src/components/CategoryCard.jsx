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
      className="group relative cursor-pointer overflow-hidden rounded-3xl bg-slate-900/70 backdrop-blur-xl shadow-lg shadow-black/30 border border-cyan-500/20 hover:border-cyan-500/50 transition-colors duration-300"
      style={{ opacity: 0 }}
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          ref={imageRef}
          src={image}
          alt={category}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1544551763-46a8e13571d8?w=800&h=400&fit=crop";
          }}
        />

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

        {/* Number Badge */}
        <div className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-bold text-white backdrop-blur-md border border-cyan-400/30">
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
      <div className="flex items-center justify-between p-5 bg-slate-900/50">
        <span className="text-sm font-medium text-slate-400 group-hover:text-cyan-400 transition-colors">
          Explore category
        </span>

        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-cyan-500 group-hover:to-blue-600 group-hover:text-white group-hover:border-transparent group-hover:shadow-lg group-hover:shadow-cyan-500/30">
          →
        </span>
      </div>

      {/* Hover border glow */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl border border-transparent transition-colors duration-300 group-hover:border-cyan-400/40 group-hover:shadow-[inset_0_0_30px_rgba(6,182,212,0.05)]" />
    </div>
  );
};

export default CategoryCard;