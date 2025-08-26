self.addEventListener('push', (event) => {
  const notificationData = event.data.json();
  const { title, options } = notificationData;
  console.log('Service worker pushing...');
 
  async function showNotificationPromise() {
    await self.registration.showNotification(title, options);
  }
 
  event.waitUntil(showNotificationPromise());
});