import AddStoryView from '../views/add-story-view';
import StoryModel from '../models/story-model';

class AddStoryPresenter {
  constructor(view, model) {
    this.view = view;
    this.model = model;
    this.currentStream = null;
    this.lat = null;
    this.lon = null;
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
    // Gunakan geolocation API untuk mendapatkan lokasi awal
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          this.lat = lat;
          this.lon = lon;
          this.view.initializeMap(lat, lon, { onMapClick: this._handleMapClick.bind(this) });
          this.view.updateMapCoordinates(lat, lon);
        },
        (error) => {
          console.error("Geolocation is not supported or permission denied: ", error);
          this.view.initializeMap(0, 0, { onMapClick: this._handleMapClick.bind(this) });
        }
      );
    } else {
      console.warn("Geolocation is not supported by this browser.");
      this.view.initializeMap(0, 0, { onMapClick: this._handleMapClick.bind(this) });
    }
  }

  async _handleFormSubmit(data) {
    const { description, photo } = data;
    
    if (!description || !photo) {
      this.view.showNotification('Deskripsi dan foto tidak boleh kosong.', 'error');
      return;
    }

    this.view.setLoadingState(true);

    try {
      await this.model.addStory({
        description,
        photo,
        lat: this.lat,
        lon: this.lon
      });

      this.view.showNotification('Cerita berhasil ditambahkan!', 'success');
      this.view.setLoadingState(false);
      setTimeout(() => {
        window.location.hash = '#/';
      }, 1500);

    } catch (error) {
      this.view.showNotification(error.message, 'error');
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
      this.view.showNotification('Akses kamera ditolak atau tidak tersedia.', 'error');
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
    this.view.showNotification(`Lokasi dipilih: ${lat.toFixed(4)}, ${lon.toFixed(4)}`, 'info');
  }
}

export default AddStoryPresenter;