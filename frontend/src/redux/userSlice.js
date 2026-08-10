import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",

    initialState: {
        userData: null,
        city: null,
        address: null,
        shops: [], // City ki shops store karne ke liye
        items: [], // ✅ City ke items store karne ke liye state add kar di hai
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

        // Shops ko Redux me set/store karne ke liye reducer
        setShops: (state, action) => {
            state.shops = action.payload;
        },

        // ✅ Items ko Redux me set/store karne ke liye reducer
        setItems: (state, action) => {
            state.items = action.payload;
        },
    },
});

export const { setUserData, setCity, setAddress, setShops, setItems } = userSlice.actions;

export default userSlice.reducer;