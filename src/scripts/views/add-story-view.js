import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import CONFIG from '../config.js';
import { showNotification } from '../utils/index.js';

class AddStoryView {
  constructor() {
    this.form = document.getElementById('add-story-form');
    this.descriptionInput = document.getElementById('description');
    this.photoInput = document.getElementById('photo');
    this.cameraBtn = document.getElementById('camera-btn');
    this.captureBtn = document.getElementById('capture-btn');
    this.videoElement = document.getElementById('camera-stream');
    this.photoPreview = document.getElementById('photo-preview');
    this.mapContainer = document.getElementById('story-map');
    this.submitBtn = document.getElementById('submit-btn');
    this.uploadBtn = document.querySelector('.upload-btn');
    this.fileNameDisplay = document.getElementById('file-name');

    this.map = null;
    this.mapMarker = null;
  }

  initListeners(handlers) {
    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = this.getFormData();
        handlers.onFormSubmit(data);
      });
    }

    if (this.photoInput) {
      this.photoInput.addEventListener('change', (e) => {
        handlers.onPhotoSelected(e.target.files[0]);
        this.updateFileName(e.target.files[0]);
      });
    }

    if (this.cameraBtn) {
      this.cameraBtn.addEventListener('click', () => handlers.onCameraClick());
    }

    if (this.captureBtn) {
      this.captureBtn.addEventListener('click', () => handlers.onCaptureClick());
    }

    if (this.uploadBtn) {
        this.uploadBtn.addEventListener('click', () => this.photoInput.click());
    }
  }

  getFormData() {
    return {
      description: this.descriptionInput.value,
      photo: this.photoInput.files[0],
    };
  }
  
  initializeMap(lat, lon, handlers, baseMaps) {
    if (this.map) {
      this.map.remove();
    }
    
    this.map = L.map(this.mapContainer).setView([lat, lon], 13);
    
    if (baseMaps) {
        L.control.layers(baseMaps).addTo(this.map);
        baseMaps.Streets.addTo(this.map);
    }

    this.map.on('click', (e) => {
      if (this.mapMarker) {
        this.map.removeLayer(this.mapMarker);
      }
      this.mapMarker = L.marker(e.latlng).addTo(this.map);
      handlers.onMapClick(e.latlng.lat, e.latlng.lng);
    });
  }

  setCameraState(isCameraOn) {
    if (isCameraOn) {
      this.cameraBtn.innerHTML = '<i class="fas fa-video-slash"></i> Tutup Kamera';
      this.captureBtn.style.display = 'inline-block';
    } else {
      this.cameraBtn.innerHTML = '<i class="fas fa-camera"></i> Ambil dari Kamera';
      this.captureBtn.style.display = 'none';
    }
  }

  startCameraStream() {
    return new Promise(async (resolve, reject) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
        this.videoElement.srcObject = stream;
        this.videoElement.style.display = 'block';
        this.photoPreview.style.display = 'none';
        this.videoElement.onloadedmetadata = () => resolve(stream);
        this.fileNameDisplay.textContent = 'Menggunakan kamera...';
      } catch (err) {
        console.error('Error accessing the camera:', err);
        reject(err);
      }
    });
  }

  stopCameraStream(stream) {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    this.videoElement.srcObject = null;
    this.videoElement.style.display = 'none';
  }

  capturePhoto() {
    const canvas = document.createElement('canvas');
    canvas.width = this.videoElement.videoWidth;
    canvas.height = this.videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], 'captured-photo.png', { type: 'image/png' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      this.photoInput.files = dataTransfer.files;
      this.showPhotoPreview(file);
      this.updateFileName(file);
    }, 'image/png');
  }

  showPhotoPreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.photoPreview.src = e.target.result;
      this.photoPreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }

  updateFileName(file) {
    if (file && this.fileNameDisplay) {
      this.fileNameDisplay.textContent = file.name;
    } else if (this.fileNameDisplay) {
      this.fileNameDisplay.textContent = 'Belum ada file yang dipilih';
    }
  }

  showNotification(message, type) {
    showNotification(message, type);
  }

  setLoadingState(loading) {
    this.submitBtn.disabled = loading;
    this.submitBtn.innerHTML = loading ? '<i class="fas fa-spinner fa-spin"></i> Mengirim...' : '<i class="fas fa-plus"></i> Tambah Cerita';
  }
}

export default AddStoryView;