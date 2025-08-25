import StoryModel from '../models/story-model.js';
import HomeView from '../views/home-view.js';
import CONFIG from '../config.js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

class HomePresenter {
  constructor(view, model) {
    this.view = view;
    this.model = model;
    this.currentPage = 1;
    this.itemsPerPage = 6;
    this.allStories = [];
    this.displayedStories = [];
    this.locationCache = new Map();
    this.leafletMap = null;
  }

  async init() {
    // Inisialisasi event listener di View, dan Presenter yang menangani aksi tersebut
    this.view.initListeners({
      onToggleMap: this._handleToggleMap.bind(this),
      onCloseMap: this._handleCloseMap.bind(this),
      onRetry: this._loadStories.bind(this),
      onLoginRequired: () => {
        window.location.hash = '#/auth/login';
      },
      onLoadMore: this._handleLoadMore.bind(this),
      onViewStory: this._handleViewStory.bind(this),
      onViewChange: this._handleViewChange.bind(this),
    });

    // Presenter memulai proses pemuatan data
    await this._loadStories();
  }

  async _loadStories() {
    this.view.showLoading();
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        this.view.showLoginRequired();
        return;
      }
      
      const stories = await this.model.fetchStories();
      
      if (stories.length > 0) {
        this.allStories = stories;
        this.currentPage = 1;
        this.displayedStories = [];
        
        await this._loadMoreStories();
        this.view.showStoriesContainer();
        this._initializeMapVisualization(stories);
      } else {
        this.view.showEmptyState();
      }
    } catch (error) {
      console.error('Error loading stories:', error);
      const errorMessage = (error.message && error.message.includes('authentication')) 
        ? 'Missing authentication' 
        : error.message;
      
      if (errorMessage === 'Missing authentication') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        this.view.showLoginRequired();
      } else {
        this.view.showError(error.message || 'Unable to load stories at the moment.');
      }
    }
  }

  async _loadMoreStories() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const newStories = this.allStories.slice(startIndex, endIndex);
    
    this.displayedStories = [...this.displayedStories, ...newStories];
    
    const storiesWithLocations = await Promise.all(
      this.displayedStories.map(async (story) => {
        if (story.lat && story.lon) {
          const locationName = await this._getLocationName(story.lat, story.lon);
          return { ...story, locationName };
        }
        return story;
      })
    );

    this.view.renderStories(storiesWithLocations);
    
    this.currentPage++;
    
    const hasMoreStories = endIndex < this.allStories.length;
    this.view.updateLoadMoreButton(this.displayedStories.length, this.allStories.length, hasMoreStories);
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

  _initializeMapVisualization(stories) {
    const storiesWithLocation = stories.filter(story => story.lat && story.lon);

    if (storiesWithLocation.length === 0) {
      this.view.hideMapWrapper();
      return;
    }

    if (this.leafletMap) {
      this.leafletMap.remove();
    }
    this.leafletMap = L.map(this.view.getMapContainerId()).setView(
      [storiesWithLocation[0].lat, storiesWithLocation[0].lon], 4
    );

    L.tileLayer(`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${CONFIG.MAPTILER_API_KEY}`, {
      attribution: '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
      maxZoom: 18,
    }).addTo(this.leafletMap);

    storiesWithLocation.forEach(story => {
      const marker = L.marker([story.lat, story.lon]).addTo(this.leafletMap);
      marker.bindPopup(`<strong>${story.name}</strong><br><em>${story.description.substring(0, 60)}...</em><br><a href="#/story/${story.id}">Lihat Detail</a>`);
    });

    if (storiesWithLocation.length > 1) {
      const bounds = L.latLngBounds(storiesWithLocation.map(s => [s.lat, s.lon]));
      this.leafletMap.fitBounds(bounds, { padding: [30, 30] });
    }
  }

  _handleToggleMap() {
    this.view.toggleMap(true);
    if (this.allStories.length > 0) {
      this._initializeMapVisualization(this.allStories);
    }
  }

  _handleCloseMap() {
    this.view.toggleMap(false);
  }

  _handleLoadMore() {
    this.view.setLoadMoreButtonLoading(true);
    setTimeout(async () => {
      await this._loadMoreStories();
      this.view.setLoadMoreButtonLoading(false);
    }, 500);
  }

  _handleViewStory(storyId) {
    window.location.hash = `#/story/${storyId}`;
  }

  _handleViewChange(view) {
    this.view.updateStoriesLayout(view);
  }
}

export default HomePresenter;