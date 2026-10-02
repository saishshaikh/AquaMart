import axios from "axios";
import { serverUrl } from "../App";

/**
 * Convert a base64 string to a Uint8Array for VAPID push subscription
 */
export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Detect device type for subscription metadata
 */
export function detectDeviceType() {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * Check if Web Push Notifications and Service Workers are supported
 */
export function isPushNotificationSupported() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Register Service Worker
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported in this browser.');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Get current push subscription if already subscribed
 */
export async function getCurrentPushSubscription() {
  if (!isPushNotificationSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription;
  } catch (error) {
    console.error('Error getting current push subscription:', error);
    return null;
  }
}

/**
 * Subscribe current device to Web Push Notifications
 */
export async function subscribeUserToPush() {
  if (!isPushNotificationSupported()) {
    throw new Error('Push notifications are not supported in this browser or iOS version.');
  }

  // 1. Request Browser Notification Permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission was not granted by user.');
  }

  // 2. Register Service Worker & Wait for Ready
  let registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    registration = await registerServiceWorker();
  }
  await navigator.serviceWorker.ready;

  // 3. Fetch VAPID Public Key from Backend
  const keyResponse = await axios.get(`${serverUrl}/api/notification/vapid-public-key`, {
    withCredentials: true
  });

  if (!keyResponse.data?.success || !keyResponse.data?.publicKey) {
    throw new Error('Failed to retrieve VAPID public key from server.');
  }

  const convertedVapidKey = urlBase64ToUint8Array(keyResponse.data.publicKey);

  // 4. Subscribe with PushManager
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    });
  }

  // 5. Send Subscription to Backend
  const subData = JSON.parse(JSON.stringify(subscription));
  const deviceType = detectDeviceType();

  await axios.post(
    `${serverUrl}/api/notification/subscribe`,
    {
      subscription: subData,
      userAgent: navigator.userAgent,
      deviceType,
      topics: ['offers', 'discounts', 'catch_alerts', 'orders', 'delivery']
    },
    { withCredentials: true }
  );

  return { success: true, subscription };
}

/**
 * Unsubscribe current device from Web Push
 */
export async function unsubscribeUserFromPush() {
  if (!isPushNotificationSupported()) return { success: false };

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      await axios.post(
        `${serverUrl}/api/notification/unsubscribe`,
        { endpoint },
        { withCredentials: true }
      ).catch(() => {});
    }
    return { success: true };
  } catch (error) {
    console.error('Error unsubscribing from push:', error);
    return { success: false, error: error.message };
  }
}
