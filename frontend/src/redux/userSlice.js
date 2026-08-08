import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",

    initialState: {
        userData: null,
        city: null,
        address: null,
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
    },
});

export const { setUserData, setCity, setAddress } = userSlice.actions;

export default userSlice.reducer;