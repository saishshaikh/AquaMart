import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Fish, ArrowLeft, Upload, Sparkles } from 'lucide-react';
import { serverUrl } from '../App';

function EditItem() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { myShopData } = useSelector((state) => state.owner);
  const { items } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    image: null
  });
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (itemId) {
      const foundItem = 
        myShopData?.items?.find(i => (i._id || i.id) === itemId) ||
        items?.find(i => (i._id || i.id) === itemId);

      if (foundItem) {
        setFormData({
          name: foundItem.name || '',
          category: foundItem.category || '',
          price: foundItem.price || '',
          description: foundItem.description || '',
          image: null
        });
        if (foundItem.image) {
          setPreview(foundItem.image);
        }
      }
    }
  }, [itemId, myShopData, items]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('category', formData.category);
    data.append('price', formData.price);
    if (formData.description) data.append('description', formData.description);
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${serverUrl}/api/item/edit-item/${itemId}`, data, {
        withCredentials: true,
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        alert("🎉 Catch details updated successfully!");
        navigate('/home');
      }
    } catch (error) {
      console.error("Error updating item:", error);
      alert(error.response?.data?.message || "Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="pointer-events-none fixed -right-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-32 -left-32 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-2xl rounded-3xl p-6 sm:p-8 relative z-10">
        
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-1.5 text-slate-400 hover:text-white mb-4 text-xs font-medium transition-colors"
        >
          <ArrowLeft size={14} className="text-cyan-400" /> Back
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Fish size={20} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Edit Seafood Item</h2>
            <p className="text-xs text-slate-400">Update price, name, or photo</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Item Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
              <input 
                type="text" 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                required
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Price (₹/kg)</label>
              <input 
                type="number" 
                name="price" 
                value={formData.price} 
                onChange={handleChange} 
                required
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Item Image</label>
            <div className="border border-dashed border-slate-700 rounded-xl p-3 text-center hover:border-cyan-500/50 transition-colors relative bg-slate-950/50 cursor-pointer">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {preview ? (
                <img src={preview} alt="Preview" className="h-24 mx-auto rounded-lg object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-500 py-2">
                  <Upload size={20} className="text-cyan-400" />
                  <span className="text-[11px]">Upload new item image</span>
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Saving Changes..." : "Save Changes"}
          </button>

        </form>

      </div>
    </div>
  );
}

export default EditItem;