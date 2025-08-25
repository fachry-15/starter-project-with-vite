import StoryModel from '../../models/story-model';
import StoryDetailView from '../../views/story-detail-view';
import StoryDetailPresenter from '../../presenters/story-detail-presenter';
import 'leaflet/dist/leaflet.css';

export default class StoryDetailPage {
  async render() {
    return `
      <div class="story-detail-container">
        <div class="container">
          <nav aria-label="breadcrumb" style="margin-bottom: 24px;">
            <ol style="list-style:none; display:flex; align-items:center; gap:8px; padding:0; margin:0;">
              <li>
                <a href="#/" style="color:#4F8EF7; text-decoration:none; font-weight:500;">
                  <i class="fas fa-arrow-left"></i> Kembali ke Daftar Cerita
                </a>
              </li>
              <li style="color:#888;">/</li>
              <li style="color:#222; font-weight:600;">Detail Cerita</li>
            </ol>
          </nav>
          <div id="loading-state" class="loading-container">
            <div class="loading-spinner">
              <i class="fas fa-spinner fa-spin"></i>
            </div>
            <p>Loading story...</p>
          </div>
          <div id="error-state" class="error-container" style="display: none;">
            <div class="error-content">
              <i class="fas fa-exclamation-triangle"></i>
              <h3>Story not found</h3>
              <p id="error-message">The story you're looking for doesn't exist or has been removed.</p>
              <a href="#/" class="btn btn-primary">
                <i class="fas fa-arrow-left"></i> Back to Stories
              </a>
            </div>
          </div>
          <div id="story-content" class="story-detail-content" style="display: none;">
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

    const storyDetailView = new StoryDetailView();
    const storyDetailPresenter = new StoryDetailPresenter(storyDetailView, StoryModel);
    storyDetailPresenter.init();
  }
}