import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import axios from "axios"
import { Link } from 'react-router-dom';
import { serverUrl } from '../App';
gsap.registerPlugin(useGSAP);

const SignUp = () => {
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const introFishRef = useRef(null);

  const [formData, setFormData] = useState({
    role: 'user',
    fullName: '',
    email: '',
    mobile: '',
    password: ''
  });
  const HandleSignUp = async () => {
  try {
    const result = await axios.post(
      `${serverUrl}/api/auth/signup`,
      {
        fullName: formData.fullName,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        role: formData.role,
      },
      {
        withCredentials: true,
      }
    );

    console.log(result.data);
  } catch (error) {
    console.error("SignUp fetch error:", error.response?.data || error.message);
  }
};
  const [showPassword, setShowPassword] = useState(false);
  const [ripple, setRipple] = useState(null);

  // Advanced Password Strength Checker
  const getPasswordStrength = (pass) => {
    if (!pass) return { label: '', color: 'bg-slate-800', width: '0%' };
    if (pass.length < 6) return { label: 'Weak', color: 'bg-rose-500', width: '33%' };
    if (pass.length < 10) return { label: 'Medium', color: 'bg-amber-500', width: '66%' };
    return { label: 'Strong', color: 'bg-emerald-500', width: '100%' };
  };

  const strength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRippleEffect = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipple({ x, y, id: Date.now() });
    setTimeout(() => setRipple(null), 1000);
  };

  const handleSubmit =async(e)=> {
    e.preventDefault();
    console.log("Advanced Form Submitted:", formData);
    alert(`Success! Account created as ${formData.role.toUpperCase()}`);
    await HandleSignUp();
  };

  const handleGoogleAuth = () => {
    console.log("Google Authentication Triggered");
    alert("Redirecting to Google Authentication...");
  };

  useGSAP(() => {
    const tl = gsap.timeline();

    gsap.set(cardRef.current, { scale: 0.4, opacity: 0, display: 'none' });

    // 1. Fish Entry & Swimming Sequence
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
    // 3. Advanced Glass Form Pop
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
        <div className="absolute top-[45%] left-0 bg-fish-2 text-3xl opacity-50 filter drop-shadow-[0_0_10px_rgba(255,0,128,0.8)]">🦐</div>

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
            💧
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-1.5">
            Aqua<span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">Mart</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dive into pure hydration. Create your secure account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          
          <div className="form-anim space-y-1">
            <label className="text-xs font-medium text-slate-300 flex justify-between">
              <span>Account Type</span>
              <span className="text-cyan-400 text-[10px] uppercase font-bold tracking-wider">{formData.role}</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#020716]/90 rounded-xl border border-cyan-900/60">
              {['user', 'admin', 'delivery'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: r })}
                  className={`py-1.5 text-xs font-semibold capitalize rounded-lg transition-all duration-300 ${
                    formData.role === r
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/40 scale-[1.02]'
                      : 'text-slate-400 hover:text-white hover:bg-cyan-950/40'
                  }`}
                >
                  {r === 'delivery' ? 'Delivery' : r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-anim space-y-1">
            <label className="text-xs font-medium text-slate-300">Full Name</label>
            <input 
              type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter your full name" required
              className="w-full px-3 py-2 bg-[#020818]/90 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-200"
            />
          </div>

          <div className="form-anim space-y-1">
            <label className="text-xs font-medium text-slate-300">Email Address</label>
            <input 
              type="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" required
              className="w-full px-3 py-2 bg-[#020818]/90 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-200"
            />
          </div>

          <div className="form-anim space-y-1">
            <label className="text-xs font-medium text-slate-300">Mobile Number</label>
            <input 
              type="tel" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="Enter 10-digit mobile number" required
              className="w-full px-3 py-2 bg-[#020818]/90 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-200"
            />
          </div>

          <div className="form-anim space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-slate-300">Password</label>
              {formData.password && (
                <span className="text-[10px] font-semibold text-slate-400">
                  Strength: <span className={strength.label === 'Strong' ? 'text-emerald-400' : strength.label === 'Medium' ? 'text-amber-400' : 'text-rose-400'}>{strength.label}</span>
                </span>
              )}
            </div>
            
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Create a strong password" required
                className="w-full px-3 py-2 pr-10 bg-[#020818]/90 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-200"
              />
              <button 
                type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs focus:outline-none"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {formData.password && (
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1.5">
                <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: strength.width }} />
              </div>
            )}
          </div>

          <div className="form-anim pt-1">
            <button
              type="submit" 
              className="w-full py-2.5 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-600/40 transition-all duration-200 text-sm tracking-wide transform active:scale-[0.98]"
            >
              Create Account
            </button>
          </div>
        </form>

        {/* --- DIVIDER --- */}
        <div className="relative my-3.5 form-anim">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#040e24] px-3 text-slate-500 font-medium">Or continue with</span>
          </div>
        </div>

        {/* --- GOOGLE AUTH BUTTON WITH ICON --- */}
        <div className="form-anim">
          <button 
            type="button"
            onClick={handleGoogleAuth}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-[#020818]/90 hover:bg-[#07132d] border border-cyan-900/50 hover:border-cyan-500/50 rounded-xl text-slate-200 font-medium transition-all duration-300 text-sm group shadow-md shadow-black/40"
          >
            <svg className="w-4 h-4 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.18v3.15C3.15 21.32 7.23 24 12 24z" />
              <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.6H1.18C.43 8.12 0 9.82 0 12s.43 3.88 1.18 5.4l4.09-3.16z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.15 2.68 1.18 6.6l4.09 3.15c.95-2.85 3.6-4.96 6.73-4.96z" />
            </svg>
            <span className="text-slate-300 group-hover:text-white">Sign up with Google</span>
          </button>
        </div>

       <div className="text-center mt-3.5 form-anim">
  <p className="text-xs text-slate-400">
    Already have an account?{' '}
    <Link to="/signin" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
      Log in
    </Link>
  </p>
</div>
      </div>
    </div>
  );
};

export default SignUp;