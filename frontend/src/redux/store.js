import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice.js';
import ownerReducer from './ownerSlice.js';

const store = configureStore({
  reducer: {
    user: userReducer, // Yeh userReducer ab aapke user data, city, address ke sath-sath shops ko bhi manage karega
    owner: ownerReducer,
  },
});

export default store;