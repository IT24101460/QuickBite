import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const STORAGE_KEY = '@quickbite_order_statuses';
const POLL_INTERVAL_MS = 15000;

const STATUS_TITLES = {
    pending: 'Order pending',
    confirmed: 'Order confirmed',
    preparing: 'Order preparing',
    ready: 'Order ready',
    completed: 'Order completed',
    cancelled: 'Order cancelled',
};

export default function OrderStatusNotifier() {
    const { user, role, isAdmin } = useAuth();
    const initializedRef = useRef(false);
    const pollingRef = useRef(false);

    useEffect(() => {
        if (!user || role === 'owner' || isAdmin) {
            initializedRef.current = false;
            return undefined;
        }

        let mounted = true;

        const checkOrderStatuses = async () => {
            if (pollingRef.current) return;
            pollingRef.current = true;

            try {
                const [res, savedStatuses] = await Promise.all([
                    API.get('/orders/my'),
                    AsyncStorage.getItem(STORAGE_KEY),
                ]);

                if (!mounted) return;

                const orders = res.data?.orders || [];
                const previous = savedStatuses ? JSON.parse(savedStatuses) : {};
                const nextStatuses = {};
                const changedOrder = orders.find(order => {
                    nextStatuses[order._id] = order.status;
                    return initializedRef.current && previous[order._id] && previous[order._id] !== order.status;
                });

                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextStatuses));
                initializedRef.current = true;

                if (changedOrder) {
                    Alert.alert(
                        STATUS_TITLES[changedOrder.status] || 'Order status updated',
                        changedOrder.lastStatusMessage || `Queue #${changedOrder.queueNumber || '-'} is now ${changedOrder.status}.`
                    );
                }
            } catch (error) {
                // Keep this quiet so background polling never interrupts normal browsing.
            } finally {
                pollingRef.current = false;
            }
        };

        checkOrderStatuses();
        const interval = setInterval(checkOrderStatuses, POLL_INTERVAL_MS);

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [user, role, isAdmin]);

    return null;
}
