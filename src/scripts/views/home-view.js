import L from 'leaflet';
import CONFIG from '../config.js';

class HomeView {
  constructor() {
    this.container = document.getElementById('stories-container');
    this.leafletMap = null;
  }

  initListeners(handlers) {
    const toggleMapBtn = document.getElementById('toggle-map-btn');
    if (toggleMapBtn) {
      toggleMapBtn.addEventListener('click', handlers.onToggleMap);
    }
    const closeMapBtn = document.getElementById('close-map-btn');
    if (closeMapBtn) {
      closeMapBtn.addEventListener('click', handlers.onCloseMap);
    }
    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', handlers.onRetry);
    }
    const loginBtn = document.querySelector('#login-required-state a.btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handlers.onLoginRequired();
      });
    }
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', handlers.onLoadMore);
    }
    const viewButtons = document.querySelectorAll('.view-btn');
    if (viewButtons) {
      viewButtons.forEach(btn => {
        btn.addEventListener('click', () => handlers.onViewChange(btn.dataset.view));
      });
    }
    // Add event listeners for dynamically rendered cards
    this.container.addEventListener('click', (event) => {
      const btn = event.target.closest('.btn-view-story');
      if (btn) {
        event.stopPropagation();
        handlers.onViewStory(btn.dataset.storyId);
      }
      const card = event.target.closest('.story-card');
      if (card && !btn) {
        handlers.onViewStory(card.dataset.storyId);
      }
    });
  }

  // Tambahkan metode ini untuk menangani navigasi
  navigateToStoryDetail(storyId) {
    window.location.hash = `#/story/${storyId}`;
  }

  getMapContainerId() {
    return 'stories-map';
  }

  toggleMap(show) {
    const mapWrapper = document.getElementById('stories-map-wrapper');
    const toggleMapBtn = document.getElementById('toggle-map-btn');
    if (show) {
      this.hideElement(toggleMapBtn);
      this.showElement(mapWrapper);
    } else {
      this.hideElement(mapWrapper);
      this.showElement(toggleMapBtn);
    }
  }

  renderMap(stories) {
    const storiesWithLocation = stories.filter(story => story.lat && story.lon);

    if (storiesWithLocation.length === 0) {
      this.hideMapWrapper();
      return;
    }

    if (this.leafletMap) {
      this.leafletMap.remove();
    }
    
    this.leafletMap = L.map(this.getMapContainerId()).setView(
      [storiesWithLocation[0].lat, storiesWithLocation[0].lon], 4
    );

    // Define multiple tile layers
    const streets = L.tileLayer(`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${CONFIG.MAPTILER_API_KEY}`, {
      attribution: '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
      maxZoom: 18,
    }).addTo(this.leafletMap);

    const basic = L.tileLayer(`https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}.png?key=${CONFIG.MAPTILER_API_KEY}`, {
      attribution: '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
      maxZoom: 18,
    });

    // Add layer control
    const baseMaps = {
        "Streets": streets,
        "Basic": basic
    };

    L.control.layers(baseMaps).addTo(this.leafletMap);

    storiesWithLocation.forEach(story => {
      const marker = L.marker([story.lat, story.lon]).addTo(this.leafletMap);
      marker.bindPopup(`<strong>${story.name}</strong><br><em>${story.description.substring(0, 60)}...</em><br><a href="#/story/${story.id}">Lihat Detail</a>`);
    });

    if (storiesWithLocation.length > 1) {
      const bounds = L.latLngBounds(storiesWithLocation.map(s => [s.lat, s.lon]));
      this.leafletMap.fitBounds(bounds, { padding: [30, 30] });
    }
  }

  updateStoriesLayout(view) {
    const storiesContainer = document.getElementById('stories-container');
    const viewButtons = document.querySelectorAll('.view-btn');
    
    viewButtons.forEach(b => {
      b.classList.remove('active');
      b.style.color = '#6b7280';
    });
    const activeButton = document.querySelector(`.view-btn[data-view="${view}"]`);
    if (activeButton) {
      activeButton.classList.add('active');
      activeButton.style.color = '#6366f1';
    }

    if (view === 'list') {
      storiesContainer.className = 'stories-list';
    } else {
      storiesContainer.className = 'stories-grid';
    }
  }

  renderStories(stories) {
    if (!this.container) return;
    
    const truncateText = (text, maxLength) => text.length <= maxLength ? text : text.substring(0, maxLength).trim() + '...';
    const truncateLocation = (locationName, maxLength = 25) => locationName.length <= maxLength ? locationName : locationName.substring(0, maxLength).trim() + '...';
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        }
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    this.container.innerHTML = stories.map(story => `
      <div class="story-card fade-in-up" data-story-id="${story.id}" style="box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-radius: 12px; overflow: hidden; transition: transform 0.3s ease, box-shadow 0.3s ease; background-color: white;">
        <div class="story-image" style="position: relative; height: 200px; overflow: hidden;">
          ${story.photoUrl 
            ? `<img src="${story.photoUrl}" alt="${story.name}'s story" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;">`
            : `<div style="width: 100%; height: 200px; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem;">📖</div>`
          }
          <div class="story-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.3); opacity: 0; transition: opacity 0.3s ease; display: flex; align-items: center; justify-content: center;">
            <button class="btn-view-story" data-story-id="${story.id}" style="padding: 8px 16px; background-color: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer;">
              <i class="fas fa-eye"></i> Lihat Cerita
            </button>
          </div>
        </div>
        <div class="story-content" style="padding: 16px;">
          <div class="story-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div class="story-author" style="display: flex; align-items: center;">
              <div class="author-avatar" style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary-color); display: flex; align-items: center; justify-content: center; color: white; margin-right: 12px;">
                <i class="fas fa-user"></i>
              </div>
              <div class="author-info">
                <p class="author-name" style="font-weight: bold; margin: 0;">${story.name}</p>
                <p class="story-date" style="font-size: 0.8rem; color: #666; margin: 0;">${formatDate(story.createdAt)}</p>
              </div>
            </div>
            ${story.lat && story.lon ? `
              <div class="story-location" style="font-size: 0.8rem; color: #666; cursor: pointer; text-align: right; max-width: 150px;" title="${story.locationName || 'Lokasi tersedia'}" onclick="window.open('https://www.openstreetmap.org/?mlat=${story.lat}&mlon=${story.lon}&zoom=15', '_blank')">
                <i class="fas fa-map-marker-alt"></i>
                <span>${truncateLocation(story.locationName || 'Lokasi tersedia')}</span>
              </div>
            ` : ''}
          </div>
          <h3 class="story-title" style="font-size: 1.2rem; margin: 0 0 10px 0;">${story.description.split(' ').slice(0, 5).join(' ')}...</h3>
          <p class="story-excerpt" style="font-size: 0.9rem; color: #666; margin-bottom: 16px; line-height: 1.5;">${truncateText(story.description, 120)}</p>
        </div>
      </div>
    `).join('');
  }

  updateLoadMoreButton(displayedCount, totalCount, hasMore) {
    const loadMoreContainer = document.getElementById('load-more-container');
    const loadMoreInfo = document.getElementById('load-more-info');
    if (loadMoreInfo) {
      loadMoreInfo.textContent = `(${displayedCount} dari ${totalCount})`;
    }
    if (hasMore) {
      this.showElement(loadMoreContainer);
    } else {
      this.hideElement(loadMoreContainer);
      const container = document.getElementById('stories-container');
      if (container && displayedCount === totalCount) {
        const existingMessage = document.getElementById('all-stories-loaded');
        if (existingMessage) existingMessage.remove();
        const allLoadedMessage = document.createElement('div');
        allLoadedMessage.id = 'all-stories-loaded';
        allLoadedMessage.style.cssText = 'text-align: center; margin-top: 30px; padding: 20px; color: #666; font-style: italic;';
        allLoadedMessage.innerHTML = `<p>✓ Semua cerita telah dimuat (${totalCount} cerita)</p>`;
        container.parentNode.insertBefore(allLoadedMessage, container.nextSibling);
      }
    }
  }

  setLoadMoreButtonLoading(loading) {
    const loadMoreBtn = document.getElementById('load-more-btn');
    const loadMoreText = document.getElementById('load-more-text');
    if (loadMoreBtn && loadMoreText) {
      if (loading) {
        loadMoreText.textContent = 'Memuat...';
        loadMoreBtn.disabled = true;
      } else {
        loadMoreText.textContent = 'Muat Lebih Banyak';
        loadMoreBtn.disabled = false;
      }
    }
  }

  showLoading() {
    this.hideAllSections();
    this.showElement(document.getElementById('loading-state'));
  }

  showError(message) {
    this.hideAllSections();
    const errorMessageElement = document.getElementById('error-message');
    if (errorMessageElement) {
      errorMessageElement.textContent = message;
    }
    this.showElement(document.getElementById('error-state'));
  }

  showLoginRequired() {
    this.hideAllSections();
    this.showElement(document.getElementById('login-required-state'));
  }

  showEmptyState() {
    this.hideAllSections();
    this.hideElement(document.getElementById('load-more-container'));
    this.hideElement(document.getElementById('view-controls'));
    this.showElement(document.getElementById('empty-state'));
  }

  showStoriesContainer() {
    this.hideAllSections();
    this.showElement(this.container);
    this.showElement(document.getElementById('view-controls'));
  }

  hideMapWrapper() {
    this.hideElement(document.getElementById('stories-map-wrapper'));
  }

  hideAllSections() {
    this.hideElement(document.getElementById('loading-state'));
    this.hideElement(document.getElementById('error-state'));
    this.hideElement(document.getElementById('login-required-state'));
    this.hideElement(this.container);
    this.hideElement(document.getElementById('empty-state'));
    this.hideElement(document.getElementById('load-more-container'));
    this.hideElement(document.getElementById('view-controls'));
  }

  showElement(element) {
    if (element) {
      element.style.display = element.id === 'stories-container' ? 'grid' : 'block';
    }
  }

  hideElement(element) {
    if (element) {
      element.style.display = 'none';
    }
  }
}

export default HomeView;