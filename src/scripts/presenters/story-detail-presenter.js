import StoryModel from '../models/story-model';
import StoryDetailView from '../views/story-detail-view';
import { parseActivePathname } from '../routes/url-parser';

class StoryDetailPresenter {
  constructor(view, model) {
    this.view = view;
    this.model = model;
    this.storyId = null;
  }

  async init() {
    this._getStoryIdFromUrl();
    if (!this.storyId) {
      this.view.showError('ID cerita tidak valid.');
      return;
    }
    
    // Inisialisasi listener di View dan berikan handler dari Presenter
    this.view.initListeners({
      onBack: this._handleBack.bind(this),
      onRetry: this._loadStory.bind(this),
      onOpenMap: this._handleOpenMap.bind(this),
    });

    await this._loadStory();
  }

  _getStoryIdFromUrl() {
    const { id } = parseActivePathname();
    this.storyId = id;
  }

  async _loadStory() {
    this.view.showLoading();
    try {
      const story = await this.model.fetchStoryDetail(this.storyId);
      this.view.renderStory(story);
    } catch (error) {
      console.error('Error loading story:', error);
      this.view.showError(error.message);
    }
  }
  
  _handleBack() {
    window.location.hash = '#/';
  }

  _handleOpenMap(lat, lon) {
    const url = `http://maps.google.com/maps?q=${lat},${lon}`;
    window.open(url, '_blank');
  }
}

export default StoryDetailPresenter;