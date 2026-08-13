import { createSlice } from "@reduxjs/toolkit";

const ownerSlice = createSlice({
    name: "owner",
    initialState: {
        myShopData: null,
        myOrders: [] // 👈 Orders store karne ke liye array add kiya
    },
    reducers: {
        setMyShopData: (state, action) => {
            state.myShopData = action.payload;
        },
        setMyOrders: (state, action) => {
            state.myOrders = action.payload; // 👈 Customer Orders update karne ke liye reducer
        },
        updateOrderStatusLocal: (state, action) => {
            const { orderId, shopOrderId, newStatus } = action.payload;
            const order = state.myOrders.find(o => o._id === orderId);
            if (order) {
                const shopOrder = order.shopOrders.find(so => so._id === shopOrderId);
                if (shopOrder) {
                    shopOrder.shopStatus = newStatus;
                }
            }
        }
    }
});

export const { setMyShopData, setMyOrders, updateOrderStatusLocal } = ownerSlice.actions;
export default ownerSlice.reducer;