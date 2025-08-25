import L from 'leaflet';
import CONFIG from '../config';

class StoryDetailView {
  constructor() {
    this.container = document.getElementById('main-content');
  }

  initListeners(handlers) {
    const storyContent = document.getElementById('story-content');
    if (storyContent) {
      storyContent.addEventListener('click', (event) => {
        const target = event.target;
        if (target.matches('.btn-location')) {
          const lat = target.dataset.lat;
          const lon = target.dataset.lon;
          handlers.onOpenMap(lat, lon);
        }
      });
    }
    
    const errorState = document.getElementById('error-state');
    if (errorState) {
      errorState.addEventListener('click', (event) => {
        if (event.target.id === 'retry-btn') {
          handlers.onRetry();
        }
      });
    }

    const backButton = document.querySelector('a[href="#/"]');
    if (backButton) {
      backButton.addEventListener('click', (event) => {
        event.preventDefault();
        handlers.onBack();
      });
    }
  }

  renderStory(story) {
    const loadingState = document.getElementById('loading-state');
    const storyContent = document.getElementById('story-content');
    if (!storyContent) return;

    this.hideElement(loadingState);
    this.showElement(storyContent);

    storyContent.innerHTML = `
      <div class="story-detail-main" style="background: #fff; border-radius: 24px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); padding: 40px 32px; width: 100%; max-width: 1100px; margin: 0 auto; min-height: 480px;">
        <h1 class="story-title" style="font-size: 2.2rem; font-weight: 700; color: #1a1a1a; margin-bottom: 24px;">
          Detail Cerita
        </h1>
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

    if (story.lat && story.lon) {
      this._fetchMapTilerAddress(story.lat, story.lon);
    }
  }
  
  hideMapContainer() {
    const mapSection = document.querySelector('.story-map-section');
    if (mapSection) {
      mapSection.style.display = 'none';
    }
  }

  showLoading() {
    this.hideElement(document.getElementById('error-state'));
    this.hideElement(document.getElementById('story-content'));
    this.showElement(document.getElementById('loading-state'));
  }

  showError(message) {
    this.hideElement(document.getElementById('loading-state'));
    this.hideElement(document.getElementById('story-content'));
    const errorMessageElement = document.getElementById('error-message');
    if (errorMessageElement) {
      errorMessageElement.textContent = message;
    }
    this.showElement(document.getElementById('error-state'));
  }

  _fetchMapTilerAddress(lat, lon) {
    try {
      fetch(`https://api.maptiler.com/geocoding/${lon},${lat}.json?key=${CONFIG.MAPTILER_API_KEY}`)
        .then(res => res.json())
        .then(data => {
          const address = (data && data.features && data.features.length > 0)
            ? data.features[0].place_name
            : 'Alamat tidak ditemukan';
          const addressDiv = document.getElementById('osm-address');
          if (addressDiv) addressDiv.textContent = address;
        })
        .catch(e => {
          const addressDiv = document.getElementById('osm-address');
          if (addressDiv) addressDiv.textContent = 'Gagal mengambil alamat';
        });
    } catch (e) {
      const addressDiv = document.getElementById('osm-address');
      if (addressDiv) addressDiv.textContent = 'Gagal mengambil alamat';
    }
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

  _truncateText(text, maxLength = 60) {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  }
  
  // New method to get the map container ID
  getMapContainerId() {
    return 'story-leaflet-map';
  }

  showElement(element) {
    if (element) element.style.display = 'block';
  }

  hideElement(element) {
    if (element) element.style.display = 'none';
    }
}

export default StoryDetailView;