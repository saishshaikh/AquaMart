import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaShoppingCart, FaTrash, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { removeFromCart, updateQuantity, clearCart } from '../redux/userSlice';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { cartitems } = useSelector((state) => state.user);

  // ✅ Total Price Calculation (100% correct)
  const totalPrice = cartitems.reduce((acc, item) => {
    const weightInGrams = item.quantity || 1000; // Default 1kg
    const pricePerGram = item.price / 1000;
    return acc + (pricePerGram * weightInGrams);
  }, 0);

  // ✅ MAIN WEIGHT LOGIC (Input aur Buttons ke liye)
  const handleWeightChange = (item, newWeightVal) => {
    const itemId = item._id || item.id;
    let finalWeight = 0;

    // 1. Agar number hai toh seedha lo
    if (typeof newWeightVal === 'number') {
      finalWeight = newWeightVal;
    } 
    // 2. Agar string hai (jaise '500g', '1.5kg')
    else if (typeof newWeightVal === 'string') {
      const val = newWeightVal.toLowerCase().trim();
      if (val.includes('kg')) {
        finalWeight = parseFloat(val) * 1000;
      } else if (val.includes('g')) {
        finalWeight = parseFloat(val);
      } else {
        finalWeight = parseFloat(val);
      }
    }

    // Agar valid number hai aur 0 se kam nahi hai
    if (!isNaN(finalWeight) && finalWeight >= 0) {
      dispatch(updateQuantity({ _id: itemId, quantity: finalWeight }));
    }
  };

  const handleRemove = (item) => {
    dispatch(removeFromCart(item));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/home')}
              className="p-2.5 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <FaArrowLeft className="text-cyan-600 w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                My Cart
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
                {cartitems.length} items in your basket
              </p>
            </div>
          </div>
        </div>

        {/* Cart Content */}
        {cartitems.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto">
            <FaShoppingCart className="w-16 h-16 text-cyan-400 mx-auto mb-4 opacity-60" />
            <h2 className="text-2xl font-bold text-slate-700">Your Cart is Empty!</h2>
            <Link to="/home" className="inline-block mt-4 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-2xl shadow-xl hover:scale-105 transition-all">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            
            {/* LEFT: Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cartitems.map((item) => {
                // ✅ Force default weight to 1000g if missing
                const currentWeight = item.quantity > 0 ? item.quantity : 1000; 
                
                // ✅ Display text (1 kg, 750 g)
                const displayWeight = currentWeight >= 1000 
                  ? `${(currentWeight / 1000).toFixed(1)} kg` 
                  : `${currentWeight} g`;
                
                // ✅ Accurate Price Calculation
                const itemPrice = (item.price / 1000) * currentWeight;

                return (
                  <div 
                    key={item._id || item.id} 
                    className="group bg-white/90 rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl p-3 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center border border-white/60"
                  >
                    <div className="w-full sm:w-24 sm:h-24 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 w-full">
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-1">
                        <h3 className="font-bold text-lg text-slate-800">{item.name}</h3>
                        {/* ✅ Price ab weight ke hisaab se dikhega */}
                        <p className="text-cyan-700 font-black text-base mt-1 sm:mt-0">
                          ₹{itemPrice.toFixed(0)}
                        </p>
                      </div>
                      
                      {/* WEIGHT INPUT FIELD */}
                      <div className="flex flex-wrap items-center gap-3 mt-3 bg-slate-50 p-2 rounded-xl">
                        <span className="text-xs font-semibold text-slate-600 mr-1">Weight:</span>
                        
                        <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                          <input 
                            type="text"
                            value={displayWeight}
                            onChange={(e) => handleWeightChange(item, e.target.value)}
                            onBlur={(e) => handleWeightChange(item, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleWeightChange(item, e.target.value);
                                e.target.blur();
                              }
                            }}
                            className="w-20 sm:w-24 px-2 py-1 bg-transparent outline-none text-slate-800 font-semibold text-sm text-center"
                            placeholder="1kg"
                          />
                        </div>

                        {/* ✅ 250g + and - BUTTONS */}
                        <div className="flex gap-1">
                          <button 
                            onClick={() => {
                              const current = item.quantity || 1000;
                              const newWeight = Math.max(0, current - 250);
                              handleWeightChange(item, newWeight);
                            }}
                            className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-sm font-bold transition-colors shadow-sm"
                          >-</button>
                          <button 
                            onClick={() => {
                              const current = item.quantity || 1000;
                              const newWeight = current + 250;
                              handleWeightChange(item, newWeight);
                            }}
                            className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-sm font-bold transition-colors shadow-sm"
                          >+</button>
                        </div>

                        {/* Remove Button */}
                        <button 
                          onClick={() => handleRemove(item)}
                          className="flex items-center gap-1 text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ml-auto"
                        >
                          <FaTrash size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT: Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 bg-white/90 rounded-3xl shadow-2xl p-5 sm:p-6 border border-white/60">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 mb-5 flex items-center gap-2">
                  <FaCheckCircle className="text-cyan-500" /> Order Summary
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-bold text-slate-800">₹{totalPrice.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Delivery</span>
                    <span className="text-emerald-600 font-bold bg-emerald-50 px-2 rounded-full">FREE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Packaging</span>
                    <span className="font-medium">₹20</span>
                  </div>
                </div>
                
                <div className="border-t border-slate-200 my-4 pt-4 flex justify-between text-lg font-black text-slate-800">
                  <span>Total</span>
                  <span className="text-cyan-700">₹{(totalPrice + 20).toFixed(0)}</span>
                </div>
                
                <button 
                  className="w-full mt-4 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-2xl shadow-xl hover:scale-[1.02] transition-all"
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout →
                </button>

                <button 
                  onClick={() => dispatch(clearCart())}
                  className="w-full mt-2 py-2 text-red-500 text-sm font-semibold hover:bg-red-50 rounded-2xl transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;