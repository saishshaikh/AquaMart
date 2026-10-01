import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setMyOrders } from "../redux/ownerSlice";
import { serverUrl } from "../App";

export const useGetShopOrders = () => {
    const dispatch = useDispatch();
    const myOrders = useSelector((state) => state.owner.myOrders); // Redux state se data
    const [loading, setLoading] = useState(true);

    const fetchShopOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${serverUrl}/api/order/shop-orders`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                withCredentials: true
            });

            if (response.data.success) {
                // Redux store me dispatch kar rahe hain
                dispatch(setMyOrders(response.data.orders));
            }
        } catch (error) {
            console.error("❌ Error fetching shop orders:", error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShopOrders();
    }, [dispatch]);

    return { orders: myOrders, loading, refetch: fetchShopOrders };
};

export default useGetShopOrders;