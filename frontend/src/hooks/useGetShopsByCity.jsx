import { useEffect } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { serverUrl } from '../App';
import { setShops } from '../redux/userSlice';

export const useGetShopsByCity = () => {
    const dispatch = useDispatch();
    const { city } = useSelector((state) => state.user);

    useEffect(() => {
        if (!city) return;

        const fetchShops = async () => {
            try {
                const response = await axios.get(`${serverUrl}/api/shop/get-by-city/${city}`, {
                    withCredentials: true
                });

                if (response.data.success || response.data.shops) {
                    dispatch(setShops(response.data.shops));
                }
            } catch (err) {
                console.error("Error fetching shops by city:", err);
                dispatch(setShops([]));
            }
        };

        fetchShops();
    }, [city, dispatch]);
};