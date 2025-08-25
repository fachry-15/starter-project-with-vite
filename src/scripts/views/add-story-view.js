import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import CONFIG from '../config.js';

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
    this.coordinatesInfo = document.getElementById('coordinates-info');
    this.submitBtn = document.getElementById('submit-btn');

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
      });
    }

    if (this.cameraBtn) {
      this.cameraBtn.addEventListener('click', () => handlers.onCameraClick());
    }

    if (this.captureBtn) {
      this.captureBtn.addEventListener('click', () => handlers.onCaptureClick());
    }
  }

  getFormData() {
    return {
      description: this.descriptionInput.value,
      photo: this.photoInput.files[0],
    };
  }

  updateMapCoordinates(lat, lon) {
    this.coordinatesInfo.textContent = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
  }
  
  initializeMap(lat, lon, handlers) {
    if (this.map) {
      this.map.remove();
    }
    
    this.map = L.map(this.mapContainer).setView([lat, lon], 13);
    
    L.tileLayer(`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${CONFIG.MAPTILER_API_KEY}`, {
      attribution: '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
    }).addTo(this.map);

    this.map.on('click', (e) => {
      if (this.mapMarker) {
        this.map.removeLayer(this.mapMarker);
      }
      this.mapMarker = L.marker(e.latlng).addTo(this.map);
      this.updateMapCoordinates(e.latlng.lat, e.latlng.lng);
      handlers.onMapClick(e.latlng.lat, e.latlng.lng);
    });
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

  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `<div class="notification-content"><i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i><span>${message}</span></div>`;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }

  setLoadingState(loading) {
    this.submitBtn.disabled = loading;
    this.submitBtn.innerHTML = loading ? '<i class="fas fa-spinner fa-spin"></i> Mengirim...' : '<i class="fas fa-plus"></i> Tambah Cerita';
  }
}

export default AddStoryView;