import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Bot, X, Send, Sparkles, MessageSquare, ShoppingCart, 
  MapPin, Truck, ChevronRight, Copy, Check, RefreshCw, 
  Trash2, ArrowRight, ShieldCheck, Flame, Utensils
} from 'lucide-react';
import { serverUrl } from '../App';
import { addToCart } from '../redux/userSlice';

const AquaBot = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData, theme } = useSelector((state) => state.user);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "👋 Hi there! I'm **AquaBot**, your AI Seafood Concierge. How can I help you today? You can ask me about live order tracking, fresh morning catch, prices, recipes, or active discount codes!",
      timestamp: new Date(),
      suggestions: [
        "Track my active order 📦",
        "Show fresh fish prices 🐟",
        "Active discount codes 🎟️",
        "How to fry Surmai? 👨‍🍳"
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');
  const [addedItemMsg, setAddedItemMsg] = useState('');
  const [showWelcomeBubble, setShowWelcomeBubble] = useState(true);

  // 🌟 Scroll-Hide Floating Button Logic
  const [isButtonVisible, setIsButtonVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Scrolling Down -> Hide button to give clean view
        setIsButtonVisible(false);
      } else {
        // Scrolling Up or Near Top -> Show button
        setIsButtonVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen for custom trigger from Product page Advisor
  useEffect(() => {
    const handleOpenWithQuery = (e) => {
      const query = e.detail?.query;
      setIsOpen(true);
      if (query) {
        handleSendMessage(query);
      }
    };

    window.addEventListener('open-aquabot', handleOpenWithQuery);
    return () => window.removeEventListener('open-aquabot', handleOpenWithQuery);
  }, []);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setShowWelcomeBubble(false);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.post(
        `${serverUrl}/api/chat/message`,
        { message: query },
        { headers }
      );

      if (response.data?.success) {
        const botMessage = {
          id: Date.now() + 1,
          sender: 'bot',
          text: response.data.reply || "Here is what I found for you:",
          actionType: response.data.actionType,
          orderData: response.data.orderData,
          products: response.data.products,
          coupons: response.data.coupons,
          suggestions: response.data.suggestions || [],
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error("Failed response");
      }
    } catch (error) {
      console.error("AquaBot Chat Error:", error);
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: "I'm having trouble retrieving dock data right now. You can check the marketplace catalog or ask me about recipes!",
        timestamp: new Date(),
        suggestions: ["Show fresh fish prices 🐟", "Active discount codes 🎟️"]
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCartFromBot = (item) => {
    dispatch(addToCart(item));
    setAddedItemMsg(`✓ Added ${item.name} to Cart!`);
    setTimeout(() => setAddedItemMsg(''), 3000);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: "Chat cleared! How else can I assist your seafood shopping today?",
        timestamp: new Date(),
        suggestions: ["Show fresh fish prices 🐟", "Active discount codes 🎟️", "Track my order 📦"]
      }
    ]);
  };

  return (
    <>
      {/* 🌟 FLOATING LAUNCHER BUTTON (Fades out when scrolling down) */}
      <div className={`fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end transition-all duration-400 transform ${
        isButtonVisible || isOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-24 opacity-0 pointer-events-none'
      }`}>
        
        {/* Welcome pop-in speech bubble */}
        {!isOpen && showWelcomeBubble && (
          <div className={`mb-2.5 p-3 rounded-2xl shadow-2xl backdrop-blur-xl text-xs max-w-[260px] sm:max-w-xs animate-bounce flex items-center gap-2.5 ${
            theme === 'light'
              ? 'bg-white/95 border border-cyan-500/40 text-slate-800 shadow-slate-300/50'
              : 'bg-slate-900/95 border border-cyan-500/40 text-slate-200'
          }`}>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
            <span className="text-[11px] sm:text-xs">Need help with today's fresh catch or orders? Chat with <strong>AquaBot</strong>!</span>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowWelcomeBubble(false); }}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X size={12} />
            </button>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open AquaMart AI Assistant"
          className="group relative flex items-center gap-2 px-3.5 sm:px-4 py-3 sm:py-3.5 bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-full shadow-2xl shadow-cyan-500/50 border border-cyan-300/40 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <div className="relative">
            <Bot size={22} className="text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse" />
          </div>
          <span className="text-xs sm:text-sm font-extrabold tracking-tight">
            AquaBot
          </span>
          <span className="bg-white/20 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full border border-white/30 hidden sm:inline">
            24/7
          </span>
        </button>
      </div>

      {/* 🌟 CHATBOT INTERACTIVE MODAL */}
      {isOpen && (
        <div className={`fixed bottom-20 sm:bottom-24 right-2 sm:right-6 w-[calc(100vw-16px)] sm:w-[420px] max-h-[80vh] sm:max-h-[640px] h-[80vh] z-50 rounded-3xl shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden font-sans transition-all duration-300 animate-in fade-in zoom-in-95 border ${
          theme === 'light'
            ? 'bg-white/95 border-cyan-500/30 text-slate-800 shadow-slate-300/60'
            : 'bg-slate-950/95 border-cyan-500/30 text-slate-100 shadow-black/80'
        }`}>
          
          {/* HEADER */}
          <div className={`p-3.5 sm:p-4 border-b flex items-center justify-between ${
            theme === 'light'
              ? 'bg-slate-50 border-slate-200'
              : 'bg-slate-900/90 border-slate-800'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 border border-cyan-400/40">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className={`font-extrabold text-xs sm:text-sm ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>AquaBot AI</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] sm:text-[11px] text-cyan-600 dark:text-cyan-400 font-medium">Seafood Specialist & Concierge</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={clearChat}
                title="Clear Chat"
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                <Trash2 size={15} />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                title="Close Chat"
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ADDED TO CART TOAST INSIDE BOT */}
          {addedItemMsg && (
            <div className="bg-emerald-500/20 border-b border-emerald-500/40 px-4 py-2 text-xs text-emerald-600 dark:text-emerald-300 font-bold flex items-center justify-between">
              <span>{addedItemMsg}</span>
              <button 
                onClick={() => { setIsOpen(false); navigate('/cart'); }}
                className="underline hover:text-emerald-700"
              >
                Go to Cart
              </button>
            </div>
          )}

          {/* MESSAGES LIST */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 text-xs scrollbar-thin">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-2`}
              >
                <div 
                  className={`max-w-[88%] sm:max-w-[85%] p-3 sm:p-3.5 rounded-2xl leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-xs shadow-lg' 
                      : theme === 'light'
                        ? 'bg-slate-100 border border-slate-200 text-slate-800 rounded-bl-xs shadow-sm'
                        : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-xs shadow-md'
                  }`}
                >
                  <p className="whitespace-pre-line text-xs">{msg.text}</p>

                  {/* 📦 RENDER ORDER CARD */}
                  {msg.orderData && (
                    <div className={`mt-3 p-3 rounded-xl space-y-2 border ${
                      theme === 'light'
                        ? 'bg-white border-cyan-500/30'
                        : 'bg-slate-950 border-cyan-500/40'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 uppercase font-mono">Status</span>
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 font-bold text-[10px] border border-cyan-500/30 uppercase">
                          {msg.orderData.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Order ID:</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-white">#{msg.orderData._id?.slice(-6).toUpperCase()}</span>
                      </div>
                      {msg.orderData.deliveryOtp && msg.orderData.status !== 'delivered' && (
                        <div className="p-2 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-500/40 rounded-lg flex items-center justify-between">
                          <span className="text-[10px] text-cyan-700 dark:text-cyan-200">Delivery OTP:</span>
                          <span className="font-mono font-bold text-cyan-600 dark:text-cyan-300 text-xs tracking-widest">{msg.orderData.deliveryOtp}</span>
                        </div>
                      )}
                      <button 
                        onClick={() => { setIsOpen(false); navigate('/my-orders'); }}
                        className="w-full py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-700 dark:text-cyan-300 font-bold text-[11px] rounded-lg border border-cyan-500/30 text-center"
                      >
                        View Live Map & Details →
                      </button>
                    </div>
                  )}

                  {/* 🛍️ RENDER PRODUCTS CAROUSEL/LIST */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.products.map((p) => (
                        <div key={p._id} className={`flex items-center justify-between p-2 rounded-xl gap-2 border ${
                          theme === 'light'
                            ? 'bg-white border-slate-200'
                            : 'bg-slate-950 border-slate-800'
                        }`}>
                          <div className="flex items-center gap-2 min-w-0">
                            <img src={p.image || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=100"} alt={p.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white text-[11px] truncate">{p.name}</p>
                              <p className="text-cyan-600 dark:text-cyan-400 font-mono text-[11px]">₹{p.price}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleAddToCartFromBot(p)}
                            className="px-2.5 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-[10px] font-black shrink-0"
                          >
                            + Cart
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 🎟️ RENDER COUPONS LIST */}
                  {msg.coupons && msg.coupons.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {msg.coupons.map((c, i) => (
                        <div key={i} className={`flex items-center justify-between p-2 rounded-xl border ${
                          theme === 'light'
                            ? 'bg-white border-slate-200'
                            : 'bg-slate-950 border-slate-800'
                        }`}>
                          <div>
                            <span className="font-mono font-bold text-cyan-600 dark:text-cyan-300 text-xs">{c.code}</span>
                            <span className="text-[10px] text-slate-500 ml-2">({c.discountPercent}% OFF)</span>
                          </div>
                          <button
                            onClick={() => handleCopyCode(c.code)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border ${
                              theme === 'light'
                                ? 'bg-slate-100 hover:bg-cyan-50 text-cyan-700 border-slate-200'
                                : 'bg-slate-800 hover:bg-cyan-500/20 text-cyan-400 border-slate-700'
                            }`}
                          >
                            {copiedCode === c.code ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                            {copiedCode === c.code ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SUGGESTION PILLS */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1 max-w-[95%]">
                    {msg.suggestions.map((sugg, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(sugg)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all text-left border ${
                          theme === 'light'
                            ? 'bg-white hover:bg-cyan-50 text-slate-700 hover:text-cyan-700 border-slate-300 hover:border-cyan-400 shadow-xs'
                            : 'bg-slate-900/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border-slate-800 hover:border-cyan-500/40'
                        }`}
                      >
                        {sugg}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* TYPING INDICATOR */}
            {loading && (
              <div className={`flex items-center gap-2 p-3 rounded-2xl w-24 border ${
                theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT BAR */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className={`p-3 border-t flex items-center gap-2 ${
              theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800'
            }`}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about fish, orders, recipes, OTP..."
              className={`flex-1 border rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-cyan-500 transition-colors ${
                theme === 'light'
                  ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                  : 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-500'
              }`}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-slate-950 font-bold rounded-xl transition-all cursor-pointer shrink-0 shadow-lg shadow-cyan-500/20"
            >
              <Send size={15} />
            </button>
          </form>

        </div>
      )}
    </>
  );
};

export default AquaBot;
