self.addEventListener('push', (event) => {
  console.log('Service worker pushing...');
 
  async function chainPromise() {
    await self.registration.showNotification('Halo ada catatan baru nih!', {
      body: 'Terjadi kerusakan lampu jalan di Jl. Melati',
    });
  }
 
  event.waitUntil(chainPromise());
});