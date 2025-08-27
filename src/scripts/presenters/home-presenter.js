// File: src/scripts/presenters/home-presenter.js

import StoryModel from '../models/story-model.js';
import HomeView from '../views/home-view.js';
import CONFIG from '../config.js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { addStoryToIndexedDB, deleteStoryFromIndexedDB, getSavedStory } from '../utils/idb-helper.js';
import { showNotification } from '../utils/index.js'; // Import showNotification

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
    this.view.initListeners({
      onToggleMap: this._handleToggleMap.bind(this),
      onCloseMap: this._handleCloseMap.bind(this),
      onRetry: this._loadStories.bind(this),
      onLoginRequired: () => {
        this.view.navigateToLogin();
      },
      onLoadMore: this._handleLoadMore.bind(this),
      onViewStory: this._handleViewStory.bind(this),
      onViewChange: this._handleViewChange.bind(this),
      onToggleSaveStory: this._handleToggleSaveStory.bind(this),
    });

    await this._loadStories();
  }

  async _loadStories() {
    this.view.showLoading();
    try {
      const stories = await this.model.fetchAuthenticatedStories();
      
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
        this.model.clearAuthData();
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
          const locationName = await this.model.getLocationName(story.lat, story.lon);
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
    this.view.navigateToStoryDetail(storyId);
  }

  _handleViewChange(view) {
    this.view.updateStoriesLayout(view);
  }
  
  async _handleToggleSaveStory(storyId) {
    const savedStory = await getSavedStory(storyId);
    if (savedStory) {
      await deleteStoryFromIndexedDB(storyId);
      showNotification('Cerita berhasil dihapus dari daftar simpan.', 'success');
    } else {
      const storyToSave = this.allStories.find(story => story.id === storyId);
      if (storyToSave) {
        await addStoryToIndexedDB(storyToSave);
        showNotification('Cerita berhasil disimpan!', 'success');
      }
    }
    // Refresh the view to update the button state
    await this._loadMoreStories();
  }
}

export default HomePresenter;