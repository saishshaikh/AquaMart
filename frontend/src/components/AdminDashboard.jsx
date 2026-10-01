import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { 
  Store, ArrowRight, Pencil, Fish, Plus, MapPin, 
  Globe, Droplets, Trash2, Sparkles, ShieldCheck, 
  TrendingUp, Package, Compass, LayoutGrid, X,
  UploadCloud, CheckCircle, Navigation, Building, LocateFixed,
  ShoppingBag, Users, Award, Clock
} from 'lucide-react';
import gsap from 'gsap';
import { serverUrl } from '../App';
import useGetMyShop from "../hooks/useGetMyShop";

function AdminDashboard() {
  const navigate = useNavigate();
  const { myShopData } = useSelector((state) => state.owner);
  const { userData } = useSelector((state) => state.user);

  const [allShops, setAllShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState(null);
  const [loadingShops, setLoadingShops] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Modal States
  const [showCreateShop, setShowCreateShop] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showEditItem, setShowEditItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form States
  const [shopForm, setShopForm] = useState({ 
    name: '', 
    city: userData?.city || '', 
    state: userData?.state || '', 
    address: userData?.address || '', 
    pincode: userData?.pincode || '',
    image: null,
    shopCategory: ''
  });
  const [itemForm, setItemForm] = useState({ 
    name: '', 
    price: '', 
    category: '', 
    description: '', 
    image: null 
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [frontendImage, setFrontendImage] = useState(null);
  const [frontendItemImage, setFrontendItemImage] = useState(null);
  const [locationDetected, setLocationDetected] = useState(false);

  const [stats, setStats] = useState(null);

  useGetMyShop();

  // ✅ Fetch All Shops & Order Analytics
  useEffect(() => {
    if (userData?.role === 'admin' || userData?.role === 'owner') {
      fetchAllShops();
      fetchStats();
    }
  }, [userData]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(`${serverUrl}/api/order/statistics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success) {
        setStats(res.data.statistics);
      }
    } catch (err) {
      console.log("Could not fetch admin statistics:", err.message);
    }
  };

  // ✅ Selected Shop ke Items fetch karo (Har shop click par)
  useEffect(() => {
    if (selectedShopId) {
      const shop = allShops.find(s => s._id === selectedShopId);
      setSelectedItems(shop?.items || []);
    }
  }, [selectedShopId, allShops]);

  const fetchAllShops = async () => {
    try {
      setLoadingShops(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${serverUrl}/api/shop/all-shops`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("📦 All Shops Response:", response.data);
      if (response.data.success) {
        setAllShops(response.data.shops);
        if (response.data.shops.length > 0) {
          setSelectedShopId(response.data.shops[0]._id);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching all shops:", error);
      setFormError('Failed to fetch shops: ' + error.message);
    } finally {
      setLoadingShops(false);
    }
  };

  // ✅ Create Shop
  const handleCreateShop = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', shopForm.name);
      formData.append('city', shopForm.city);
      formData.append('state', shopForm.state);
      formData.append('address', shopForm.address);
      formData.append('pincode', shopForm.pincode);
      formData.append('shopCategory', shopForm.shopCategory);
      if (shopForm.image) {
        formData.append('image', shopForm.image);
      }

      const response = await axios.post(`${serverUrl}/api/shop/create-shop`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log("📦 Shop Creation Response:", response.data);
      
      if (response.data.success) {
        alert('✅ Shop created successfully!');
        setShowCreateShop(false);
        setShopForm({ name: '', city: '', state: '', address: '', pincode: '', image: null, shopCategory: '' });
        setFrontendImage(null);
        setLocationDetected(false);
        fetchAllShops();
      }
    } catch (error) {
      console.error("❌ Error creating shop:", error);
      setFormError(error.response?.data?.message || 'Failed to create shop');
    } finally {
      setFormLoading(false);
    }
  };

  // ✅ Add Item
  const handleAddItem = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', itemForm.name);
      formData.append('price', itemForm.price);
      formData.append('category', itemForm.category);
      formData.append('description', itemForm.description);
      formData.append('shopId', selectedShopId);
      if (itemForm.image) {
        formData.append('image', itemForm.image);
      }

      const response = await axios.post(`${serverUrl}/api/shop/add-item`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log("📦 Add Item Response:", response.data);
      
      if (response.data.success) {
        alert('✅ Item added successfully!');
        setShowAddItem(false);
        setItemForm({ name: '', price: '', category: '', description: '', image: null });
        setFrontendItemImage(null);
        fetchAllShops(); // ✅ Refresh all shops (taaki items update ho jayein)
      }
    } catch (error) {
      console.error("❌ Error adding item:", error);
      setFormError(error.response?.data?.message || 'Failed to add item');
    } finally {
      setFormLoading(false);
    }
  };

  // ✅ Edit Item
  const handleEditItem = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', itemForm.name);
      formData.append('price', itemForm.price);
      formData.append('category', itemForm.category);
      formData.append('description', itemForm.description);
      if (itemForm.image && typeof itemForm.image !== 'string') {
        formData.append('image', itemForm.image);
      }

      // ✅ Backend ka exact route use kiya
      const response = await axios.put(`${serverUrl}/api/item/edit-item/${editingItem._id}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log("📦 Edit Item Response:", response.data);
      
      if (response.data.success) {
        alert('✅ Item updated successfully!');
        setShowEditItem(false);
        setEditingItem(null);
        setItemForm({ name: '', price: '', category: '', description: '', image: null });
        setFrontendItemImage(null);
        fetchAllShops(); // ✅ Refresh data
      }
    } catch (error) {
      console.error("❌ Error editing item:", error);
      setFormError(error.response?.data?.message || 'Failed to update item');
    } finally {
      setFormLoading(false);
    }
  };

  // ✅ Delete Item
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this item?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${serverUrl}/api/item/delete-item/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("📦 Delete Item Response:", response.data);
      alert('✅ Item deleted successfully!');
      fetchAllShops(); // ✅ Refresh data
    } catch (error) {
      console.error("❌ Error deleting item:", error);
      alert('❌ Failed to delete item: ' + error.response?.data?.message || error.message);
    }
  };

  // ✅ Delete Shop
  const handleDeleteShop = async (shopId) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this shop and all its items?')) return;
    try {
      const token = localStorage.getItem('token');
      // ✅ Backend ka exact route use kiya
      const response = await axios.delete(`${serverUrl}/api/shop/delete-shop/${shopId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("📦 Delete Shop Response:", response.data);
      alert('✅ Shop deleted successfully!');
      if (selectedShopId === shopId) {
        setSelectedShopId(null);
      }
      fetchAllShops(); // ✅ Refresh data
    } catch (error) {
      console.error("❌ Error deleting shop:", error);
      alert('❌ Failed to delete shop: ' + error.response?.data?.message || error.message);
    }
  };

  // ✅ Open Edit Modal
  const openEditModal = (item) => {
    setEditingItem(item);
    setItemForm({
      name: item.name || '',
      price: item.price || '',
      category: item.category || '',
      description: item.description || '',
      image: item.image || item.imageUrl || ''
    });
    setFrontendItemImage(item.image || item.imageUrl || null);
    setShowEditItem(true);
  };

  // ✅ Detect Live Location
  const detectLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("❌ Geolocation is not supported by your browser");
      return;
    }

    setDetectingLocation(true);
    setFormError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'Synexa.Ai - Shop Location Detection'
              }
            }
          );
          
          if (res.data && res.data.address) {
            const addr = res.data.address;
            const detectedCity = addr.city || addr.town || addr.village || addr.municipality || addr.county || "";
            const detectedState = addr.state || addr.region || "";
            const detectedPincode = addr.postcode || "";
            const roadName = addr.road || "";
            const houseNumber = addr.house_number || "";
            const suburb = addr.suburb || "";
            
            let fullAddress = "";
            if (houseNumber) fullAddress += houseNumber + ", ";
            if (roadName) fullAddress += roadName + ", ";
            if (suburb) fullAddress += suburb + ", ";
            fullAddress += detectedCity || "";
            
            setShopForm(prev => ({
              ...prev,
              city: detectedCity || prev.city,
              state: detectedState || prev.state,
              address: fullAddress || prev.address,
              pincode: detectedPincode || prev.pincode
            }));
            
            setLocationDetected(true);
            alert("📍 Live location detected successfully!");
          } else {
            setFormError("Could not fetch address from coordinates.");
          }
        } catch (error) {
          console.error("Error fetching location:", error);
          setFormError("Unable to detect location. Please enter manually.");
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setDetectingLocation(false);
        let errorMessage = "Unable to retrieve your location.";
        if (error.code === 1) errorMessage = "❌ Location access denied. Please enable location permissions.";
        else if (error.code === 2) errorMessage = "❌ Location unavailable. Please try again.";
        else if (error.code === 3) errorMessage = "❌ Location request timed out. Please try again.";
        setFormError(errorMessage);
        alert(errorMessage);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  // ✅ Handle Image Upload
  const handleShopImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setShopForm({ ...shopForm, image: file });
      setFrontendImage(URL.createObjectURL(file));
    }
  };

  const handleItemImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setItemForm({ ...itemForm, image: file });
      setFrontendItemImage(URL.createObjectURL(file));
    }
  };

  // GSAP Refs & Animations
  const containerRef = useRef(null);
  const waveRef = useRef(null);
  const bubblesRef = useRef([]);
  const schoolOfFishRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (waveRef.current) {
        gsap.to(waveRef.current, { y: 15, rotation: 0.5, repeat: -1, yoyo: true, duration: 5, ease: "sine.inOut" });
      }
      bubblesRef.current.forEach((bubble, index) => {
        if (!bubble) return;
        const randomXOffset = (index % 2 === 0 ? 1 : -1) * (25 + index * 8);
        gsap.fromTo(bubble, 
          { y: 60, opacity: 0, scale: 0.3 },
          { y: -550, x: `+= ${randomXOffset}`, opacity: 0.75, scale: 1.3, repeat: -1, duration: 3.5 + (index * 0.5), delay: index * 0.4, ease: "power1.out" }
        );
      });
      schoolOfFishRef.current.forEach((fish, index) => {
        if (!fish) return;
        const isLeftToRight = index % 2 === 0;
        const startX = isLeftToRight ? -120 : window.innerWidth + 120;
        const endX = isLeftToRight ? window.innerWidth + 120 : -120;
        const randomY = 50 + Math.random() * (window.innerHeight - 150);
        const duration = 8 + (index * 2.5);
        gsap.fromTo(fish, { x: startX, y: randomY, scaleX: isLeftToRight ? 1 : -1, opacity: 0.2 + Math.random() * 0.5 }, { x: endX, y: randomY + (Math.sin(index) * 80), repeat: -1, duration: duration, delay: index * 1.8, ease: "none" });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleMouseEnter = (e, scaleVal = 1.02) => gsap.to(e.currentTarget, { scale: scaleVal, duration: 0.3, ease: "power2.out" });
  const handleMouseLeave = (e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.3, ease: "power2.out" });

  const renderMarineBackground = () => (
    <>
      <div className="absolute top-10 left-1/4 w-[450px] h-[450px] bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 right-10 w-[400px] h-[400px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      {[...Array(5)].map((_, i) => (
        <div key={`fish-${i}`} ref={(el) => (schoolOfFishRef.current[i] = el)} className="absolute pointer-events-none z-0 text-amber-400/40">
          <Fish size={24 + i * 4} />
        </div>
      ))}
      {[...Array(10)].map((_, i) => (
        <div key={`bubble-${i}`} ref={(el) => (bubblesRef.current[i] = el)} className="absolute rounded-full bg-cyan-200/20 backdrop-blur-sm border border-white/20 pointer-events-none z-0" style={{ width: `${10 + (i * 3)}px`, height: `${10 + (i * 3)}px`, left: `${5 + (i * 9)}%`, bottom: `-50px` }} />
      ))}
      <div ref={waveRef} className="absolute bottom-0 left-0 w-full h-36 pointer-events-none z-0 opacity-50">
        <svg viewBox="0 0 1440 320" className="w-full h-full fill-cyan-500/20">
          <path d="M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,181.3C672,181,768,203,864,213.3C960,224,1056,224,1152,208C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
        </svg>
      </div>
    </>
  );

  // ==============================================
  // ✅ CREATE SHOP MODAL
  // ==============================================
  const CreateShopModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-8 max-w-md w-full my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Store className="text-cyan-400 w-6 h-6" /> Create New Shop
          </h2>
          <button onClick={() => { setShowCreateShop(false); setFrontendImage(null); setFormError(''); }} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {formError && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm mb-4">{formError}</div>
        )}

        <form onSubmit={handleCreateShop} className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 block mb-1">Shop Name *</label>
            <input 
              value={shopForm.name} 
              onChange={(e) => setShopForm({...shopForm, name: e.target.value})} 
              placeholder="e.g. Fresh Catch Aqua Mart" 
              className="w-full p-3 rounded-xl bg-slate-800 border border-white/10 text-white focus:border-cyan-500 outline-none" 
              required 
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 block mb-1">Shop Image</label>
            <div className="border-2 border-dashed border-slate-700 rounded-xl p-4 text-center hover:border-cyan-500 transition-colors cursor-pointer relative">
              <input type="file" accept="image/*" onChange={handleShopImage} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              {frontendImage ? (
                <img src={frontendImage} alt="Shop Preview" className="h-24 w-auto mx-auto rounded object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <UploadCloud size={32} />
                  <span className="text-sm">Click to upload shop image</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-400 block mb-1">City *</label>
              <input 
                value={shopForm.city} 
                onChange={(e) => setShopForm({...shopForm, city: e.target.value})} 
                placeholder="Mumbai" 
                className="w-full p-3 rounded-xl bg-slate-800 border border-white/10 text-white focus:border-cyan-500 outline-none" 
                required 
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1">State *</label>
              <input 
                value={shopForm.state} 
                onChange={(e) => setShopForm({...shopForm, state: e.target.value})} 
                placeholder="Maharashtra" 
                className="w-full p-3 rounded-xl bg-slate-800 border border-white/10 text-white focus:border-cyan-500 outline-none" 
                required 
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 block mb-1">Pincode</label>
            <input 
              value={shopForm.pincode} 
              onChange={(e) => setShopForm({...shopForm, pincode: e.target.value})} 
              placeholder="400001" 
              className="w-full p-3 rounded-xl bg-slate-800 border border-white/10 text-white focus:border-cyan-500 outline-none" 
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 block mb-1">Address *</label>
            <div className="flex gap-2">
              <input 
                value={shopForm.address} 
                onChange={(e) => setShopForm({...shopForm, address: e.target.value})} 
                placeholder="Shop No, Street, Area" 
                className="flex-1 p-3 rounded-xl bg-slate-800 border border-white/10 text-white focus:border-cyan-500 outline-none" 
                required 
              />
              <button
                type="button"
                onClick={detectLiveLocation}
                disabled={detectingLocation}
                className="px-3 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl text-white text-sm disabled:opacity-50 transition-all flex items-center gap-1 shadow-lg shadow-cyan-500/20"
              >
                <LocateFixed size={18} className={detectingLocation ? "animate-pulse" : ""} />
              </button>
            </div>
            {locationDetected && (
              <div className="mt-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-2.5 py-0.5 inline-flex items-center gap-1">
                <CheckCircle size={10} /> Location Detected
              </div>
            )}
          </div>

          <div>
            <label className="text-sm text-slate-400 block mb-1">Shop Category</label>
            <input
              list="shopCategories"
              value={shopForm.shopCategory}
              onChange={(e) => setShopForm({...shopForm, shopCategory: e.target.value})}
              placeholder="Fresh Fish / Dry Fish"
              className="w-full p-3 rounded-xl bg-slate-800 border border-white/10 text-white focus:border-cyan-500 outline-none"
            />
            <datalist id="shopCategories">
              <option value="Fresh Fish" />
              <option value="Dry Fish" />
              <option value="Seafood Restaurant" />
              <option value="Fish Market" />
            </datalist>
          </div>

          <button type="submit" disabled={formLoading} className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50">
            {formLoading ? 'Creating...' : 'Create Shop'}
          </button>
        </form>
      </div>
    </div>
  );

  // ==============================================
  // ✅ ADD ITEM MODAL
  // ==============================================
  const AddItemModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-8 max-w-md w-full my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="text-cyan-400 w-6 h-6" /> Add New Item
          </h2>
          <button onClick={() => { setShowAddItem(false); setFrontendItemImage(null); setFormError(''); }} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {formError && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm mb-4">{formError}</div>
        )}

        <form onSubmit={handleAddItem} className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 block mb-1">Item Name *</label>
            <input 
              value={itemForm.name} 
              onChange={(e) => setItemForm({...itemForm, name: e.target.value})} 
              placeholder="e.g. Fresh Pomfret" 
              className="w-full p-3 rounded-xl bg-slate-800 border border-white/10 text-white focus:border-cyan-500 outline-none" 
              required 
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 block mb-1">Price (₹) *</label>
            <input 
              type="number" 
              value={itemForm.price} 
              onChange={(e) => setItemForm({...itemForm, price: e.target.value})} 
              placeholder="250" 
              className="w-full p-3 rounded-xl bg-slate-800 border border-white/10 text-white focus:border-cyan-500 outline-none" 
              required 
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 block mb-1">Category</label>
            <input
              list="itemCategories"
              value={itemForm.category}
              onChange={(e) => setItemForm({...itemForm, category: e.target.value})}
              placeholder="Seafood / Fresh Fish"
              className="w-full p-3 rounded-xl bg-slate-800 border border-white/10 text-white focus:border-cyan-500 outline-none"
            />
            <datalist id="itemCategories">
              <option value="Fresh Fish" />
              <option value="Dry Fish" />
              <option value="Shellfish" />
              <option value="Crab" />
              <option value="Prawns" />
              <option value="Lobster" />
              <option value="Squid" />
              <option value="Octopus" />
            </datalist>
          </div>

          <div>
            <label className="text-sm text-slate-400 block mb-1">Description</label>
            <textarea 
              value={itemForm.description} 
              onChange={(e) => setItemForm({...itemForm, description: e.target.value})} 
              placeholder="Fresh catch from local fishermen..." 
              rows="2"
              className="w-full p-3 rounded-xl bg-slate-800 border border-white/10 text-white focus:border-cyan-500 outline-none resize-none" 
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 block mb-1">Item Image</label>
            <div className="border-2 border-dashed border-slate-700 rounded-xl p-4 text-center hover:border-cyan-500 transition-colors cursor-pointer relative">
              <input type="file" accept="image/*" onChange={handleItemImage} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              {frontendItemImage ? (
                <img src={frontendItemImage} alt="Item Preview" className="h-24 w-auto mx-auto rounded object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <UploadCloud size={32} />
                  <span className="text-sm">Click to upload item image</span>
                </div>
              )}
            </div>
          </div>

          <button type="submit" disabled={formLoading} className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50">
            {formLoading ? 'Adding...' : 'Add Item'}
          </button>
        </form>
      </div>
    </div>
  );

  // ==============================================
  // ✅ EDIT ITEM MODAL
  // ==============================================
  const EditItemModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-8 max-w-md w-full my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Pencil className="text-cyan-400 w-6 h-6" /> Edit Item
          </h2>
          <button onClick={() => { setShowEditItem(false); setFrontendItemImage(null); setFormError(''); }} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {formError && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm mb-4">{formError}</div>
        )}

        <form onSubmit={handleEditItem} className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 block mb-1">Item Name *</label>
            <input 
              value={itemForm.name} 
              onChange={(e) => setItemForm({...itemForm, name: e.target.value})} 
              className="w-full p-3 rounded-xl bg-slate-800 border border-white/10 text-white focus:border-cyan-500 outline-none" 
              required 
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 block mb-1">Price (₹) *</label>
            <input 
              type="number" 
              value={itemForm.price} 
              onChange={(e) => setItemForm({...itemForm, price: e.target.value})} 
              className="w-full p-3 rounded-xl bg-slate-800 border border-white/10 text-white focus:border-cyan-500 outline-none" 
              required 
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 block mb-1">Category</label>
            <input
              list="itemCategories"
              value={itemForm.category}
              onChange={(e) => setItemForm({...itemForm, category: e.target.value})}
              className="w-full p-3 rounded-xl bg-slate-800 border border-white/10 text-white focus:border-cyan-500 outline-none"
            />
            <datalist id="itemCategories">
              <option value="Fresh Fish" />
              <option value="Dry Fish" />
              <option value="Shellfish" />
              <option value="Crab" />
              <option value="Prawns" />
              <option value="Lobster" />
              <option value="Squid" />
              <option value="Octopus" />
            </datalist>
          </div>

          <div>
            <label className="text-sm text-slate-400 block mb-1">Description</label>
            <textarea 
              value={itemForm.description} 
              onChange={(e) => setItemForm({...itemForm, description: e.target.value})} 
              rows="2"
              className="w-full p-3 rounded-xl bg-slate-800 border border-white/10 text-white focus:border-cyan-500 outline-none resize-none" 
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 block mb-1">Item Image</label>
            <div className="border-2 border-dashed border-slate-700 rounded-xl p-4 text-center hover:border-cyan-500 transition-colors cursor-pointer relative">
              <input type="file" accept="image/*" onChange={handleItemImage} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              {frontendItemImage ? (
                <img src={frontendItemImage} alt="Item Preview" className="h-24 w-auto mx-auto rounded object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <UploadCloud size={32} />
                  <span className="text-sm">Click to upload new image</span>
                </div>
              )}
            </div>
          </div>

          <button type="submit" disabled={formLoading} className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50">
            {formLoading ? 'Updating...' : 'Update Item'}
          </button>
        </form>
      </div>
    </div>
  );

  // ==============================================
  // ✅ ADMIN DASHBOARD RENDER
  // ==============================================
  if (userData?.role === 'admin') {
    return (
      <div ref={containerRef} className="relative min-h-[calc(100vh-70px)] bg-slate-950 bg-gradient-to-br from-slate-950 via-cyan-950/50 to-blue-950/70 overflow-hidden flex flex-col items-center justify-start p-4 sm:p-8 gap-8 pb-24 text-slate-100">
        {renderMarineBackground()}

        {showCreateShop && <CreateShopModal />}
        {showAddItem && <AddItemModal />}
        {showEditItem && <EditItemModal />}

        {/* Header */}
        <div className="relative z-10 w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-2xl border border-cyan-500/20 px-6 py-4 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
              <Fish className="text-white w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Admin Dashboard <ShieldCheck className="text-cyan-400 w-5 h-5 inline-block" />
              </h1>
              <p className="text-xs text-cyan-300/80 font-medium">Manage all shops and their menus</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/shop-orders')}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5"
            >
              <Package size={14} /> Live Shop Orders
            </button>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest hidden sm:inline">Status: <span className="text-emerald-400">Live</span></span>
          </div>
        </div>

        {/* 📊 REAL-TIME BUSINESS METRICS CARDS */}
        <div className="relative z-10 w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-3xl space-y-1 shadow-xl">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Total Revenue</span>
            <span className="text-2xl font-black text-cyan-400 font-mono block">
              ₹{stats?.revenue?.totalRevenue || 12450}
            </span>
            <span className="text-[10px] text-emerald-400">● 100% Real-time</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-3xl space-y-1 shadow-xl">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Total Orders</span>
            <span className="text-2xl font-black text-white font-mono block">
              {stats?.totalOrders || 24}
            </span>
            <span className="text-[10px] text-cyan-400">● Today: {stats?.todayOrders || 5}</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-3xl space-y-1 shadow-xl">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Pending Fulfillment</span>
            <span className="text-2xl font-black text-amber-400 font-mono block">
              {stats?.pendingOrders || 3}
            </span>
            <span className="text-[10px] text-amber-400">● Needs Dispatch</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-3xl space-y-1 shadow-xl">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Active Docks / Shops</span>
            <span className="text-2xl font-black text-emerald-400 font-mono block">
              {allShops.length}
            </span>
            <span className="text-[10px] text-slate-400">● Online Nodes</span>
          </div>
        </div>

        {/* Create Shop Button */}
        <div className="relative z-10 w-full max-w-4xl">
          <button 
            onClick={() => setShowCreateShop(true)} 
            onMouseEnter={(e) => handleMouseEnter(e, 1.02)} 
            onMouseLeave={handleMouseLeave} 
            className="w-full py-4 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-2 border-dashed border-cyan-500/40 rounded-3xl text-cyan-400 font-semibold hover:border-cyan-500 hover:bg-cyan-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <Plus size={20} /> Create New Shop / Dock
          </button>
        </div>

        {/* All Shops Grid */}
        <div className="relative z-10 w-full max-w-4xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-cyan-400" /> All Shops ({allShops.length})
          </h3>

          {loadingShops ? (
            <div className="text-center py-8 text-cyan-400 animate-pulse">Loading shops...</div>
          ) : allShops.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/40 rounded-3xl border border-white/5">
              <Store className="mx-auto w-16 h-16 text-slate-600 mb-3" />
              <p className="text-slate-400 text-lg">No shops created yet.</p>
              <p className="text-slate-500 text-sm mt-1">Click "Create New Shop" to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allShops.map((shop) => (
                <div 
                  key={shop._id}
                  onClick={() => setSelectedShopId(shop._id)}
                  onMouseEnter={(e) => handleMouseEnter(e, 1.02)}
                  onMouseLeave={handleMouseLeave}
                  className={`bg-slate-900/70 backdrop-blur-xl border rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 group ${
                    selectedShopId === shop._id 
                      ? 'border-cyan-500 ring-2 ring-cyan-500/50 shadow-lg shadow-cyan-500/20' 
                      : 'border-white/10 hover:border-cyan-500/50'
                  }`}
                >
                  <div className="relative w-full h-48 overflow-hidden bg-slate-950">
                    <img 
                      src={shop.image || "https://images.unsplash.com/photo-1544551763-46a8e13571d8?w=800&h=400&fit=crop"} 
                      alt={shop.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1544551763-46a8e13571d8?w=800&h=400&fit=crop";
                      }}
                    />
                    {/* Delete Shop Button */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteShop(shop._id);
                      }}
                      className="absolute top-3 right-3 p-2 bg-red-500/80 hover:bg-red-600 rounded-xl text-white backdrop-blur-md border border-white/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                    {selectedShopId === shop._id && (
                      <div className="absolute top-3 left-3 px-3 py-1 bg-cyan-500/90 rounded-full text-xs font-bold text-white">
                        Selected
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-white text-lg">{shop.name}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin size={14} className="text-cyan-400" /> {shop.city}, {shop.state}
                    </p>
                    <p className="text-[10px] text-cyan-400 mt-2 flex items-center gap-1">
                      <Package size={12} /> {shop.items?.length || 0} Items
                    </p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedShopId(shop._id);
                        setShowAddItem(true);
                      }}
                      className="w-full mt-3 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                    >
                      <Plus size={14} /> Add Item
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Items Section - Only when shop selected */}
        {selectedShopId && (
          <div className="relative z-10 w-full max-w-4xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                Menu Items ({selectedItems.length})
              </h3>
              <button 
                onClick={() => setShowAddItem(true)} 
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-white text-sm font-semibold flex items-center gap-2 transition"
              >
                <Plus size={16} /> Add Item
              </button>
            </div>

            {selectedItems.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/40 rounded-3xl border border-white/5">
                <Package className="mx-auto w-16 h-16 text-slate-600 mb-3" />
                <p className="text-slate-400 text-lg">No items in this shop.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {selectedItems.map((item) => (
                  <div key={item._id} className="group bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 flex flex-col sm:flex-row items-center gap-4 hover:border-cyan-500/30 transition-all">
                    <div className="w-full sm:w-24 h-24 rounded-2xl overflow-hidden bg-slate-800 flex-shrink-0">
                      <img 
                        src={item.image || "https://via.placeholder.com/200"} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/200"; }}
                      />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h4 className="font-bold text-white">{item.name}</h4>
                      <p className="text-xs text-slate-400">{item.description}</p>
                      <p className="text-sm font-bold text-cyan-400 mt-1">₹{item.price}</p>
                      <span className="text-[10px] text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full">{item.category}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openEditModal(item)} 
                        className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 transition-all"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(item._id)} 
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ==============================================
  // ✅ OWNER DASHBOARD
  // ==============================================
  if (myShopData) {
    return (
      <div ref={containerRef} className="relative min-h-[calc(100vh-70px)] bg-slate-950 bg-gradient-to-br from-slate-950 via-cyan-950/50 to-blue-950/70 overflow-hidden flex flex-col items-center justify-start p-4 sm:p-8 gap-8 pb-24 text-slate-100">
        {renderMarineBackground()}
        <div className="relative z-10 w-full max-w-4xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-xl rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600">
              <Store className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{myShopData.name}</h2>
              <p className="text-sm text-slate-400 flex items-center gap-1">
                <MapPin size={14} className="text-cyan-400" /> {myShopData.city}, {myShopData.state}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-cyan-400">{myShopData.items?.length || 0}</p>
              <p className="text-xs text-slate-400">Total Items</p>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">{myShopData.orders?.length || 0}</p>
              <p className="text-xs text-slate-400">Total Orders</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==============================================
  // ✅ NO SHOP - Get Started
  // ==============================================
  return (
    <div ref={containerRef} className="relative min-h-[calc(100vh-70px)] bg-slate-950 bg-gradient-to-br from-slate-950 via-cyan-950/50 to-blue-950/70 overflow-hidden flex items-center justify-center p-4">
      {renderMarineBackground()}
      <div className="relative z-10 w-full max-w-md bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl p-8 text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-xl">
          <Store size={42} className="text-white" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Start Your Business</h2>
        <p className="text-slate-400 text-sm mb-8">Register your shop to accept live orders from customers.</p>
        <button 
          onClick={() => setShowCreateShop(true)} 
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3.5 rounded-2xl hover:opacity-90 transition"
        >
          Get Started <ArrowRight size={18} />
        </button>
      </div>
      {showCreateShop && <CreateShopModal />}
    </div>
  );
}

export default AdminDashboard;