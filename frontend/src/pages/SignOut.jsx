import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import { setUserData } from '../redux/userSlice';

const SignOut = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      // 1. Backend ko signout request bhejo (Optional, lekin safe hai)
      await axios.post(
        `${serverUrl}/api/auth/signout`,
        {},
        { withCredentials: true }
      );

      // 2. LocalStorage se token hatao
      localStorage.removeItem('token');

      // 3. Redux state clear karo
      dispatch(setUserData(null));

      // 4. User ko Login page par bhejo
      navigate('/signin');

    } catch (error) {
      console.error("SignOut Error:", error);
      // Agar backend error bhi aaya, toh bhi frontend se logout kar do
      localStorage.removeItem('token');
      dispatch(setUserData(null));
      navigate('/signin');
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl transition-all duration-200 border border-red-500/20 hover:border-red-500/40 text-sm font-medium"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      <span>Sign Out</span>
    </button>
  );
};

export default SignOut;