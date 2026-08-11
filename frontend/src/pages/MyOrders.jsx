import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import { FaArrowLeft, FaBox, FaClock, FaMapMarkerAlt, FaRupeeSign } from 'react-icons/fa';

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${serverUrl}/api/order/my-orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setOrders(response.data.orders);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/home')} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-cyan-600 transition-colors">
          <FaArrowLeft /> Back to Home
        </button>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>
        
        {loading ? (
          <div className="text-center py-10">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-10 text-center">
            <FaBox className="w-12 h-12 text-cyan-400 mx-auto mb-4 opacity-60" />
            <h2 className="text-xl font-bold text-gray-700">No orders yet.</h2>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Order ID</p>
                    <p className="font-mono font-bold text-gray-800">#{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Total</p>
                    <p className="text-lg font-bold text-emerald-600">₹{order.totalAmount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 border-t pt-4">
                  <span className="flex items-center gap-1"><FaClock /> {new Date(order.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><FaMapMarkerAlt /> {order.deliveryAddress?.text?.slice(0, 30)}...</span>
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">{order.paymentMethod}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;