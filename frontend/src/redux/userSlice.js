import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",

    initialState: {
        userData: null,
        city: null,
        address: null,
        shops: [],
        items: [],
        cartitems: [],
    },

    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload;
        },

        setCity: (state, action) => {
            state.city = action.payload;
        },

        setAddress: (state, action) => {
            state.address = action.payload;
        },

        setShops: (state, action) => {
            state.shops = action.payload;
        },

        setItems: (state, action) => {
            state.items = action.payload;
        },

        // ==========================================
        // 🟢 FIXED CART REDUCERS (Weight = Grams)
        // ==========================================
        
        addToCart: (state, action) => {
            const item = action.payload;
            const itemId = item._id || item.id;
            
            const existingItem = state.cartitems.find(
                (cartItem) => (cartItem._id || cartItem.id) === itemId
            );

            if (existingItem) {
                // 🟢 Agar item pehle se hai, toh kuch mat karo (ya default 1kg rahne do)
                existingItem.quantity = existingItem.quantity || 1000;
            } else {
                // 🟢 Naya item add karte waqt DEFAULT 1000g (1kg) set karo
                state.cartitems.push({ 
                    ...item, 
                    quantity: 1000, // 🟢 YAHAN FIX HAI! 1kg = 1000g
                    _id: itemId 
                });
            }
        },

        removeFromCart: (state, action) => {
            const item = action.payload;
            const itemId = item._id || item.id;
            
            state.cartitems = state.cartitems.filter(
                (cartItem) => (cartItem._id || cartItem.id) !== itemId
            );
        },

        // 🟢 FIXED UPDATE QUANTITY (Direct Weight Set)
        updateQuantity: (state, action) => {
            const { _id, id, quantity } = action.payload;
            const itemId = _id || id;
            
            const item = state.cartitems.find(
                (cartItem) => (cartItem._id || cartItem.id) === itemId
            );
            
            if (item) {
                // 🟢 Seedha quantity (grams) set kar do
                item.quantity = quantity;
            }
        },

        clearCart: (state) => {
            state.cartitems = [];
        },

        resetUserState: (state) => {
            state.userData = null;
            state.city = null;
            state.address = null;
            state.shops = [];
            state.items = [];
            state.cartitems = [];
        },
    },
});

export const { 
    setUserData, 
    setCity, 
    setAddress, 
    setShops, 
    setItems, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart,
    resetUserState
} = userSlice.actions;

export default userSlice.reducer;