import StoryModel from '../models/story-model.js';
import HomeView from '../views/home-view.js';

class HomePresenter {
  constructor(container) {
    this.view = new HomeView(container);
  }

  async init() {
    this.view.renderLoading();
    try {
      const stories = await StoryModel.fetchStories();
      this.view.renderStories(stories, this.handleStoryClick);
    } catch (e) {
      this.view.renderError(e.message || 'Gagal memuat cerita');
    }
  }

  handleStoryClick(storyId) {
    window.location.hash = `#/story/${storyId}`;
  }
}

export default HomePresenter;