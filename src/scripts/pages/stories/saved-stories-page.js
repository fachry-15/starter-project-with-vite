// File: src/scripts/pages/stories/saved-stories-page.js

import SavedStoriesView from '../../views/saved-stories-view';
import SavedStoriesPresenter from '../../presenters/saved-stories-presenter';
import { getAllSavedStories } from '../../utils/idb-helper';

export default class SavedStoriesPage {
  async render() {
    return `
      <section class="container">
        <div class="card fade-in-up">
          <h1 style="text-align: center; margin-bottom: 30px;">Cerita Tersimpan</h1>
          <p style="text-align: center; color: #666; margin-bottom: 40px;">
            Koleksi cerita yang telah Anda simpan secara lokal.
          </p>
          <div id="saved-stories-container" class="stories-grid"></div>
          
          <div id="empty-state" style="display: none; text-align: center; padding: 40px;">
            <div style="font-size: 3.5rem; color: var(--primary-color); margin-bottom: 20px;">🔖</div>
            <h2>Belum Ada Cerita yang Disimpan</h2>
            <p style="color: #666; margin: 15px 0;">Simpan cerita favoritmu dari daftar cerita untuk bisa diakses secara offline.</p>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.classList.remove('auth-page');
    }
    const savedStoriesView = new SavedStoriesView();
    const savedStoriesPresenter = new SavedStoriesPresenter(savedStoriesView, { getAllSavedStories });
    savedStoriesPresenter.init();
  }
}