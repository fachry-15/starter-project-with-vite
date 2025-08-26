import { convertBase64ToUint8Array } from './index';
import CONFIG from '../config';
import { subscribePushNotification, unsubscribePushNotification } from '../data/api';

export function isNotificationAvailable() {
  return 'Notification' in window;
}

export function isNotificationGranted() {
  return Notification.permission === 'granted';
}

export async function requestNotificationPermission() {
  if (!isNotificationAvailable()) {
    console.error('Notification API tidak didukung.');
    return false;
  }

  if (isNotificationGranted()) {
    return true;
  }

  const status = await Notification.requestPermission();

  if (status === 'denied') {
    alert('Izin notifikasi ditolak.');
    return false;
  }

  if (status === 'default') {
    alert('Izin notifikasi ditutup atau diabaikan.');
    return false;
  }

  return true;
}

export async function getPushSubscription() {
  const registration = await navigator.serviceWorker.getRegistration();
  return await registration.pushManager.getSubscription();
}

export async function isCurrentPushSubscriptionAvailable() {
  return !!(await getPushSubscription());
}

export function generateSubscribeOptions() {
  return {
    userVisibleOnly: true,
    applicationServerKey: convertBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY),
  };
}

export async function subscribe() {
  console.log('Mulai berlangganan push notification...');

  const failureSubscribeMessage = 'Langganan push notification gagal diaktifkan.';
  const successSubscribeMessage = 'Langganan push notification berhasil diaktifkan.';
  
  if (!(await requestNotificationPermission())) {
    alert(failureSubscribeMessage);
    return;
  }

  if (await isCurrentPushSubscriptionAvailable()) {
    alert('Anda sudah berlangganan push notification.');
    return;
  }
  
  let pushSubscription;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    pushSubscription = await registration.pushManager.subscribe(generateSubscribeOptions());

    const { endpoint, keys } = pushSubscription.toJSON();
    const response = await subscribePushNotification({ endpoint, keys });

    if (!response.ok) {
      console.error('subscribe: response:', response);
      alert(failureSubscribeMessage);
      
      await pushSubscription.unsubscribe();
      return;
    }
    
    alert(successSubscribeMessage);
  } catch (error) {
    console.error('subscribe: error:', error);
    alert(failureSubscribeMessage);
  }
}

export async function unsubscribe() {
    const pushSubscription = await getPushSubscription();
    if (!pushSubscription) {
        alert('Anda belum berlangganan push notification.');
        return;
    }

    try {
        const { endpoint } = pushSubscription.toJSON();
        const response = await unsubscribePushNotification({ endpoint });

        if (!response.ok) {
            throw new Error(response.message);
        }

        await pushSubscription.unsubscribe();
        console.log('Unsubscribe berhasil.');
        alert('Berhasil berhenti berlangganan push notification.');
    } catch (error) {
        console.error('Unsubscribe gagal:', error);
        alert('Gagal berhenti berlangganan push notification.');
    }
}