import AddStoryView from '../views/add-story-view';
import StoryModel from '../models/story-model';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import CONFIG from '../config';
import { showNotification } from '../utils/index.js';

class AddStoryPresenter {
  constructor(view, model) {
    this.view = view;
    this.model = model;
    this.currentStream = null;
    this.lat = null;
    this.lon = null;
    this.leafletMap = null;
    this.mapMarker = null;
  }

  async init() {
    this.view.initListeners({
      onFormSubmit: this._handleFormSubmit.bind(this),
      onCameraClick: this._handleCameraClick.bind(this),
      onCaptureClick: this._handleCaptureClick.bind(this),
      onMapClick: this._handleMapClick.bind(this),
      onPhotoSelected: this._handlePhotoSelected.bind(this),
    });

    this._initializePage();
  }

  async _initializePage() {
    const streets = L.tileLayer(`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${CONFIG.MAPTILER_API_KEY}`, {
        attribution: '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
    });
    const basic = L.tileLayer(`https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}.png?key=${CONFIG.MAPTILER_API_KEY}`, {
        attribution: '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
    });
    const satellite = L.tileLayer(`https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=${CONFIG.MAPTILER_API_KEY}`, {
        attribution: '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
    });

    const baseMaps = {
        "Streets": streets,
        "Basic": basic,
        "Satellite": satellite
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          this.lat = lat;
          this.lon = lon;
          this.view.initializeMap(lat, lon, { onMapClick: this._handleMapClick.bind(this) }, baseMaps);
        },
        (error) => {
          console.error("Geolocation is not supported or permission denied: ", error);
          this.view.initializeMap(0, 0, { onMapClick: this._handleMapClick.bind(this) }, baseMaps);
        }
      );
    } else {
      console.warn("Geolocation is not supported by this browser.");
      this.view.initializeMap(0, 0, { onMapClick: this._handleMapClick.bind(this) }, baseMaps);
    }
  }

  async _handleFormSubmit(data) {
    const { description, photo } = data;
    
    // Validasi file: pastikan ada foto, jenisnya gambar, dan ukurannya tidak lebih dari 1MB
    if (!description || !photo) {
      showNotification('Deskripsi dan foto tidak boleh kosong.', 'error');
      return;
    }

    if (photo.size > 1000000) {
      showNotification('Ukuran foto tidak boleh lebih dari 1 MB.', 'error');
      return;
    }

    if (!photo.type.startsWith('image/')) {
      showNotification('File yang diunggah harus berupa gambar.', 'error');
      return;
    }

    this.view.setLoadingState(true);

    try {
      const authToken = localStorage.getItem('authToken');

      if (authToken) {
        await this.model.addStory({
          description,
          photo,
          lat: this.lat,
          lon: this.lon
        });
      } else {
        await this.model.addGuestStory({
          description,
          photo,
          lat: this.lat,
          lon: this.lon
        });
      }

      showNotification('Cerita berhasil ditambahkan!', 'success');
      this.view.setLoadingState(false);
      setTimeout(() => {
        window.location.hash = '#/';
      }, 1500);

    } catch (error) {
      showNotification(error.message, 'error');
      this.view.setLoadingState(false);
    }
  }

  async _handleCameraClick() {
    try {
      if (this.currentStream) {
        this.view.stopCameraStream(this.currentStream);
        this.currentStream = null;
        this.view.cameraBtn.innerHTML = '<i class="fas fa-camera"></i> Ambil dari Kamera';
        this.view.captureBtn.style.display = 'none';
      } else {
        this.currentStream = await this.view.startCameraStream();
        this.view.cameraBtn.innerHTML = '<i class="fas fa-video-slash"></i> Tutup Kamera';
        this.view.captureBtn.style.display = 'inline-block';
      }
    } catch (error) {
      showNotification('Akses kamera ditolak atau tidak tersedia.', 'error');
    }
  }
  
  _handleCaptureClick() {
    this.view.capturePhoto();
    this.view.stopCameraStream(this.currentStream);
    this.currentStream = null;
    this.view.cameraBtn.innerHTML = '<i class="fas fa-camera"></i> Ambil dari Kamera';
    this.view.captureBtn.style.display = 'none';
  }
  
  _handlePhotoSelected(file) {
    if (file) {
      this.view.showPhotoPreview(file);
    }
  }

  _handleMapClick(lat, lon) {
    this.lat = lat;
    this.lon = lon;
  }
}

export default AddStoryPresenter;