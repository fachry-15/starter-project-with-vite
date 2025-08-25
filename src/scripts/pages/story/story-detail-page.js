import { getStoryDetail } from '../../data/api';
import CONFIG from '../../config.js'; // Tambahkan import config
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default class StoryDetailPage {
  constructor() {
    this.storyId = null;
  }

  async render() {
    return `
      <div class="story-detail-container">
        <div class="container">
          <!-- Breadcrumb -->
          <nav aria-label="breadcrumb" style="margin-bottom: 24px;">
            <ol style="list-style:none; display:flex; align-items:center; gap:8px; padding:0; margin:0;">
              <li>
                <a href="#/" style="color:#4F8EF7; text-decoration:none; font-weight:500;">
                  <i class="fas fa-arrow-left"></i> Kembali ke Daftar Cerita
                </a>
              </li>
              <li style="color:#888;">/</li>
              <li style="color:#222; font-weight:600;">Detail Cerita</li>
            </ol>
          </nav>
          <!-- Loading State -->
          <div id="loading-state" class="loading-container">
            <div class="loading-spinner">
              <i class="fas fa-spinner fa-spin"></i>
            </div>
            <p>Loading story...</p>
          </div>
          <!-- Error State -->
          <div id="error-state" class="error-container" style="display: none;">
            <div class="error-content">
              <i class="fas fa-exclamation-triangle"></i>
              <h3>Story not found</h3>
              <p id="error-message">The story you're looking for doesn't exist or has been removed.</p>
              <a href="#/" class="btn btn-primary">
                <i class="fas fa-arrow-left"></i> Back to Stories
              </a>
            </div>
          </div>
          <!-- Story Content -->
          <div id="story-content" class="story-detail-content" style="display: none;">
            <!-- Story will be loaded here -->
          </div>
        </div>
      </div>
    `;
  }

  async afterRender() {
    // Remove auth-page class if it exists
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.classList.remove('auth-page');
    }

    // Get story ID from URL
    this.storyId = this._getStoryIdFromUrl();
    
    if (this.storyId) {
      await this._loadStory();
    } else {
      this._showError('Invalid story ID');
    }
  }

  _getStoryIdFromUrl() {
    const hash = window.location.hash;
    const match = hash.match(/\/story\/(.+)/);
    return match ? match[1] : null;
  }

  async _loadStory() {
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const storyContent = document.getElementById('story-content');

    try {
      const result = await getStoryDetail(this.storyId);
      
      if (result.success && result.data) {
        this._renderStory(result.data);
        this._hideElement(loadingState);
        this._showElement(storyContent);
      } else {
        throw new Error(result.message || 'Failed to load story');
      }
    } catch (error) {
      console.error('Error loading story:', error);
      this._hideElement(loadingState);
      this._hideElement(storyContent);
      
      const errorMessage = document.getElementById('error-message');
      if (errorMessage) {
        errorMessage.textContent = error.message || 'Unable to load story. Please try again.';
      }
      this._showElement(errorState);
    }
  }

  async _renderStory(story) {
    const container = document.getElementById('story-content');
    if (!container) return;

    container.innerHTML = `
      <div class="story-detail-main" style="background: #fff; border-radius: 24px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); padding: 40px 32px; width: 100%; max-width: 1100px; margin: 0 auto; min-height: 480px;">
        <div class="story-detail-row" style="display: flex; gap: 40px; align-items: stretch;">
          <div class="story-image-large" style="flex: 1.1; display: flex; align-items: stretch;">
            <img src="${story.photoUrl}" alt="${story.name}'s story" style="width: 100%; height: 100%; min-height: 360px; max-height: 500px; border-radius: 20px; object-fit: cover; box-shadow: 0 2px 16px rgba(0,0,0,0.08); display: block;">
          </div>
          <div style="flex: 1.1; display: flex; flex-direction: column; gap: 24px; justify-content: flex-start; height: 100%;">
            <div class="story-info" style="display: flex; flex-direction: column; gap: 24px; flex:1;">
              <div class="author-section" style="display: flex; align-items: center; gap: 18px;">
                <div class="author-avatar-large" style="font-size: 56px; color: #bbb;">
                  <i class="fas fa-user-circle"></i>
                </div>
                <div class="author-details">
                  <h2 class="author-name" style="margin:0; font-size: 1.5rem;">${story.name}</h2>
                  <p class="story-date" style="margin:0; color:#888; font-size: 1rem;">${this._formatDate(story.createdAt)}</p>
                  ${story.lat && story.lon ? `
                    <div class="location-info" style="color:#666; font-size: 15px; margin-top: 4px;">
                      <i class="fas fa-map-marker-alt"></i>
                      <span id="osm-address" style="margin-left:6px;">Mencari alamat...</span>
                    </div>
                  ` : ''}
                </div>
              </div>
              <button class="btn btn-primary" style="width: fit-content; font-size: 1rem; padding: 10px 28px;">Bagikan Cerita</button>
              <div class="story-description" style="flex:1;">
                <h3 style="margin-bottom:10px; font-size: 1.2rem;">Deskripsi Cerita</h3>
                <p style="margin:0; font-size: 1.05rem; color: #444;">${story.description}</p>
              </div>
            </div>
          </div>
        </div>
        ${story.lat && story.lon ? `
        <div class="story-map-section" style="margin-top:32px; width:100%;">
          <h3 style="font-size:1.1rem; margin-bottom:10px; color:#333;">Lokasi Cerita di Peta</h3>
          <div id="story-leaflet-map" style="width:100%; height:360px; border-radius:12px; box-shadow:0 2px 12px rgba(0,0,0,0.07);"></div>
          <div style="margin-top:12px;">
            <button class="btn btn-secondary btn-location" data-lat="${story.lat}" data-lon="${story.lon}" style="font-size:0.95rem; width:100%;">
              <i class="fas fa-map-marked-alt"></i> Buka di Google Maps
            </button>
          </div>
        </div>
        ` : ''}
      </div>
    `;

    // Fetch alamat jika ada lat/lon
    if (story.lat && story.lon) {
      this._fetchMapTilerAddress(story.lat, story.lon);
      this._renderLeafletMap(story.lat, story.lon, story.name, story.description);
    }

    // Add location button handler (jika ada)
    const locationBtn = container.querySelector('.btn-location');
    if (locationBtn) {
      locationBtn.addEventListener('click', () => {
        const lat = locationBtn.dataset.lat;
        const lon = locationBtn.dataset.lon;
        this._showLocation(lat, lon);
      });
    }
  }

  // Ganti fungsi reverse geocoding ke MapTiler
  async _fetchMapTilerAddress(lat, lon) {
    try {
      const res = await fetch(`https://api.maptiler.com/geocoding/${lon},${lat}.json?key=${CONFIG.MAPTILER_API_KEY}`);
      const data = await res.json();
      const address = (data && data.features && data.features.length > 0)
        ? data.features[0].place_name
        : 'Alamat tidak ditemukan';
      const addressDiv = document.getElementById('osm-address');
      if (addressDiv) addressDiv.textContent = address;
    } catch (e) {
      const addressDiv = document.getElementById('osm-address');
      if (addressDiv) addressDiv.textContent = 'Gagal mengambil alamat';
    }
  }

  _showLocation(lat, lon) {
    // Open location in Google Maps
    const url = `https://www.google.com/maps?q=${lat},${lon}`;
    window.open(url, '_blank');
  }

  _formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  _showError(message) {
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const storyContent = document.getElementById('story-content');
    
    this._hideElement(loadingState);
    this._hideElement(storyContent);
    
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
      errorMessage.textContent = message;
    }
    this._showElement(errorState);
  }

  _showElement(element) {
    if (element) element.style.display = 'block';
  }

  _hideElement(element) {
    if (element) element.style.display = 'none';
  }

  _renderLeafletMap(lat, lon, name, description) {
    const mapDiv = document.getElementById('story-leaflet-map');
    if (!mapDiv) return;

    // Hindari duplikasi map jika re-render
    if (this._leafletMap) {
      this._leafletMap.remove();
      this._leafletMap = null;
    }

    this._leafletMap = L.map(mapDiv).setView([lat, lon], 13);

    L.tileLayer(`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${CONFIG.MAPTILER_API_KEY}`, {
      attribution: '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
      maxZoom: 18,
    }).addTo(this._leafletMap);

    L.marker([lat, lon])
      .addTo(this._leafletMap)
      .bindPopup(`<strong>${name}</strong><br>${description ? this._truncateText(description, 60) : ''}`)
      .openPopup();

    // Tambahkan ini agar map selalu tampil sempurna
    setTimeout(() => {
      this._leafletMap.invalidateSize();
    }, 200);
  }

  // Tambahkan fungsi bantu jika belum ada
  _truncateText(text, maxLength = 60) {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  }
}
