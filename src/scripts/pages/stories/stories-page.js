export default class StoriesPage {
  async render() {
    return `
      <section class="container">
        <div class="card fade-in-up">
          <h1 style="text-align: center; margin-bottom: 30px;">Daftar Cerita</h1>
          <p style="text-align: center; color: #666; margin-bottom: 40px;">
            Jelajahi koleksi cerita menarik dari komunitas kami
          </p>
        </div>
        
        <div class="stories-grid">
          <div class="story-card fade-in-up">
            <div class="story-image">
              <div style="width: 100%; height: 200px; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem;">📖</div>
            </div>
            <div class="story-content">
              <h3>Petualangan di Gunung Bromo</h3>
              <p class="story-author">oleh: Sarah</p>
              <p class="story-excerpt">Perjalanan menakjubkan menuju salah satu gunung berapi terindah di Indonesia...</p>
              <div class="story-stats">
                <span>❤️ 124</span>
                <span>💬 23</span>
                <span>👁️ 1.2K</span>
              </div>
            </div>
          </div>
          
          <div class="story-card fade-in-up">
            <div class="story-image">
              <div style="width: 100%; height: 200px; background: linear-gradient(135deg, #ff6b6b, #4ecdc4); display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem;">🌊</div>
            </div>
            <div class="story-content">
              <h3>Liburan di Pantai Kuta</h3>
              <p class="story-author">oleh: Ahmad</p>
              <p class="story-excerpt">Menikmati keindahan sunset dan ombak yang menawan di Bali...</p>
              <div class="story-stats">
                <span>❤️ 89</span>
                <span>💬 15</span>
                <span>👁️ 856</span>
              </div>
            </div>
          </div>
          
          <div class="story-card fade-in-up">
            <div class="story-image">
              <div style="width: 100%; height: 200px; background: linear-gradient(135deg, #a8e6cf, #ffd93d); display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem;">🏙️</div>
            </div>
            <div class="story-content">
              <h3>Kehidupan di Jakarta</h3>
              <p class="story-author">oleh: Rina</p>
              <p class="story-excerpt">Pengalaman tinggal di ibu kota yang tidak pernah tidur...</p>
              <div class="story-stats">
                <span>❤️ 156</span>
                <span>💬 34</span>
                <span>👁️ 2.1K</span>
              </div>
            </div>
          </div>
          
          <div class="story-card fade-in-up">
            <div class="story-image">
              <div style="width: 100%; height: 200px; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem;">🎓</div>
            </div>
            <div class="story-content">
              <h3>Perjalanan Kuliah</h3>
              <p class="story-author">oleh: Budi</p>
              <p class="story-excerpt">Cerita suka duka mahasiswa dalam mengejar impian...</p>
              <div class="story-stats">
                <span>❤️ 203</span>
                <span>💬 67</span>
                <span>👁️ 3.4K</span>
              </div>
            </div>
          </div>
          
          <div class="story-card fade-in-up">
            <div class="story-image">
              <div style="width: 100%; height: 200px; background: linear-gradient(135deg, #ffeaa7, #fab1a0); display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem;">🍳</div>
            </div>
            <div class="story-content">
              <h3>Resep Masakan Tradisional</h3>
              <p class="story-author">oleh: Ibu Sari</p>
              <p class="story-excerpt">Warisan kuliner nusantara yang tak boleh hilang...</p>
              <div class="story-stats">
                <span>❤️ 178</span>
                <span>💬 45</span>
                <span>👁️ 2.8K</span>
              </div>
            </div>
          </div>
          
          <div class="story-card fade-in-up">
            <div class="story-image">
              <div style="width: 100%; height: 200px; background: linear-gradient(135deg, #74b9ff, #0984e3); display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem;">💻</div>
            </div>
            <div class="story-content">
              <h3>Belajar Programming</h3>
              <p class="story-author">oleh: Andi</p>
              <p class="story-excerpt">Tips dan trik menjadi programmer handal dari nol...</p>
              <div class="story-stats">
                <span>❤️ 245</span>
                <span>💬 89</span>
                <span>👁️ 4.1K</span>
              </div>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 40px;">
          <button class="btn">Muat Lebih Banyak</button>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Add fade-in animation to elements
    const elements = document.querySelectorAll('.fade-in-up');
    elements.forEach((element, index) => {
      setTimeout(() => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.6s ease-out';
        
        requestAnimationFrame(() => {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        });
      }, index * 100);
    });
  }
}
