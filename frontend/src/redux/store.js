import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice.js';
import ownerReducer from './ownerSlice.js'; // ✅ 1. Import karo ownerSlice

const store = configureStore({
  reducer: {
    user: userReducer,
    owner: ownerReducer, // ✅ 2. Register karo ownerReducer
  },
});

export default store;