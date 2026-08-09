import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { ArrowLeft, Plus, UploadCloud, CheckCircle, Fish } from 'lucide-react';
import gsap from 'gsap';
import { serverUrl } from '../App';

function AddItem() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { myShopData } = useSelector((state) => state.owner);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
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

  useEffect(() => {
    // 🫧 Bubbles Animation
    bubblesRef.current.forEach((bubble, index) => {
      gsap.to(bubble, {
        y: -300,
        opacity: 0,
        repeat: -1,
        duration: 4 + index,
        delay: index * 1.2,
        ease: "power1.inOut"
      });
    });

    // 🎯 Card entry animation
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(pageRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 })
      .fromTo(cardRef.current, { y: 50, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.7 })
      .fromTo(fishIconRef.current, { scale: 0, rotate: -20 }, { scale: 1, rotate: 0, duration: 0.5, ease: "back.out(1.7)" }, "-=0.3")
      .fromTo('.form-group', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 }, "-=0.3")
      .fromTo(btnRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, "-=0.2");
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
      if (image) {
        formDataToSend.append('image', image);
      }

      const res = await axios.post(
        `${serverUrl}/api/item/add-item`,
        formDataToSend,
        { withCredentials: true }
      );

      if (res.data.success) {
        alert('Item added successfully!');
        navigate('/home');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to add item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      ref={pageRef}
      className="relative min-h-screen bg-gradient-to-b from-[#e0f7fa] via-[#b2ebf2] to-[#80deea] overflow-hidden flex items-center justify-center py-10 px-4"
    >
      {/* 🫧 Floating Bubbles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          ref={(el) => (bubblesRef.current[i] = el)}
          className="absolute rounded-full bg-white/30 backdrop-blur-sm border border-white/20"
          style={{
            width: `${10 + Math.random() * 30}px`,
            height: `${10 + Math.random() * 30}px`,
            left: `${Math.random() * 100}%`,
            bottom: `-20px`,
          }}
        />
      ))}

      {/* 🌊 Glass Card */}
      <div 
        ref={cardRef}
        className="relative z-10 w-full max-w-2xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-8"
      >
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button 
            onClick={() => navigate('/home')} 
            className="p-2 rounded-full hover:bg-white/50 transition-colors"
          >
            <ArrowLeft size={20} className="text-cyan-600" />
          </button>
          <div 
            ref={fishIconRef}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30"
          >
            <Fish size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Add Your Fresh Catch</h2>
            <p className="text-sm text-gray-500">List your fresh seafood to the ocean market!</p>
          </div>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
          
          {error && (
            <div className="p-3 bg-red-100/50 backdrop-blur-sm border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="form-group space-y-1">
            <label className="text-sm font-medium text-gray-700">Item Name *</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange}
              placeholder="e.g. Fresh Prawns, King Fish" 
              required
              className="w-full px-4 py-2.5 bg-white/30 backdrop-blur-sm border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-gray-800"
            />
          </div>

                    {/* ✅ Category Dropdown */}
          <div className="form-group space-y-1">
            <label className="text-sm font-medium text-gray-700">Category</label>
            <select 
              name="category" 
              value={formData.category} 
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-white/30 backdrop-blur-sm border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-gray-800"
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
          <div className="form-group space-y-1">
            <label className="text-sm font-medium text-gray-700">Price (₹) *</label>
            <input 
              type="number" 
              name="price" 
              value={formData.price} 
              onChange={handleChange}
              placeholder="e.g. 299" 
              required
              className="w-full px-4 py-2.5 bg-white/30 backdrop-blur-sm border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-gray-800"
            />
          </div>

          {/* Image */}
          <div className="form-group space-y-1">
            <label className="text-sm font-medium text-gray-700">Item Image</label>
            <div className="border-2 border-dashed border-white/40 bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center hover:border-cyan-400 transition-colors cursor-pointer relative">
              <input type="file" accept="image/*" onChange={handleImage} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              {imagePreview ? (
                <img src={imagePreview} alt="Item Preview" className="h-24 w-auto mx-auto rounded-lg object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <UploadCloud size={32} className="text-cyan-500" />
                  <span className="text-sm">Click to upload catch image</span>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button 
            ref={btnRef}
            type="submit" 
            disabled={loading}
            className={`w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 ${loading ? 'opacity-80 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Adding Catch...
              </>
            ) : (
              <>
                <Plus size={20} />
                Add Catch
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ✅ YE LINE BOHOT ZAROORI HAI!
export default AddItem;