import { getStories } from '../../data/api';
import CONFIG from '../../config.js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default class HomePage {
  constructor() {
    this.currentPage = 1;
    this.itemsPerPage = 6;
    this.allStories = [];
    this.displayedStories = [];
    this.locationCache = new Map(); // Cache untuk menyimpan hasil geocoding
  }

  async render() {
    return `
     <section class="container">
        <div class="card fade-in-up">
          <h1 style="text-align: center; margin-bottom: 30px;">Daftar Cerita</h1>
          <p style="text-align: center; color: #666; margin-bottom: 40px;">
            Jelajahi koleksi cerita menarik dari komunitas kami
          </p>
          <div style="text-align:center; margin-bottom:20px;">
            <button id="toggle-map-btn" class="btn" style="padding:10px 28px; font-size:1rem;">
              <i class="fas fa-map-marked-alt"></i> Lihat Sebaran Peta
            </button>
          </div>
          <!-- Map Visualization -->
          <div id="stories-map-wrapper" style="display:none;">
            <div style="text-align:right; margin-bottom:8px;">
              <button id="close-map-btn" class="btn" style="padding:4px 16px; font-size:0.95rem;">
                <i class="fas fa-times"></i> Tutup Peta
              </button>
            </div>
            <div id="stories-map" style="width: 100%; height: 350px; margin: 0 0 40px 0; border-radius: 16px; overflow: hidden;"></div>
          </div>
        </div>
        
        <!-- Loading State -->
        <div id="loading-state" style="text-align: center; padding: 40px;">
          <div class="loader"></div>
          <p style="margin-top: 15px; color: #666;">Memuat cerita...</p>
        </div>
        
        <!-- Login Required State -->
        <div id="login-required-state" style="display: none; text-align: center; padding: 40px;">
          <div style="font-size: 3.5rem; color: var(--primary-color); margin-bottom: 20px;">🔒</div>
          <h2>Kamu harus login terlebih dahulu</h2>
          <p style="color: #666; margin: 15px 0 25px;">Untuk melihat seluruh cerita, silakan login ke akun kamu</p>
          <a href="#/auth/login" class="btn">Login Sekarang</a>
        </div>
        
        <!-- Error State -->
        <div id="error-state" style="display: none; text-align: center; padding: 40px;">
          <div style="font-size: 3.5rem; color: #e74c3c; margin-bottom: 20px;">😕</div>
          <h2>Gagal Memuat Cerita</h2>
          <p id="error-message" style="color: #666; margin: 15px 0 25px;">Terjadi kesalahan saat memuat cerita.</p>
          <button id="retry-btn" class="btn">Coba Lagi</button>
        </div>
        
        <!-- Empty State -->
        <div id="empty-state" style="display: none; text-align: center; padding: 40px;">
          <div style="font-size: 3.5rem; color: var(--primary-color); margin-bottom: 20px;">📭</div>
          <h2>Belum Ada Cerita</h2>
          <p style="color: #666; margin: 15px 0;">Jadilah yang pertama berbagi cerita menarikmu!</p>
        </div>
        
        <!-- View Controls -->
        <div id="view-controls" style="display: none; text-align: right; margin-bottom: 20px; margin-top: 10px;">
          <div class="view-buttons" style="display: inline-flex; align-items: center; gap: 10px;">
            <button class="view-btn active" data-view="grid" style="border: none; background-color: transparent; cursor: pointer; color: #6366f1; font-weight: 500; padding: 5px; display: flex; align-items: center;">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/>
              </svg>
              <span style="margin-left: 5px;">Grid</span>
            </button>
            <button class="view-btn" data-view="list" style="border: none; background-color: transparent; cursor: pointer; color: #6b7280; font-weight: 500; padding: 5px; display: flex; align-items: center;">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/>
              </svg>
              <span style="margin-left: 5px;">List</span>
            </button>
          </div>
        </div>
        
        <!-- Stories Container - default grid view with 3 columns -->
        <div id="stories-container" class="stories-grid" style="margin-top: 20px;"></div>
        <!-- Load More Button - Only shown when logged in -->
        <div id="load-more-container" style="text-align: center; margin-top: 40px; display: none;">
          <button class="btn" id="load-more-btn">
            <span id="load-more-text">Muat Lebih Banyak</span>
            <span id="load-more-info" style="font-size: 0.8rem; opacity: 0.8; margin-left: 8px;"></span>
          </button>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Remove auth-page class if it exists
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.classList.remove('auth-page');
    }

    // Set up event listeners for view control buttons
    this._initializeViewControls();

    // Load stories
    await this._loadStories();
    
    // Setup retry button
    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => this._loadStories());
    }
    
    // Add event listener to login button in login-required-state
    const loginBtn = document.querySelector('#login-required-state a.btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = '#/auth/login';
      });
    }
    
    // Add event listener for load more button
    this._setupLoadMoreButton();

    // Toggle map button logic
    const toggleMapBtn = document.getElementById('toggle-map-btn');
    const closeMapBtn = document.getElementById('close-map-btn');
    const mapWrapper = document.getElementById('stories-map-wrapper');
    let mapInitialized = false;

    if (toggleMapBtn && mapWrapper) {
      toggleMapBtn.addEventListener('click', () => {
        mapWrapper.style.display = 'block';
        toggleMapBtn.style.display = 'none';
        if (!mapInitialized && this.allStories.length > 0) {
          this._initializeMapVisualization(this.allStories);
          mapInitialized = true;
        }
      });
    }
    if (closeMapBtn && mapWrapper && toggleMapBtn) {
      closeMapBtn.addEventListener('click', () => {
        mapWrapper.style.display = 'none';
        toggleMapBtn.style.display = 'inline-block';
      });
    }
  }

  _setupLoadMoreButton() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
      // Hapus event listener lama jika ada
      loadMoreBtn.replaceWith(loadMoreBtn.cloneNode(true));
      const newLoadMoreBtn = document.getElementById('load-more-btn');
      
      newLoadMoreBtn.addEventListener('click', () => {
        // Tampilkan loading state pada tombol
        const loadMoreText = document.getElementById('load-more-text');
        const originalText = loadMoreText.textContent;
        loadMoreText.textContent = 'Memuat...';
        newLoadMoreBtn.disabled = true;
        
        // Simulasi delay untuk UX yang lebih baik
        setTimeout(async () => {
          await this._loadMoreStories();
          loadMoreText.textContent = originalText;
          newLoadMoreBtn.disabled = false;
        }, 500);
      });
    }
  }

  _initializeViewControls() {
    const viewButtons = document.querySelectorAll('.view-btn');
    const storiesContainer = document.getElementById('stories-container');
    const viewControls = document.getElementById('view-controls');

    if (!viewButtons || viewButtons.length === 0) {
      return;
    }

    // Pastikan grid view adalah default
    if (storiesContainer) {
      storiesContainer.className = 'stories-grid';
      storiesContainer.style.display = 'grid';
      // Hapus baris berikut agar tidak override CSS:
      // storiesContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
      // storiesContainer.style.gap = '20px';
    }
    
    // Set button grid sebagai active secara default
    const gridButton = document.querySelector('.view-btn[data-view="grid"]');
    const listButton = document.querySelector('.view-btn[data-view="list"]');
    
    if (gridButton) {
      gridButton.classList.add('active');
      gridButton.style.color = '#6366f1'; // Warna indigo untuk tombol aktif
    }
    
    if (listButton) {
      listButton.classList.remove('active');
      listButton.style.color = '#6b7280'; // Warna abu-abu untuk tombol tidak aktif
    }

    viewButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update button styles
        viewButtons.forEach(b => {
          b.classList.remove('active');
          b.style.color = '#6b7280';  // Warna abu-abu untuk tombol tidak aktif
        });
        
        btn.classList.add('active');
        btn.style.color = '#6366f1';  // Warna indigo untuk tombol aktif
        
        const view = btn.dataset.view;
        if (storiesContainer) {
          if (view === 'list') {
            storiesContainer.className = 'stories-list';
            storiesContainer.style.display = 'flex';
            storiesContainer.style.flexDirection = 'column';
            storiesContainer.style.gridTemplateColumns = '';
            storiesContainer.style.gap = '15px';
          } else {
            storiesContainer.className = 'stories-grid';
            storiesContainer.style.display = 'grid';
            storiesContainer.style.flexDirection = '';
            storiesContainer.style.gridTemplateColumns = '';
            storiesContainer.style.gap = '';
          }
        }
      });
    });
  }

  async _loadStories() {
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const loginRequiredState = document.getElementById('login-required-state');
    const storiesContainer = document.getElementById('stories-container');
    const emptyState = document.getElementById('empty-state');
    const loadMoreContainer = document.getElementById('load-more-container');

    // Check if user is authenticated
    const authToken = localStorage.getItem('authToken');
    const viewControls = document.getElementById('view-controls');
    
    if (!authToken) {
      // Show login required state
      this._hideElement(loadingState);
      this._hideElement(errorState);
      this._hideElement(storiesContainer);
      this._hideElement(emptyState);
      this._hideElement(loadMoreContainer);
      this._hideElement(viewControls);
      this._showElement(loginRequiredState);
      return;
    }

    // Show loading
    this._showElement(loadingState);
    this._hideElement(errorState);
    this._hideElement(loginRequiredState);
    this._hideElement(storiesContainer);
    this._hideElement(emptyState);

    try {
      const result = await getStories();
      
      if (result.success && result.data) {
        const stories = result.data;
        
        // Update total stories count
        const totalStoriesElement = document.getElementById('total-stories');
        if (totalStoriesElement) {
          totalStoriesElement.textContent = stories.length.toLocaleString();
        }

        if (stories.length > 0) {
          // Simpan semua stories dan reset pagination
          this.allStories = stories;
          this.currentPage = 1;
          this.displayedStories = [];
          
          // Set default grid layout before showing stories
          // storiesContainer.style.display = 'grid';
          // storiesContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
          // storiesContainer.style.gap = '20px';
          
          // Load first batch of stories
          await this._loadMoreStories();
          
          this._hideElement(loadingState);
          this._showElement(storiesContainer);
          this._showElement(viewControls);
          
          // Setup load more button setelah stories dimuat
          this._setupLoadMoreButton();
          
          // Initialize map visualization
          this._initializeMapVisualization(stories);
        } else {
          this._hideElement(loadingState);
          this._hideElement(loadMoreContainer);
          this._hideElement(viewControls);
          this._showElement(emptyState);
        }
      } else {
        throw new Error(result.message || 'Failed to load stories');
      }
    } catch (error) {
      console.error('Error loading stories:', error);
      this._hideElement(loadingState);
      this._hideElement(storiesContainer);
      this._hideElement(emptyState);
      this._hideElement(loginRequiredState);
      this._hideElement(loadMoreContainer);
      
      // Check if it's an authentication error
      if (error.message && error.message.includes('authentication')) {
        // Remove invalid token
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        this._showElement(loginRequiredState);
      } else {
        // Show general error
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
          errorMessage.textContent = error.message || 'Unable to load stories at the moment.';
        }
        this._showElement(errorState);
      }
    }
  }

  async _loadMoreStories() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const newStories = this.allStories.slice(startIndex, endIndex);
    
    // Tambahkan stories baru ke displayed stories
    this.displayedStories = [...this.displayedStories, ...newStories];
    
    // Render semua displayed stories
    await this._renderStories(this.displayedStories);
    
    // Update pagination
    this.currentPage++;
    
    // Cek apakah masih ada stories untuk dimuat
    const hasMoreStories = endIndex < this.allStories.length;
    const loadMoreContainer = document.getElementById('load-more-container');
    const loadMoreInfo = document.getElementById('load-more-info');
    
    // Update informasi jumlah data
    if (loadMoreInfo) {
      loadMoreInfo.textContent = `(${this.displayedStories.length} dari ${this.allStories.length})`;
    }
    
    if (hasMoreStories) {
      this._showElement(loadMoreContainer);
    } else {
      this._hideElement(loadMoreContainer);
      
      // Tampilkan pesan jika semua data sudah dimuat
      const container = document.getElementById('stories-container');
      if (container && this.displayedStories.length === this.allStories.length) {
        const allLoadedMessage = document.createElement('div');
        allLoadedMessage.id = 'all-stories-loaded';
        allLoadedMessage.style.cssText = 'text-align: center; margin-top: 30px; padding: 20px; color: #666; font-style: italic;';
        allLoadedMessage.innerHTML = `
          <p>✓ Semua cerita telah dimuat (${this.allStories.length} cerita)</p>
        `;
        
        // Hapus pesan sebelumnya jika ada
        const existingMessage = document.getElementById('all-stories-loaded');
        if (existingMessage) {
          existingMessage.remove();
        }
        
        container.parentNode.insertBefore(allLoadedMessage, container.nextSibling);
      }
    }
  }

  async _renderStories(stories) {
    const container = document.getElementById('stories-container');
    if (!container) return;

    // Ambil nama lokasi untuk semua stories yang memiliki koordinat
    const storiesWithLocations = await Promise.all(
      stories.map(async (story) => {
        if (story.lat && story.lon) {
          const locationName = await this._getLocationName(story.lat, story.lon);
          return { ...story, locationName };
        }
        return story;
      })
    );

    container.innerHTML = storiesWithLocations.map(story => `
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
                <p class="story-date" style="font-size: 0.8rem; color: #666; margin: 0;">${this._formatDate(story.createdAt)}</p>
              </div>
            </div>
            ${story.lat && story.lon ? `
              <div class="story-location" style="font-size: 0.8rem; color: #666; cursor: pointer; text-align: right; max-width: 150px;" title="${story.locationName || 'Lokasi tersedia'}" onclick="window.open('https://www.openstreetmap.org/?mlat=${story.lat}&mlon=${story.lon}&zoom=15', '_blank')">
                <i class="fas fa-map-marker-alt"></i>
                <span>${this._truncateLocation(story.locationName || 'Lokasi tersedia')}</span>
              </div>
            ` : ''}
          </div>
          <h3 class="story-title" style="font-size: 1.2rem; margin: 0 0 10px 0;">${story.description.split(' ').slice(0, 5).join(' ')}...</h3>
          <p class="story-excerpt" style="font-size: 0.9rem; color: #666; margin-bottom: 16px; line-height: 1.5;">${this._truncateText(story.description, 120)}</p>
         
        </div>
      </div>
    `).join('');

    // Add click handlers for view story buttons
    container.querySelectorAll('.btn-view-story').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const storyId = btn.dataset.storyId;
        this._viewStory(storyId);
      });
    });

    // Add click handlers for story cards
    container.querySelectorAll('.story-card').forEach(card => {
      card.addEventListener('click', () => {
        const storyId = card.dataset.storyId;
        this._viewStory(storyId);
      });
      
      // Add hover effect
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-5px)';
        card.style.boxShadow = '0 10px 20px rgba(0,0,0,0.15)';
        const overlay = card.querySelector('.story-overlay');
        if (overlay) {
          overlay.style.opacity = '1';
        }
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
        const overlay = card.querySelector('.story-overlay');
        if (overlay) {
          overlay.style.opacity = '0';
        }
      });
    });
  }

  _viewStory(storyId) {
    // Navigate to story detail page
    window.location.hash = `#/story/${storyId}`;
  }

  async _getLocationName(lat, lon) {
    const cacheKey = `${lat},${lon}`;
    if (this.locationCache.has(cacheKey)) {
      return this.locationCache.get(cacheKey);
    }

    try {
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${lon},${lat}.json?key=${CONFIG.MAPTILER_API_KEY}`
      );
      if (response.ok) {
        const data = await response.json();
        let locationName = 'Lokasi tidak dikenal';
        if (data && data.features && data.features.length > 0) {
          locationName = data.features[0].place_name || locationName;
        }
        this.locationCache.set(cacheKey, locationName);
        return locationName;
      }
    } catch (error) {
      console.warn('Error getting location name:', error);
    }
    return 'Lokasi tersedia';
  }

  _truncateLocation(locationName, maxLength = 25) {
    if (locationName.length <= maxLength) return locationName;
    return locationName.substring(0, maxLength).trim() + '...';
  }

  _formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  }

  _truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  _initializeMapVisualization(stories) {
    const mapContainer = document.getElementById('stories-map');
    if (!mapContainer) return;

    // Filter stories yang punya lokasi
    const storiesWithLocation = stories.filter(story => story.lat && story.lon);

    if (storiesWithLocation.length === 0) {
      mapContainer.style.display = 'none';
      return;
    }

    mapContainer.style.display = 'block';
    mapContainer.innerHTML = ''; // Bersihkan isi lama

    // Inisialisasi peta Leaflet
    if (this._leafletMap) {
      this._leafletMap.remove();
    }
    this._leafletMap = L.map(mapContainer).setView(
      [storiesWithLocation[0].lat, storiesWithLocation[0].lon], 4
    );

    // Tambahkan tile layer MapTiler (atau pakai default OpenStreetMap)
    L.tileLayer(`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${CONFIG.MAPTILER_API_KEY}`, {
      attribution: '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
      maxZoom: 18,
    }).addTo(this._leafletMap);

    // Tambahkan marker untuk setiap cerita
    storiesWithLocation.forEach(story => {
      const marker = L.marker([story.lat, story.lon]).addTo(this._leafletMap);
      marker.bindPopup(`
        <strong>${story.name}</strong><br>
        ${story.locationName ? story.locationName : ''}
        <br>
        <em>${this._truncateText(story.description, 60)}</em>
        <br>
        <a href="#/story/${story.id}">Lihat Detail</a>
      `);
    });

    // Fit bounds jika lebih dari satu lokasi
    if (storiesWithLocation.length > 1) {
      const bounds = L.latLngBounds(storiesWithLocation.map(s => [s.lat, s.lon]));
      this._leafletMap.fitBounds(bounds, { padding: [30, 30] });
    }
  }

  _showElement(element) {
    if (element) {
      // Untuk stories container, gunakan display grid, untuk elemen lain gunakan block
      if (element.id === 'stories-container') {
        element.style.display = 'grid';
      } else {
        element.style.display = 'block';
      }
    }
  }

  _hideElement(element) {
    if (element) element.style.display = 'none';
  }
}
