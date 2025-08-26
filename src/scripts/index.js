// CSS imports
import '../styles/styles.css';

// Custom Leaflet marker fix
import L from 'leaflet';
import markerIcon from '/images/image.png?url';

const customIcon = L.icon({
  iconUrl: markerIcon,
  iconSize: [32, 32],      // Ukuran sesuai gambar
  iconAnchor: [16, 32],    // Titik bawah tengah
  popupAnchor: [0, -32],   // Popup muncul di atas marker
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = customIcon;

// End of custom Leaflet marker fix

import App from './pages/app';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });

  // Header scroll effect
  const header = document.querySelector('header');

  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
});