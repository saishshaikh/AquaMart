import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { ArrowLeft, Plus, UploadCloud, Fish, Sparkles, Package } from 'lucide-react';
import gsap from 'gsap';
import { serverUrl } from '../App';
import { setMyShopData } from '../redux/ownerSlice';

function AddItem() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // eslint-disable-next-line no-unused-vars
  const { myShopData } = useSelector((state) => state.owner);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '', // Added description for more advanced UI
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Refs for GSAP
  const pageRef = useRef(null);
  const cardRef = useRef(null);
  const fishIconRef = useRef(null);
  const formRef = useRef(null);
  const btnRef = useRef(null);
  const bubblesRef = useRef([]);
  const schoolOfFishRef = useRef([]);

  // ✅ Advanced Marine Life Animations
  useEffect(() => {
    // Bubble Animation
    bubblesRef.current.forEach((bubble, index) => {
      gsap.fromTo(bubble, 
        { y: 50, opacity: 0, scale: 0.2 },
        {
          y: -600,
          x: `+= ${ (index % 2 === 0 ? 1 : -1) * (50 + index * 10) }`,
          opacity: 0.6,
          scale: 1 + (index % 3),
          repeat: -1,
          duration: 4 + index * 0.8,
          delay: index * 0.5,
          ease: "power1.out"
        }
      );
    });

    // School of Fish Animation
    schoolOfFishRef.current.forEach((fish, index) => {
      const isLeftToRight = index % 2 === 0;
      gsap.fromTo(fish,
        {
          x: isLeftToRight ? -100 : window.innerWidth + 100,
          y: 100 + index * 80,
          scaleX: isLeftToRight ? 1 : -1,
          opacity: 0.3 + Math.random() * 0.4
        },
        {
          x: isLeftToRight ? window.innerWidth + 100 : -100,
          y: `+= ${Math.sin(index) * 50}`, // Subtle wave motion
          repeat: -1,
          duration: 15 + index * 3,
          delay: index * 2,
          ease: "none"
        }
      );
    });

    // Timeline for Card & Form Elements
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    tl.fromTo(pageRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8 })
      .fromTo(cardRef.current, { y: 80, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 1 }, "-=0.5")
      .fromTo(fishIconRef.current, { scale: 0, rotate: -60 }, { scale: 1, rotate: 0, duration: 0.8, ease: "back.out(2)" }, "-=0.4")
      .fromTo('.form-group', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.15 }, "-=0.5")
      .fromTo(btnRef.current, { y: 30, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.7 }, "-=0.3");

  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price.trim()) {
      setError("Please fill Name and Price.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('description', formData.description); // Added description
      if (image) {
        formDataToSend.append('image', image);
      }

      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${serverUrl}/api/item/add-item`,
        formDataToSend,
        { 
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true 
        }
      );

      if (res.data.success) {
        alert('Item added successfully!');
        
        // ✅ Update Redux with new shop data
        if (res.data.shop) {
          dispatch(setMyShopData(res.data.shop));
        }
        
        navigate('/home');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to add item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full px-4 py-3.5 bg-slate-950/60 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-white placeholder:text-slate-600";
  const labelClasses = "text-sm font-medium text-slate-300 mb-1 block";

  return (
    <div 
      ref={pageRef}
      className="relative min-h-screen bg-slate-950 bg-gradient-to-br from-slate-950 via-cyan-950/40 to-blue-950/60 overflow-hidden flex items-center justify-center py-12 px-4 selection:bg-cyan-500 selection:text-white"
    >
      {/* 🫧 Rich Background Bubbles */}
      {[...Array(10)].map((_, i) => (
        <div
          key={`bubble-${i}`}
          ref={(el) => (bubblesRef.current[i] = el)}
          className="absolute rounded-full bg-cyan-200/20 backdrop-blur-md border border-white/30 pointer-events-none z-0"
          style={{
            width: `${15 + i * 3}px`,
            height: `${15 + i * 3}px`,
            left: `${5 + i * 9}%`,
            bottom: `-60px`,
          }}
        />
      ))}

      {/* 🐠 School of Colorful Fishes */}
      {[
        { color: "text-amber-400", size: 28 },
        { color: "text-rose-400", size: 22 },
        { color: "text-emerald-400", size: 32 },
        { color: "text-purple-400", size: 25 },
      ].map((fishItem, i) => (
        <div
          key={`fish-${i}`}
          ref={(el) => (schoolOfFishRef.current[i] = el)}
          className={`absolute pointer-events-none z-0 ${fishItem.color}`}
        >
          <Fish size={fishItem.size} />
        </div>
      ))}

      <div 
        ref={cardRef}
        className="relative z-10 w-full max-w-3xl bg-slate-900/70 backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[2.5rem] p-10"
      >
        <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-8">
          <button 
            onClick={() => navigate('/home')} 
            className="p-3 rounded-2xl hover:bg-white/10 transition-colors text-cyan-400 border border-white/5"
          >
            <ArrowLeft size={22} />
          </button>
          <div 
            ref={fishIconRef}
            className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/30 border border-white/20"
          >
            <Package size={32} className="text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Add Your Fresh Catch
              <Sparkles className="text-cyan-400 w-6 h-6" />
            </h2>
            <p className="text-slate-400 mt-1">List your premium seafood in the ocean market!</p>
          </div>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-rose-950/50 border border-rose-500/30 rounded-2xl text-rose-300 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Item Name */}
            <div className="form-group col-span-1">
              <label className={labelClasses}>Catch Name *</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange}
                placeholder="e.g. King Fish, Jumbo Prawns" 
                required
                className={inputClasses}
              />
            </div>

            {/* Category */}
            <div className="form-group col-span-1">
              <label className={labelClasses}>Category</label>
              <select 
                name="category" 
                value={formData.category} 
                onChange={handleChange}
                className={inputClasses + " appearance-none bg-no-repeat"}
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 1rem center', backgroundSize: '1.5em 1.5em' }}
              >
                <option value="">Select Category</option>
                <option value="Fresh Fish">Fresh Fish</option>
                <option value="Dry Fish">Dry Fish</option>
                <option value="Prawns">Prawns</option>
                <option value="Crabs">Crabs</option>
                <option value="Lobsters">Lobsters</option>
                <option value="Oysters">Oysters</option>
                <option value="Other Seafood">Other Seafood</option>
              </select>
            </div>

            {/* Price */}
            <div className="form-group col-span-1">
              <label className={labelClasses}>Price (₹) *</label>
              <input 
                type="number" 
                name="price" 
                value={formData.price} 
                onChange={handleChange}
                placeholder="e.g. 599" 
                required
                className={inputClasses}
              />
            </div>

            {/* Description */}
            <div className="form-group col-span-1 md:col-span-2">
              <label className={labelClasses}>Short Description (Optional)</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange}
                placeholder="Describe the catch, taste, or origin..." 
                rows="3"
                className={inputClasses + " resize-none"}
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="form-group space-y-2">
            <label className={labelClasses}>Catch Image</label>
            <div className="border-2 border-dashed border-white/20 bg-slate-950/30 backdrop-blur-sm rounded-3xl p-8 text-center hover:border-cyan-500/50 hover:bg-white/5 transition-all cursor-pointer relative group">
              <input type="file" accept="image/*" onChange={handleImage} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              {imagePreview ? (
                <img src={imagePreview} alt="Item Preview" className="h-32 w-auto mx-auto rounded-2xl object-contain shadow-2xl" />
              ) : (
                <div className="flex flex-col items-center gap-4 text-slate-500 group-hover:text-cyan-400 transition-colors">
                  <div className="p-5 bg-slate-800 rounded-full border border-white/10 group-hover:border-cyan-500/30 group-hover:bg-cyan-950/50 transition-all">
                    <UploadCloud size={40} className="text-cyan-500" />
                  </div>
                  <span className="text-base font-medium">Click to upload catch image</span>
                  <span className="text-xs text-slate-600">PNG, JPG, WEBP (Max 5MB)</span>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button 
            ref={btnRef}
            type="submit" 
            disabled={loading}
            className={`w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-cyan-500/30 flex items-center justify-center gap-3 transition-all duration-300 group ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.01] active:scale-95'}`}
          >
            {loading ? (
              <>
                <span className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></span>
                Adding Your Catch...
              </>
            ) : (
              <>
                <Plus size={24} className="group-hover:rotate-90 transition-transform duration-500" />
                Add to Market
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddItem;