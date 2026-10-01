import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import { Eye, EyeOff, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

gsap.registerPlugin(useGSAP);

const ForgotPassword = () => {
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const introFishRef = useRef(null);
  const navigate = useNavigate();

  // Step management: 1=Email, 2=OTP, 3=New Password
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [ripple, setRipple] = useState(null);

  const handleRippleEffect = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipple({ x, y, id: Date.now() });
    setTimeout(() => setRipple(null), 1000);
  };

  // Handle Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    const error = {};
    if (!email) error.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) error.email = 'Please enter a valid email';
    
    if (Object.keys(error).length > 0) {
      setErrors(error);
      return;
    }

    setIsLoading(true);
    try {
      // Send OTP API call
      const result = await axios.post(
        `${serverUrl}/api/auth/send-otp`,
        { email },
        { withCredentials: true }
      );
      console.log(result.data);
      setStep(2);
      setOtpTimer(60);
      setIsResendDisabled(true);
      setErrors({});
      // Animation for step transition
      gsap.fromTo('.otp-section', 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 }
      );
    } catch (error) {
      console.error("Send OTP error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP Verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setErrors({ otp: 'Please enter complete 6-digit OTP' });
      return;
    }

    setIsLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/verify-otp`,
        { email, otp: otpValue },
        { withCredentials: true }
      );
      console.log(result.data);
      setStep(3);
      setErrors({});
      // Animation for password section
      gsap.fromTo('.password-section',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5 }
      );
    } catch (error) {
      console.error("Verify OTP error:", error.response?.data || error.message);
      setErrors({ otp: error.response?.data?.message || "Invalid OTP. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const error = {};
    if (newPassword.length < 8) error.newPassword = 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(newPassword)) error.newPassword = 'Include at least one uppercase letter';
    if (!/[a-z]/.test(newPassword)) error.newPassword = 'Include at least one lowercase letter';
    if (!/[0-9]/.test(newPassword)) error.newPassword = 'Include at least one number';
    if (newPassword !== confirmPassword) error.confirmPassword = 'Passwords do not match';
    
    if (Object.keys(error).length > 0) {
      setErrors(error);
      return;
    }

    setIsLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/reset-password`,
        { email, newPassword },
        { withCredentials: true }
      );
      console.log(result.data);
      setIsSuccess(true);
      // Success animation
      gsap.fromTo('.success-anim',
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' }
      );
    } catch (error) {
      console.error("Reset password error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOTP = async () => {
    setIsResendDisabled(true);
    setOtpTimer(60);
    setOtp(['', '', '', '', '', '']);
    setErrors({});
    
    try {
      await axios.post(
        `${serverUrl}/api/auth/send-otp`,
        { email },
        { withCredentials: true }
      );
      gsap.fromTo('.resend-success',
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }
      );
      setTimeout(() => {
        gsap.to('.resend-success', { opacity: 0, duration: 0.3 });
      }, 2000);
    } catch (error) {
      console.error("Resend OTP error:", error.response?.data || error.message);
      alert("Failed to resend OTP. Please try again.");
    }
  };

  // OTP Timer effect
  React.useEffect(() => {
    let interval = null;
    if (isResendDisabled && otpTimer > 0 && step === 2) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0 && step === 2) {
      setIsResendDisabled(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isResendDisabled, otpTimer, step]);

  // OTP input handler with auto-focus
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setErrors({});

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // OTP keydown handler for backspace
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
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

  // Render Step Indicator
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6 space-x-3 form-anim">
      {[1, 2, 3].map((num) => (
        <div key={num} className="flex items-center">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
            transition-all duration-500 relative
            ${step >= num 
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30' 
              : 'bg-slate-800 text-slate-500'
            }
          `}>
            {step > num ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              num
            )}
          </div>
          {num < 3 && (
            <div className={`
              w-8 h-0.5 mx-1 transition-all duration-500
              ${step > num ? 'bg-cyan-500' : 'bg-slate-700'}
            `} />
          )}
        </div>
      ))}
    </div>
  );

  // Render Email Step
  const renderEmailStep = () => (
    <form onSubmit={handleSendOTP} className="space-y-4">
      <div className="form-anim space-y-1">
        <label className="text-xs font-medium text-slate-300">Email Address</label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors({});
          }} 
          placeholder="name@example.com" 
          required
          className={`
            w-full px-3 py-2.5 bg-[#020818]/90 border rounded-xl text-slate-100 
            placeholder-slate-500 text-sm focus:outline-none focus:ring-2 
            transition-all duration-200
            ${errors.email 
              ? 'border-red-500 focus:ring-red-500/30' 
              : 'border-slate-800 focus:border-cyan-400 focus:ring-cyan-500/30'
            }
          `}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3" />
            {errors.email}
          </p>
        )}
      </div>

      <div className="form-anim pt-1">
        <button 
          type="submit" 
          disabled={isLoading}
          className={`
            w-full py-2.5 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 
            hover:from-cyan-500 hover:to-blue-500 text-white font-semibold 
            rounded-xl shadow-lg shadow-cyan-600/40 transition-all duration-200 
            text-sm tracking-wide transform active:scale-[0.98]
            flex items-center justify-center gap-2
            ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
          `}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending OTP...
            </>
          ) : (
            'Send OTP'
          )}
        </button>
      </div>
    </form>
  );


  // Render OTP Step
  const renderOTPStep = () => (
    <form onSubmit={handleVerifyOTP} className="space-y-4 otp-section">
      <div className="text-center space-y-1 form-anim">
        <p className="text-xs text-slate-400">
          Enter the 6-digit code sent to
        </p>
        <p className="text-sm font-medium text-cyan-400">{email}</p>
        <div className="resend-success opacity-0 flex items-center justify-center gap-1 text-xs text-green-400">
          <CheckCircle className="w-3 h-3" />
          <span>OTP resent successfully!</span>
        </div>
      </div>

      <div className="space-y-3 form-anim">
        <div className="flex justify-center gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              className={`
                w-10 h-12 text-center text-lg font-bold rounded-xl border-2
                transition-all duration-300 focus:outline-none focus:ring-2 
                bg-[#020818]/90 text-slate-100
                ${errors.otp 
                  ? 'border-red-500 focus:ring-red-500/30' 
                  : 'border-slate-800 focus:border-cyan-400 focus:ring-cyan-500/30'
                }
                ${digit ? 'border-cyan-400 bg-cyan-950/30' : ''}
              `}
              disabled={isLoading}
            />
          ))}
        </div>
        {errors.otp && (
          <p className="text-xs text-red-400 text-center flex items-center justify-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.otp}
          </p>
        )}
      </div>

      <button 
        type="submit" 
        disabled={isLoading}
        className={`
          w-full py-2.5 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 
          hover:from-cyan-500 hover:to-blue-500 text-white font-semibold 
          rounded-xl shadow-lg shadow-cyan-600/40 transition-all duration-200 
          text-sm tracking-wide transform active:scale-[0.98]
          flex items-center justify-center gap-2 form-anim
          ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
        `}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Verifying OTP...
          </>
        ) : (
          'Verify OTP'
        )}
      </button>

      <div className="text-center space-y-1 form-anim">
        <p className="text-xs text-slate-400">
          Didn't receive code?{' '}
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={isResendDisabled || isLoading}
            className={`
              font-medium transition-colors
              ${isResendDisabled || isLoading
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-cyan-400 hover:text-cyan-300'
              }
            `}
          >
            Resend {isResendDisabled && `(${otpTimer}s)`}
          </button>
        </p>
        <button
          type="button"
          onClick={() => {
            setStep(1);
            setErrors({});
          }}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" />
          Change Email
        </button>
      </div>
    </form>
  );

  // Render Password Step
  const renderPasswordStep = () => {
    const getPasswordStrength = () => {
      let strength = 0;
      if (newPassword.length >= 8) strength += 1;
      if (newPassword.match(/[a-z]+/)) strength += 1;
      if (newPassword.match(/[A-Z]+/)) strength += 1;
      if (newPassword.match(/[0-9]+/)) strength += 1;
      if (newPassword.match(/[$@#&!]+/)) strength += 1;
      return strength;
    };

    const strength = getPasswordStrength();
    const getStrengthColor = () => {
      if (strength <= 2) return 'bg-red-500';
      if (strength <= 3) return 'bg-yellow-500';
      return 'bg-green-500';
    };

    const getStrengthText = () => {
      if (strength <= 2) return 'Weak';
      if (strength <= 3) return 'Medium';
      return 'Strong';
    };

    return (
      <form onSubmit={handleResetPassword} className="space-y-4 password-section">
        <div className="form-anim space-y-1">
          <label className="text-xs font-medium text-slate-300">New Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setErrors({});
              }}
              className={`
                w-full px-3 py-2.5 pr-10 bg-[#020818]/90 border rounded-xl 
                text-slate-100 placeholder-slate-500 text-sm focus:outline-none 
                focus:ring-2 transition-all duration-200
                ${errors.newPassword 
                  ? 'border-red-500 focus:ring-red-500/30' 
                  : 'border-slate-800 focus:border-cyan-400 focus:ring-cyan-500/30'
                }
              `}
              placeholder="Create a strong password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {newPassword && (
            <div className="space-y-1 mt-2">
              <div className="flex gap-1 h-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`
                      flex-1 rounded-full transition-all duration-300
                      ${level <= strength ? getStrengthColor() : 'bg-slate-700'}
                    `}
                  />
                ))}
              </div>
              <div className="flex justify-between">
                <p className="text-xs text-slate-400">{getStrengthText()}</p>
                <p className="text-xs text-slate-500">{newPassword.length}/8+</p>
              </div>
            </div>
          )}
          {errors.newPassword && (
            <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3" />
              {errors.newPassword}
            </p>
          )}
        </div>

        <div className="form-anim space-y-1">
          <label className="text-xs font-medium text-slate-300">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors({});
              }}
              className={`
                w-full px-3 py-2.5 pr-10 bg-[#020818]/90 border rounded-xl 
                text-slate-100 placeholder-slate-500 text-sm focus:outline-none 
                focus:ring-2 transition-all duration-200
                ${errors.confirmPassword 
                  ? 'border-red-500 focus:ring-red-500/30' 
                  : 'border-slate-800 focus:border-cyan-400 focus:ring-cyan-500/30'
                }
              `}
              placeholder="Confirm your new password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3" />
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className={`
            w-full py-2.5 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 
            hover:from-cyan-500 hover:to-blue-500 text-white font-semibold 
            rounded-xl shadow-lg shadow-cyan-600/40 transition-all duration-200 
            text-sm tracking-wide transform active:scale-[0.98]
            flex items-center justify-center gap-2 form-anim
            ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
          `}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Resetting Password...
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>
    );
  };

  // Render Success
  const renderSuccess = () => (
    <div className="text-center py-6 space-y-4 success-anim">
      <div className="relative w-20 h-20 mx-auto">
        <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
        <div className="relative w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
      </div>
      <div>
        <h3 className="text-xl font-bold text-white mb-1">
          Password Reset Successfully!
        </h3>
        <p className="text-xs text-slate-400">
          Your password has been reset. You can now login with your new password.
        </p>
      </div>
      <button
        onClick={() => navigate('/signin')}
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-600/40 transition-all duration-200 text-sm transform active:scale-[0.98]"
      >
        Go to Login
      </button>
    </div>
  );

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
            {step === 1 && 'Enter your email to receive a verification code'}
            {step === 2 && 'Enter the 6-digit code sent to your email'}
            {step === 3 && 'Create a strong password for your account'}
          </p>
        </div>

        {/* Step Indicator */}
        {!isSuccess && step > 1 && renderStepIndicator()}

        {/* Content */}
        <div className="relative">
          {!isSuccess ? (
            <>
              {step === 1 && renderEmailStep()}
              {step === 2 && renderOTPStep()}
              {step === 3 && renderPasswordStep()}
            </>
          ) : (
            renderSuccess()
          )}
        </div>

        {/* Footer Links */}
        {!isSuccess && (
          <div className="text-center mt-5 form-anim">
            <p className="text-xs text-slate-400">
              {step === 1 ? 'Remembered your password?' : 'Changed your mind?'}
              {' '}
              <Link to="/signin" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                Back to Log In
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;