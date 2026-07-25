import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import axios from "axios";
import { Link } from 'react-router-dom';
import { serverUrl } from '../App';

gsap.registerPlugin(useGSAP);

const ForgotPassword = () => {
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const introFishRef = useRef(null);

  const [email, setEmail] = useState('');
  const [ripple, setRipple] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleRippleEffect = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipple({ x, y, id: Date.now() });
    setTimeout(() => setRipple(null), 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/forgot-password`,
        { email },
        { withCredentials: true }
      );
      console.log(result.data);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Forgot password error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  useGSAP(() => {
    const tl = gsap.timeline();

    gsap.set(cardRef.current, { scale: 0.4, opacity: 0, display: 'none' });

    // 1. Fish Entry Animation
    tl.fromTo(
      introFishRef.current,
      { x: '-120vw', y: 40, scale: 0.4, rotation: 20 },
      { x: 0, y: 0, scale: 1.3, rotation: 0, duration: 0.6, ease: 'power3.out' }
    )
    .to(introFishRef.current, { 
      rotation: -12, duration: 0.12, yoyo: true, repeat: 1, ease: 'sine.inOut' 
    })
    // 2. Exploding Fish into Form Morph
    .to(introFishRef.current, {
      scale: 30, 
      opacity: 0, 
      filter: 'blur(20px)',
      duration: 0.35, 
      ease: 'power2.inOut',
      onComplete: () => {
        if (introFishRef.current) introFishRef.current.style.display = 'none';
      }
    })
    // 3. Form Pop Animation
    .set(cardRef.current, { display: 'block' }, "-=0.25")
    .fromTo(
      cardRef.current,
      { scale: 0.8, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.4)' },
      "-=0.25"
    )
    .fromTo(
      '.form-anim',
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.25, stagger: 0.03, ease: 'power2.out' },
      "-=0.15"
    );

  }, { scope: containerRef });

  return (
    <div 
      ref={containerRef} 
      onClick={handleRippleEffect}
      className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#010b1e] to-[#010409] overflow-hidden px-4 font-sans select-none"
    >
      <style>{`
        @keyframes swimSlow {
          0% { transform: translateX(-130vw) translateY(10px) rotate(5deg); }
          50% { transform: translateX(60vw) translateY(-50px) rotate(-5deg); }
          100% { transform: translateX(130vw) translateY(20px) rotate(5deg); }
        }
        @keyframes swimReverse {
          0% { transform: translateX(130vw) translateY(-20px) scaleX(-1) rotate(-5deg); }
          100% { transform: translateX(-130vw) translateY(40px) scaleX(-1) rotate(5deg); }
        }
        @keyframes floatBubble {
          0% { transform: translateY(105vh) scale(0.6); opacity: 0; }
          40% { opacity: 0.7; }
          100% { transform: translateY(-10vh) scale(1.3); opacity: 0; }
        }
        @keyframes rippleAnim {
          0% { width: 0px; height: 0px; opacity: 0.8; }
          100% { width: 600px; height: 600px; opacity: 0; }
        }
        .bg-fish-1 { animation: swimSlow 20s infinite linear; }
        .bg-fish-2 { animation: swimReverse 25s infinite linear; }
        .bubble-anim { animation: floatBubble 5s infinite ease-in; }
        .water-ripple {
          position: absolute;
          border: 2px solid rgba(6, 182, 212, 0.6);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          animation: rippleAnim 0.8s linear forwards;
        }
      `}</style>

      {ripple && (
        <div className="water-ripple z-30" style={{ left: ripple.x, top: ripple.y }} />
      )}

      {/* --- BACKGROUND ENVIRONMENT --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-400 via-transparent to-transparent animate-pulse" />

        <div className="absolute top-[25%] left-0 bg-fish-1 text-3xl opacity-70 filter drop-shadow-[0_0_12px_rgba(255,140,0,0.8)]">🐠</div>
        <div className="absolute top-[65%] right-0 bg-fish-2 text-4xl opacity-60 filter drop-shadow-[0_0_15px_rgba(0,220,255,0.8)]">🐬</div>

        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className="bubble-anim absolute rounded-full bg-cyan-300/40 border border-cyan-200/50 backdrop-blur-[1px]"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 10 + 4}px`,
              height: `${Math.random() * 10 + 4}px`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${Math.random() * 3 + 3}s`
            }}
          />
        ))}

        <div className="absolute top-0 left-1/4 w-96 h-[600px] bg-gradient-to-b from-cyan-500/10 to-transparent transform -skew-x-12 blur-3xl" />
        <div className="absolute top-0 right-1/4 w-96 h-[600px] bg-gradient-to-b from-blue-500/10 to-transparent transform skew-x-12 blur-3xl" />
      </div>

      {/* --- INTRO MORPHING FISH --- */}
      <div ref={introFishRef} className="absolute z-50 flex items-center justify-center drop-shadow-[0_0_40px_rgba(6,182,212,0.9)]">
        <svg viewBox="0 0 512 512" fill="currentColor" className="text-cyan-400 w-36 h-36 transform scale-x-[-1] animate-pulse">
            <path d="M497.9 234.1c-13.3-10.7-31.5-12.7-47-5.1-23.7 11.5-49.9 22.1-77.5 30.6-26.6-21.7-56-42.3-87.3-61.2 38.6-26.9 74.2-59.2 105.1-95.9 10.9-12.9 9.8-31.9-2.5-43.4-12.8-12-32.9-11.4-44.9 1.4-33.1 39.5-71.1 73.9-112.5 101.4C198.8 45.4 153.2 21.6 102.4 8.2 88.4 4.5 73.5 12.3 68.3 26.2c-5.3 14 2.3 29.5 16.1 34.6 44.8 16.7 85 41.2 119.5 73-35.3 21.1-71.8 44.4-108.8 69.3C52.3 189 28.7 172.9 6.2 161.4c-13-6.6-29.1-.9-35.3 12.4-6.2 13.3-.4 29.1 12.9 35.3 25.1 12.7 51.5 29.8 77.9 51.5-30.8 22-61.6 45.2-91.4 69.1-11.9 9.5-14.1 26.5-4.9 38.6 9.2 12.1 26.2 14.3 38.4 5.1 32.8-25.1 66-49.3 98.7-72.3 38.1 21.3 77.7 40.5 117.9 57.2-34.9 25.1-66.7 54.3-94.2 86.8-10.2 11.9-9.1 29.7 2.6 40.1 12.1 10.7 30.3 9.6 40.9-2.5 29.7-34.7 64-66 101.4-93.5 32.7 18.2 63.8 38 92.9 58.7-25.9 7.7-50.6 17.5-73.1 29.3-13.6 7.1-19.1 23.8-12 37.4 7.1 13.6 23.8 19.1 37.4 12 28.9-15 57.6-25.5 85.1-32.1 16.4-3.9 31.9 6.1 36.6 22.4 4.7 16.3 18.9 27.9 36.1 28.8 17.2.9 32.2-10.2 36.2-26.9 13.6-57.8 7.3-119-17-172.1 27.4-8.8 53.6-19.3 77.3-31.2 16.1-8.1 25.3-25.5 21.8-43.1-3.6-17.6-17.2-31.5-34.9-35.8z"/>
        </svg>
      </div>

      {/* --- FORM CONTAINER --- */}
      <div 
        ref={cardRef}
        className="relative z-20 w-full max-w-md p-6 sm:p-7 bg-[#040e24]/90 backdrop-blur-3xl border border-cyan-500/40 rounded-3xl shadow-[0_0_60px_rgba(6,182,212,0.25)] text-slate-100"
      >
        <div className="text-center mb-5 form-anim">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 shadow-lg shadow-cyan-500/40 text-2xl mb-2 border border-cyan-400/50">
            🔒
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-1.5">
            Forgot <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">Password</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enter your registered email to reset your password.
          </p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-anim space-y-1">
              <label className="text-xs font-medium text-slate-300">Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="name@example.com" 
                required
                className="w-full px-3 py-2.5 bg-[#020818]/90 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-200"
              />
            </div>

            <div className="form-anim pt-1">
              <button 
                type="submit" 
                className="w-full py-2.5 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-600/40 transition-all duration-200 text-sm tracking-wide transform active:scale-[0.98]"
              >
                Send Reset Link
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-4 space-y-3 form-anim">
            <div className="text-cyan-400 text-3xl">✉️</div>
            <p className="text-sm text-slate-300">
              If an account exists with <span className="text-cyan-400 font-medium">{email}</span>, you will receive a password reset link shortly.
            </p>
          </div>
        )}

        <div className="text-center mt-5 form-anim">
          <p className="text-xs text-slate-400">
            Remembered your password?{' '}
            <Link to="/signin" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
              Back to Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;