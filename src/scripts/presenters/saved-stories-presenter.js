// File: src/scripts/presenters/saved-stories-presenter.js

import SavedStoriesView from '../views/saved-stories-view';
import { deleteStoryFromIndexedDB } from '../utils/idb-helper';

class SavedStoriesPresenter {
  constructor(view, model) {
    this.view = view;
    this.model = model;
  }

  async init() {
    this.view.initListeners({
      onDeleteStory: this._handleDeleteStory.bind(this),
    });
    this._loadSavedStories();
  }

  async _loadSavedStories() {
    try {
      const savedStories = await this.model.getAllSavedStories();
      this.view.renderStories(savedStories);
    } catch (error) {
      console.error('Error loading saved stories:', error);
      this.view.showNotification('Gagal memuat cerita tersimpan.', 'error');
      this.view.renderStories([]);
    }
  }

  async _handleDeleteStory(storyId) {
    try {
      await deleteStoryFromIndexedDB(storyId);
      this.view.showNotification('Cerita berhasil dihapus.', 'success');
      this._loadSavedStories();
    } catch (error) {
      this.view.showNotification('Gagal menghapus cerita.', 'error');
    }
  }
}

export default SavedStoriesPresenter;