// src/scripts/utils/index.js
export function showFormattedDate(date, locale = 'en-US', options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('Browser ini tidak mendukung notifikasi desktop.');
    return;
  }

  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      showNotification('Izin notifikasi diberikan. Sekarang Anda bisa menerima notifikasi push!', 'success');
    } else if (permission === 'denied') {
      showNotification('Izin notifikasi ditolak. Anda tidak akan menerima notifikasi push.', 'error');
    } else {
      showNotification('Izin notifikasi ditolak secara default.', 'info');
    }
  }).catch(error => {
    console.error('Terjadi kesalahan saat meminta izin notifikasi:', error);
  });
}

export function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `<div class="notification-content"><i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i><span>${message}</span></div>`;
  document.body.appendChild(notification);
  
  // Trigger reflow to ensure CSS transition works
  void notification.offsetWidth;
  
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

export function isServiceWorkerAvailable() {
  return 'serviceWorker' in navigator;
}

export async function registerServiceWorker() {
  if (!isServiceWorkerAvailable()) {
    console.log('Service Worker API unsupported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service worker telah terpasang', registration);
  } catch (error) {
    console.log('Failed to install service worker:', error);
  }
}