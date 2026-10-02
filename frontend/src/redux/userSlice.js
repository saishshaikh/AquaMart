import { createSlice } from "@reduxjs/toolkit";

const initialTheme = localStorage.getItem("aquamart_theme") || "dark";
if (typeof document !== "undefined") {
    if (initialTheme === "light") {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
    } else {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
    }
}

const userSlice = createSlice({
    name: "user",

    initialState: {
        userData: null,
        city: null,
        address: null,
        shops: [],
        items: [],
        cartitems: [],
        theme: initialTheme,
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

        toggleTheme: (state) => {
            const nextTheme = state.theme === "light" ? "dark" : "light";
            state.theme = nextTheme;
            localStorage.setItem("aquamart_theme", nextTheme);
            if (typeof document !== "undefined") {
                if (nextTheme === "light") {
                    document.documentElement.classList.add("light");
                    document.documentElement.classList.remove("dark");
                } else {
                    document.documentElement.classList.add("dark");
                    document.documentElement.classList.remove("light");
                }
            }
        },

        setTheme: (state, action) => {
            const nextTheme = action.payload;
            state.theme = nextTheme;
            localStorage.setItem("aquamart_theme", nextTheme);
            if (typeof document !== "undefined") {
                if (nextTheme === "light") {
                    document.documentElement.classList.add("light");
                    document.documentElement.classList.remove("dark");
                } else {
                    document.documentElement.classList.add("dark");
                    document.documentElement.classList.remove("light");
                }
            }
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
                existingItem.quantity = existingItem.quantity || 1000;
            } else {
                state.cartitems.push({ 
                    ...item, 
                    quantity: 1000,
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

        updateQuantity: (state, action) => {
            const { _id, id, quantity } = action.payload;
            const itemId = _id || id;
            
            const item = state.cartitems.find(
                (cartItem) => (cartItem._id || cartItem.id) === itemId
            );
            
            if (item) {
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
    resetUserState,
    toggleTheme,
    setTheme
} = userSlice.actions;

export default userSlice.reducer;