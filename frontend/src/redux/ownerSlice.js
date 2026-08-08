import { createSlice } from "@reduxjs/toolkit";

const ownerSlice = createSlice({
    name: "owner",
    initialState: {
        myShopData: null
    },
    reducers: {
        setMyShopData: (state, action) => {
            state.myShopData = action.payload;
        }
    }
});

// ✅ Fix: Comma (,) ki jagah equals (=) use kiya hai
export const { setMyShopData } = ownerSlice.actions;
export default ownerSlice.reducer;