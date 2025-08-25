import AddStoryView from '../../views/add-story-view';
import AddStoryPresenter from '../../presenters/add-story-presenter';
import StoryModel from '../../models/story-model';

export default class AddStoryPage {
  async render() {
    return `
      <section class="container">
        <div class="card fade-in-up">
          <h1 style="text-align: center; margin-bottom: 30px;">Tambah Cerita Baru</h1>
          <p style="text-align: center; color: #666; margin-bottom: 40px;">
            Bagikan momen spesialmu dengan menambahkan cerita baru
          </p>
          <form id="add-story-form">
            <div class="form-group">
              <label for="description">Deskripsi Cerita</label>
              <textarea id="description" name="description" rows="4" required placeholder="Ceritakan kisahmu di sini..." style="width:100%; border:1px solid #ddd; border-radius:8px; padding:12px; font-size:1rem;"></textarea>
            </div>
            
            <div class="form-group">
              <label for="photo">Unggah Foto</label>
              <input type="file" id="photo" name="photo" accept="image/*" required style="display:block; margin-bottom:10px;">
              <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                <button type="button" class="btn btn-secondary" id="camera-btn" style="padding:10px 18px; font-size:0.9rem;">
                  <i class="fas fa-camera"></i> Ambil dari Kamera
                </button>
                <button type="button" class="btn btn-secondary" id="capture-btn" style="padding:10px 18px; font-size:0.9rem; display:none;">
                  <i class="fas fa-camera"></i> Tangkap
                </button>
              </div>
              <video id="camera-stream" autoplay style="width:100%; max-width:400px; display:none; border-radius:12px; margin:auto;"></video>
              <img id="photo-preview" src="#" alt="Pratinjau Foto" style="width:100%; max-width:400px; display:none; border-radius:12px; margin-top:10px; margin-bottom:10px;">
            </div>
            
            <div class="form-group" style="margin-top: 30px;">
              <label>Pilih Lokasi di Peta</label>
              <div id="story-map" style="width:100%; height:300px; border-radius:12px; margin-bottom:10px;"></div>
              <p id="coordinates-info" style="text-align:center; color:#666;">Klik peta untuk memilih lokasi</p>
            </div>
            
            <div style="text-align: center; margin-top: 40px;">
              <button type="submit" id="submit-btn" class="btn">
                <i class="fas fa-plus"></i> Tambah Cerita
              </button>
            </div>
          </form>
        </div>
      </section>
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