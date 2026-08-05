// src/redux/store.js

import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice.js';

const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

export default store ;
