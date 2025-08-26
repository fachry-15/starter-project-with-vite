import StoryModel from '../models/story-model';
import StoryDetailView from '../views/story-detail-view';
import { parseActivePathname } from '../routes/url-parser';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import CONFIG from '../config';

class StoryDetailPresenter {
  constructor(view, model) {
    this.view = view;
    this.model = model;
    this.storyId = null;
    this.leafletMap = null;
  }

  async init() {
    this._getStoryIdFromUrl();
    if (!this.storyId) {
      this.view.showError('ID cerita tidak valid.');
      return;
    }
    
    // Inisialisasi listener di View dan berikan handler dari Presenter
    this.view.initListeners({
      onBack: this._handleBack.bind(this),
      onRetry: this._loadStory.bind(this),
      onOpenMap: this._handleOpenMap.bind(this),
    });

    await this._loadStory();
  }

  _getStoryIdFromUrl() {
    const { id } = parseActivePathname();
    this.storyId = id;
  }

  async _loadStory() {
    this.view.showLoading();
    try {
      const story = await this.model.fetchStoryDetail(this.storyId);
      this.view.renderStory(story);
      
      if (story.lat && story.lon) {
        // Panggil metode baru untuk inisialisasi peta
        this._initializeMap(story.lat, story.lon, story.name, story.description);
      } else {
        this.view.hideMapContainer();
      }

    } catch (error) {
      console.error('Error loading story:', error);
      this.view.showError(error.message);
    }
  }
  
  _handleBack() {
    this.view.navigateToHome(); // Perbaikan: Memanggil metode View
  }

  _handleOpenMap(lat, lon) {
    this.view.openInGoogleMaps(lat, lon); // Perbaikan: Memanggil metode View
  }

  _initializeMap(lat, lon, name, description) {
    const mapDivId = 'story-leaflet-map';
    
    if (this.leafletMap) {
      this.leafletMap.remove();
    }
    
    this.leafletMap = L.map(mapDivId).setView([lat, lon], 13);
    
    // Tiga lapisan peta yang berbeda
    const streets = L.tileLayer(`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${CONFIG.MAPTILER_API_KEY}`, {
      attribution: '© <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
    });

    const basic = L.tileLayer(`https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}.png?key=${CONFIG.MAPTILER_API_KEY}`, {
        attribution: '© <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
    });
    
    const satellite = L.tileLayer(`https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=${CONFIG.MAPTILER_API_KEY}`, {
        attribution: '© <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
    });

    // Kontrol lapisan
    const baseMaps = {
        "Streets": streets,
        "Basic": basic,
        "Satellite": satellite
    };
    
    L.control.layers(baseMaps).addTo(this.leafletMap);
    streets.addTo(this.leafletMap);

    L.marker([lat, lon]).addTo(this.leafletMap)
      .bindPopup(`<strong>${name}</strong><br>${description ? this.view._truncateText(description, 60) : ''}`)
      .openPopup();
    
    setTimeout(() => {
        this.leafletMap.invalidateSize();
    }, 200);
  }
}

export default StoryDetailPresenter;