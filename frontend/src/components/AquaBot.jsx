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
  const { userData } = useSelector((state) => state.user);

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

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of chat
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
        text: "I'm having a little trouble fetching the live seafood feed right now. Please try asking again!",
        suggestions: ["Show Today's Catch", "Active Coupons", "Track Orders"],
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  const handleAddToCartFromBot = (product) => {
    dispatch(addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      quantity: 1000 // 1kg default
    }));
    setAddedItemMsg(`✅ Added 1kg ${product.name} to basket!`);
    setTimeout(() => setAddedItemMsg(''), 3000);
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
      {/* 🌟 FLOATING LAUNCHER BUTTON (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto">
        
        {/* Welcome pop-in speech bubble */}
        {!isOpen && showWelcomeBubble && (
          <div className="mb-3 p-3 bg-slate-900/95 border border-cyan-500/40 rounded-2xl shadow-2xl backdrop-blur-xl text-xs text-slate-200 max-w-xs animate-bounce flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
            <span>Need help with today's fresh catch or orders? Chat with <strong>AquaBot</strong>!</span>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowWelcomeBubble(false); }}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X size={12} />
            </button>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open AquaMart AI Assistant"
          className="group relative flex items-center gap-2.5 px-4 py-3.5 bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-full shadow-2xl shadow-cyan-500/40 border border-cyan-300/40 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <div className="relative">
            <Bot size={22} className="text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse" />
          </div>
          <span className="text-sm font-extrabold tracking-tight hidden sm:inline">
            AquaBot AI
          </span>
          <span className="bg-white/20 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-white/30 hidden sm:inline">
            24/7
          </span>
        </button>
      </div>

      {/* 🌟 CHATBOT INTERACTIVE MODAL */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-[420px] max-h-[640px] h-[80vh] z-50 bg-slate-950/95 border border-cyan-500/30 rounded-3xl shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden font-sans transition-all duration-300 animate-in fade-in zoom-in-95">
          
          {/* HEADER */}
          <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 border border-cyan-400/40">
                <Bot size={22} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-white">AquaBot AI</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[11px] text-cyan-400 font-medium">Seafood Specialist & Order Concierge</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={clearChat}
                title="Clear Chat"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-all"
              >
                <Trash2 size={15} />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                title="Close Chat"
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ADDED TO CART TOAST INSIDE BOT */}
          {addedItemMsg && (
            <div className="bg-emerald-500/20 border-b border-emerald-500/40 px-4 py-2 text-xs text-emerald-300 font-bold flex items-center justify-between">
              <span>{addedItemMsg}</span>
              <button 
                onClick={() => { setIsOpen(false); navigate('/cart'); }}
                className="underline hover:text-white"
              >
                Go to Cart
              </button>
            </div>
          )}

          {/* MESSAGES LIST */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin scrollbar-thumb-slate-800">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-2`}
              >
                <div 
                  className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-xs shadow-lg' 
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-xs shadow-md'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* 📦 RENDER ORDER CARD */}
                  {msg.orderData && (
                    <div className="mt-3 p-3 bg-slate-950 border border-cyan-500/40 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 uppercase font-mono">Status</span>
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[10px] border border-cyan-500/30 uppercase">
                          {msg.orderData.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between bg-cyan-950/40 p-2 rounded-lg border border-cyan-500/20">
                        <div>
                          <p className="text-[10px] text-slate-400">Doorstep OTP</p>
                          <p className="text-sm font-black font-mono text-cyan-300">{msg.orderData.otp}</p>
                        </div>
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            navigate('/my-orders');
                          }}
                          className="px-2.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-[10px] transition-all flex items-center gap-1"
                        >
                          <Truck size={12} /> Track Map
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 🐟 RENDER PRODUCT CARDS */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      {msg.products.map((prod) => (
                        <div 
                          key={prod._id}
                          className="flex items-center gap-3 p-2 bg-slate-950/80 border border-slate-800 rounded-xl hover:border-cyan-500/40 transition-all"
                        >
                          <img 
                            src={prod.image} 
                            alt={prod.name} 
                            className="w-12 h-12 rounded-lg object-cover bg-slate-900 border border-slate-800 shrink-0" 
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white text-xs truncate">{prod.name}</h4>
                            <p className="text-[11px] text-cyan-400 font-semibold">₹{prod.price}/kg</p>
                          </div>
                          <button
                            onClick={() => handleAddToCartFromBot(prod)}
                            className="p-2 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 rounded-lg transition-all"
                            title="Add 1kg to Cart"
                          >
                            <ShoppingCart size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 🎟️ RENDER COUPONS LIST */}
                  {msg.coupons && msg.coupons.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {msg.coupons.map((c, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded-xl">
                          <div>
                            <span className="font-mono font-bold text-cyan-300 text-xs">{c.code}</span>
                            <span className="text-[10px] text-slate-400 ml-2">({c.discountPercent}% OFF)</span>
                          </div>
                          <button
                            onClick={() => handleCopyCode(c.code)}
                            className="px-2 py-1 bg-slate-800 hover:bg-cyan-500/20 text-cyan-400 rounded-lg text-[10px] font-bold flex items-center gap-1"
                          >
                            {copiedCode === c.code ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                            {copiedCode === c.code ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SUGGESTION PILLS */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1 max-w-[90%]">
                    {msg.suggestions.map((sugg, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(sugg)}
                        className="px-2.5 py-1 bg-slate-900/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 rounded-full text-[11px] font-medium transition-all text-left"
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
              <div className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-2xl w-24">
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
            className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about fish, orders, recipes, OTP..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-500 transition-colors"
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
