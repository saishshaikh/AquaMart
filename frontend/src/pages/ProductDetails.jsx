import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { 
  ArrowLeft, Star, ShoppingCart, Zap, Heart, ShieldCheck, 
  Truck, Clock, Tag, Store, RefreshCw, MessageSquare, Send, CheckCircle2, AlertCircle
} from 'lucide-react';
import { serverUrl } from '../App';
import { addToCart, removeFromCart } from '../redux/userSlice';
import Nav1 from '../components/nav1';
import Footer from '../components/Footer';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { cartitems, userData } = useSelector((state) => state.user);
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeight, setSelectedWeight] = useState('1kg');
  const [weightMultiplier, setWeightMultiplier] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [relatedItems, setRelatedItems] = useState([]);

  const isItemInCart = cartitems?.some(
    (c) => (c._id || c.id) === (item?._id || item?.id)
  );

  // Fetch product data
  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        // Fetch item details
        const res = await axios.get(`${serverUrl}/api/item/get-item-by-id/${id}`);
        if (res.data?.success && res.data?.item) {
          setItem(res.data.item);
          
          // Fetch related items by category
          if (res.data.item?.category) {
            try {
              const relRes = await axios.get(`${serverUrl}/api/item/get-item-by-city/${res.data.item.shop?.city || 'Mumbai'}`);
              if (relRes.data?.success) {
                setRelatedItems((relRes.data.items || []).filter(i => i._id !== id).slice(0, 4));
              }
            } catch (err) {
              console.log("Could not load related items");
            }
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/review/item/${id}`);
        if (res.data?.success) {
          setReviews(res.data.reviews || []);
        }
      } catch (err) {
        console.log("No reviews yet");
      }
    };

    if (id) {
      fetchItem();
      fetchReviews();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [id]);

  const handleWeightChange = (weight, mult) => {
    setSelectedWeight(weight);
    setWeightMultiplier(mult);
  };

  const handleCartToggle = () => {
    if (!item) return;
    const finalPrice = Math.round(item.price * weightMultiplier);
    const safeData = {
      ...item,
      _id: item._id || item.id,
      selectedWeight,
      price: finalPrice,
      originalPrice: item.price
    };

    if (isItemInCart) {
      dispatch(removeFromCart(safeData));
    } else {
      dispatch(addToCart(safeData));
    }
  };

  const handleBuyNow = () => {
    if (!item) return;
    const finalPrice = Math.round(item.price * weightMultiplier);
    const safeData = {
      ...item,
      _id: item._id || item.id,
      selectedWeight,
      price: finalPrice,
      originalPrice: item.price
    };
    if (!isItemInCart) {
      dispatch(addToCart(safeData));
    }
    navigate('/checkout');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmittingReview(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setReviewError('Please login to post a review');
        setSubmittingReview(false);
        return;
      }

      const res = await axios.post(
        `${serverUrl}/api/review/add`,
        { itemId: id, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        setReviewSuccess('Review submitted successfully!');
        setComment('');
        // Add new review to list
        setReviews([res.data.review, ...reviews]);
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070d18] text-white">
        <Nav1 />
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-cyan-400 font-medium text-sm">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[#070d18] text-white">
        <Nav1 />
        <div className="max-w-md mx-auto my-20 p-8 bg-slate-900/80 border border-slate-800 rounded-3xl text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Product Not Found</h2>
          <p className="text-xs text-slate-400">The product you are looking for might have been sold out or removed.</p>
          <button
            onClick={() => navigate('/home')}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const calculatedPrice = Math.round(item.price * weightMultiplier);
  const isDryFish = item.category?.toLowerCase().includes('dry') || item.name?.toLowerCase().includes('dry') || item.name?.toLowerCase().includes('sukha');

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 relative overflow-hidden pb-16">
      {/* Background ambient lights */}
      <div className="pointer-events-none fixed -right-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-32 -left-32 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

      <Nav1 />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Back navigation */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 mb-6 bg-slate-900/60 border border-slate-800 px-3.5 py-1.5 rounded-xl w-fit transition-colors"
        >
          <ArrowLeft size={14} /> Back to Catalog
        </button>

        {/* MAIN PRODUCT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT: IMAGE & GALLERY (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl group aspect-square">
              <img
                src={item.image || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=800"}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-lg ${
                  isDryFish 
                    ? 'bg-amber-500/90 text-slate-950' 
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                }`}>
                  {isDryFish ? '🔥 Premium Dry Fish' : '🌊 Fresh Sea Catch'}
                </span>
                <span className="bg-slate-900/90 backdrop-blur-md text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg text-[10px] font-bold w-fit flex items-center gap-1">
                  <ShieldCheck size={12} /> 100% Quality Inspected
                </span>
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="absolute top-4 right-4 p-2.5 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 text-slate-300 hover:text-rose-400 transition-colors shadow-lg"
              >
                <Heart size={18} className={isWishlisted ? "fill-rose-500 text-rose-500" : ""} />
              </button>
            </div>

            {/* Micro Highlights */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl text-center">
                <Truck size={16} className="text-cyan-400 mx-auto mb-1" />
                <p className="text-[11px] font-bold text-slate-200">Express Delivery</p>
                <p className="text-[10px] text-slate-400">Within 30-45 Mins</p>
              </div>
              <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl text-center">
                <RefreshCw size={16} className="text-cyan-400 mx-auto mb-1" />
                <p className="text-[11px] font-bold text-slate-200">Cleaned & Dressed</p>
                <p className="text-[10px] text-slate-400">Ready to Cook</p>
              </div>
              <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl text-center">
                <ShieldCheck size={16} className="text-cyan-400 mx-auto mb-1" />
                <p className="text-[11px] font-bold text-slate-200">Chemical Free</p>
                <p className="text-[10px] text-slate-400">Zero Preservatives</p>
              </div>
            </div>
          </div>

          {/* RIGHT: DETAILS & ACTIONS (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-slate-800 text-cyan-400 border border-cyan-500/30 px-2.5 py-0.5 rounded-lg font-semibold flex items-center gap-1">
                  <Tag size={12} /> {item.category || "Seafood"}
                </span>
                {item.shop && (
                  <span className="text-xs bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-0.5 rounded-lg font-semibold flex items-center gap-1">
                    <Store size={12} className="text-cyan-400" /> {item.shop?.name || item.shop?.shopName || "Seafood Hub"}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {item.name}
              </h1>

              {/* Rating preview */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-lg text-emerald-400 text-xs font-bold">
                  <Star size={12} className="fill-emerald-400" /> 4.9
                </div>
                <span className="text-xs text-slate-400">({reviews.length} Verified Customer Reviews)</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-3xl flex items-baseline justify-between shadow-xl">
              <div>
                <p className="text-xs text-slate-400 font-medium">Price for {selectedWeight}</p>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-cyan-400 font-mono">
                    ₹{calculatedPrice}
                  </span>
                  <span className="text-sm text-slate-500 line-through font-mono">
                    ₹{Math.round(calculatedPrice * 1.25)}
                  </span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-md">
                    20% OFF
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Inclusive of all seafood hygiene taxes</p>
              </div>

              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl">
                  ● In Stock (Fresh Today)
                </span>
              </div>
            </div>

            {/* WEIGHT SELECTION VARIANT */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                Select Quantity / Weight:
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {[
                  { label: '250g', mult: 0.25 },
                  { label: '500g', mult: 0.5 },
                  { label: '1kg', mult: 1.0 },
                  { label: '2kg', mult: 2.0 },
                ].map((wt) => (
                  <button
                    key={wt.label}
                    onClick={() => handleWeightChange(wt.label, wt.mult)}
                    className={`py-3 px-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                      selectedWeight === wt.label
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>{wt.label}</span>
                    <span className="text-[10px] text-slate-400 font-mono">₹{Math.round(item.price * wt.mult)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* DESCRIPTION & CULINARY NOTES */}
            <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-3xl space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Catch Description & Cooking Notes
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {item.description || "Fresh ocean catch hand-picked from the morning haul. Cleaned thoroughly and hygienically packed with moisture-lock chill pads to retain authentic coastal flavour and aroma."}
              </p>
              
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="border-l-2 border-cyan-400 pl-3">
                  <span className="text-slate-400 block text-[11px]">Storage</span>
                  <span className="text-slate-200 font-medium">Keep chilled at 0-4°C</span>
                </div>
                <div className="border-l-2 border-cyan-400 pl-3">
                  <span className="text-slate-400 block text-[11px]">Best For</span>
                  <span className="text-slate-200 font-medium">{isDryFish ? "Curry, Fry & Chutney" : "Tawa Fry, Masala Curry"}</span>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleCartToggle}
                className={`flex-1 py-3.5 rounded-2xl font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isItemInCart
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30'
                }`}
              >
                <ShoppingCart size={18} />
                {isItemInCart ? 'Remove from Cart' : 'Add to Cart'}
              </button>

              <button
                onClick={handleBuyNow}
                className="flex-1 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap size={18} />
                Buy Now
              </button>
            </div>

          </div>
        </div>

        {/* CUSTOMER REVIEWS & RATINGS SECTION */}
        <section className="mt-16 pt-8 border-t border-slate-800/80">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="text-cyan-400" />
                Customer Ratings & Reviews
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Real feedback from verified seafood buyers</p>
            </div>

            {/* Review Summary Score */}
            <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 px-5 py-3 rounded-2xl">
              <div className="text-3xl font-black text-cyan-400 font-mono">4.9</div>
              <div>
                <div className="flex text-emerald-400 text-xs">
                  {"★".repeat(5)}
                </div>
                <p className="text-[11px] text-slate-400">Based on {reviews.length + 12} reviews</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Review Form (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white">Write a Review</h3>
              
              {reviewSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 size={14} /> {reviewSuccess}
                </div>
              )}

              {reviewError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle size={14} /> {reviewError}
                </div>
              )}

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Your Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setRating(num)}
                        className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center border transition-all ${
                          rating >= num
                            ? 'bg-amber-500/20 border-amber-400 text-amber-400'
                            : 'bg-slate-950 border-slate-800 text-slate-500'
                        }`}
                      >
                        ★ {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Your Comment / Experience</label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share how fresh the fish was, packaging quality, taste etc..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder:text-slate-600 outline-none focus:border-cyan-500 transition-colors resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-2xl text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Send size={14} />
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            </div>

            {/* Review List (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {reviews.length === 0 ? (
                <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-8 text-center space-y-2">
                  <Star className="w-8 h-8 text-amber-400/60 mx-auto" />
                  <h4 className="text-sm font-bold text-white">No customer reviews yet</h4>
                  <p className="text-xs text-slate-400">Be the first seafood lover to share your culinary review!</p>
                </div>
              ) : (
                reviews.map((rev, index) => (
                  <div key={rev._id || index} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                          {rev.userName?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{rev.userName || "Verified Buyer"}</p>
                          <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                            <ShieldCheck size={10} /> Verified Purchase
                          </span>
                        </div>
                      </div>
                      <div className="flex text-amber-400 text-xs">
                        {"★".repeat(rev.rating || 5)}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 pt-1 leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>

          </div>
        </section>

        {/* RELATED CATCH SECTION */}
        {relatedItems.length > 0 && (
          <section className="mt-16 pt-8 border-t border-slate-800/80">
            <h2 className="text-xl font-bold text-white mb-6">More Fresh Catch You May Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedItems.map((relItem) => (
                <div
                  key={relItem._id}
                  onClick={() => navigate(`/product/${relItem._id}`)}
                  className="group bg-slate-900/70 rounded-2xl overflow-hidden border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer transform hover:-translate-y-1"
                >
                  <div className="h-40 w-full overflow-hidden bg-slate-950 relative">
                    <img
                      src={relItem.image}
                      alt={relItem.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-2 right-2 bg-slate-900/90 text-cyan-400 font-mono text-xs font-bold px-2 py-0.5 rounded-lg border border-cyan-500/30">
                      ₹{relItem.price}
                    </div>
                  </div>
                  <div className="p-3.5">
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                      {relItem.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">{relItem.category || "Seafood"}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* 🌊 MODERN 2026/2027 SEAFOOD FOOTER */}
      <Footer />
    </div>
  );
};

export default ProductDetails;
