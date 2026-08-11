import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice.js';
import ownerReducer from './ownerSlice.js';
import mapReducer from './mapSlice.js'; // ✅ IMPORT MAP SLICE

const store = configureStore({
  reducer: {
    user: userReducer,
    owner: ownerReducer,
    map: mapReducer, // ✅ ADD MAP REDUCER HERE
  },
});

export default store;