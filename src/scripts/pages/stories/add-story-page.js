import AddStoryView from '../../views/add-story-view';
import AddStoryPresenter from '../../presenters/add-story-presenter';
import StoryModel from '../../models/story-model';
import 'leaflet/dist/leaflet.css';

export default class AddStoryPage {
  async render() {
    return `
      <div class="story-add-container">
        <div class="story-add-card">
          <div class="form-section">
            <div class="form-header">
              <h1>Tambah Cerita Baru</h1>
              <p>Bagikan momen spesialmu dengan menambahkan cerita baru</p>
            </div>
            <form id="add-story-form" class="story-form">
              <div class="form-group">
                <label for="description">Deskripsi Cerita</label>
                <textarea id="description" name="description" rows="4" required placeholder="Ceritakan kisahmu di sini..."></textarea>
              </div>
              
              <div class="form-group file-input-group">
                <label for="photo">Unggah Foto</label>
                <div class="photo-controls">
                  <div class="file-input-wrapper">
                    <input type="file" id="photo" name="photo" accept="image/*" required>
                    <button type="button" class="btn btn-secondary upload-btn">
                        <i class="fas fa-upload"></i> Pilih Foto
                    </button>
                    <span id="file-name" class="file-name">Belum ada file yang dipilih</span>
                  </div>
                  <button type="button" class="btn btn-secondary" id="camera-btn">
                    <i class="fas fa-camera"></i> Ambil dari Kamera
                  </button>
                  <button type="button" class="btn btn-secondary compact" id="capture-btn" style="display:none;">
                    <i class="fas fa-camera"></i> Tangkap
                  </button>
                </div>
                <div class="photo-preview-wrapper">
                  <video id="camera-stream" autoplay style="display:none;"></video>
                  <img id="photo-preview" src="#" alt="Pratinjau Foto" style="display:none;">
                </div>
              </div>

              <div class="form-group">
                <label>Pilih Lokasi di Peta</label>
              </div>
              
              <button type="submit" class="auth-submit-btn" id="submit-btn">
                <span class="btn-text"><i class="fas fa-plus"></i> Tambah Cerita</span>
                <span class="btn-loading" style="display: none;">
                  <i class="fas fa-spinner fa-spin"></i> Mengirim...
                </span>
              </button>
            </form>
          </div>
          <div class="map-section">
            <div id="story-map" class="map-container"></div>
          </div>
        </div>
      </div>
    `;
  }

  async afterRender() {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.classList.remove('auth-page');
    }
    
    const addStoryView = new AddStoryView();
    const addStoryPresenter = new AddStoryPresenter(addStoryView, StoryModel);
    addStoryPresenter.init();
  }
}