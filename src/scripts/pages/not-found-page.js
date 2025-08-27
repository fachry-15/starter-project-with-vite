export default class NotFoundPage {
  async render() {
    return `
      <section class="container not-found-page">
        <div class="not-found-content">
          <h1>404</h1>
          <h2>Halaman Tidak Ditemukan</h2>
          <p>Maaf, halaman yang Anda cari tidak ada. Mungkin Anda salah mengetik alamat atau halaman telah dipindahkan.</p>
          <a href="#/" class="btn">Kembali ke Beranda</a>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.classList.remove('auth-page');
    }
  }
}