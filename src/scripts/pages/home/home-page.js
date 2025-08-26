import HomePresenter from '../../presenters/home-presenter.js';
import HomeView from '../../views/home-view.js';
import StoryModel from '../../models/story-model.js';

class HomePage {
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
          <div id="stories-map-wrapper" style="display:none;">
            <div style="text-align:right; margin-bottom:8px;">
              <button id="close-map-btn" class="btn" style="padding:4px 16px; font-size:0.95rem;">
                <i class="fas fa-times"></i> Tutup Peta
              </button>
            </div>
            <div id="stories-map" style="width: 100%; height: 350px; margin: 0 0 40px 0; border-radius: 16px; overflow: hidden;"></div>
          </div>
        </div>
        
        <div id="loading-state" style="text-align: center; padding: 40px;">
          <div class="loader"></div>
          <p style="margin-top: 15px; color: #666;">Memuat cerita...</p>
        </div>
        
        <div id="login-required-state" style="display: none; text-align: center; padding: 40px;">
          <div style="font-size: 3.5rem; color: var(--primary-color); margin-bottom: 20px;">🔒</div>
          <h2>Kamu harus login terlebih dahulu</h2>
          <p style="color: #666; margin: 15px 0 25px;">Untuk melihat seluruh cerita, silakan login ke akun kamu</p>
          <a href="#/login" class="btn">Login Sekarang</a>
        </div>
        
        <div id="error-state" style="display: none; text-align: center; padding: 40px;">
          <div style="font-size: 3.5rem; color: #e74c3c; margin-bottom: 20px;">😕</div>
          <h2>Gagal Memuat Cerita</h2>
          <p id="error-message" style="color: #666; margin: 15px 0 25px;">Terjadi kesalahan saat memuat cerita.</p>
          <button id="retry-btn" class="btn">Coba Lagi</button>
        </div>
        
        <div id="empty-state" style="display: none; text-align: center; padding: 40px;">
          <div style="font-size: 3.5rem; color: var(--primary-color); margin-bottom: 20px;">📭</div>
          <h2>Belum Ada Cerita</h2>
          <p style="color: #666; margin: 15px 0;">Jadilah yang pertama berbagi cerita menarikmu!</p>
        </div>
        
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
        
        <div id="stories-container" class="stories-grid" style="margin-top: 20px;"></div>
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
    // Menghapus kelas 'auth-page' dari konten utama jika ada.
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.classList.remove('auth-page');
    }

    // Menginisialisasi View dan Presenter
    const homeView = new HomeView();
    const homePresenter = new HomePresenter(homeView, StoryModel);
    // Presenter mengambil alih seluruh kendali
    homePresenter.init();
  }
}

export default HomePage;