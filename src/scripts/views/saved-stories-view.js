// File: src/scripts/views/saved-stories-view.js

import { showNotification } from '../utils/index.js';

class SavedStoriesView {
  constructor() {
    this.container = document.getElementById('saved-stories-container');
    this.emptyState = document.getElementById('empty-state');
  }

  initListeners(handlers) {
    this.container.addEventListener('click', async (event) => {
      const deleteBtn = event.target.closest('.btn-delete-story');
      if (deleteBtn) {
        event.stopPropagation();
        handlers.onDeleteStory(deleteBtn.dataset.storyId);
      }
    });
  }

  renderStories(stories) {
    if (!this.container) return;
    
    if (stories.length === 0) {
      this.showEmptyState();
      return;
    }
    
    this.hideEmptyState();

    const truncateText = (text, maxLength) => text.length <= maxLength ? text : text.substring(0, maxLength).trim() + '...';
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    this.container.innerHTML = stories.map(story => `
      <div class="story-card fade-in-up" data-story-id="${story.id}" style="box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-radius: 12px; overflow: hidden; transition: transform 0.3s ease, box-shadow 0.3s ease; background-color: white;">
        <div class="story-image" style="position: relative; height: 200px; overflow: hidden;">
          ${story.photoUrl 
            ? `<img src="${story.photoUrl}" alt="${story.name}'s story" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;">`
            : `<div style="width: 100%; height: 200px; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem;">📖</div>`
          }
        </div>
        <div class="story-content" style="padding: 16px;">
          <div class="story-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div class="story-author" style="display: flex; align-items: center;">
              <div class="author-avatar" style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary-color); display: flex; align-items: center; justify-content: center; color: white; margin-right: 12px;">
                <i class="fas fa-user"></i>
              </div>
              <div class="author-info">
                <p class="author-name" style="font-weight: bold; margin: 0;">${story.name}</p>
                <p class="story-date" style="font-size: 0.8rem; color: #666; margin: 0;">${formatDate(story.createdAt)}</p>
              </div>
            </div>
            ${story.lat && story.lon ? `
              <div class="story-location" style="font-size: 0.8rem; color: #666; text-align: right; max-width: 150px;">
                <i class="fas fa-map-marker-alt"></i>
                <span>Lokasi tersedia</span>
              </div>
            ` : ''}
          </div>
          <h3 class="story-title" style="font-size: 1.2rem; margin: 0 0 10px 0;">${story.description.split(' ').slice(0, 5).join(' ')}...</h3>
          <p class="story-excerpt" style="font-size: 0.9rem; color: #666; margin-bottom: 16px; line-height: 1.5;">${truncateText(story.description, 120)}</p>
          <button class="btn btn-secondary btn-delete-story" data-story-id="${story.id}">
            <i class="fas fa-trash"></i> Hapus
          </button>
        </div>
      </div>
    `).join('');
  }
  
  showNotification(message, type) {
    showNotification(message, type);
  }

  showEmptyState() {
    if (this.container) this.container.innerHTML = '';
    if (this.emptyState) this.emptyState.style.display = 'block';
  }
  
  hideEmptyState() {
    if (this.emptyState) this.emptyState.style.display = 'none';
  }
}

export default SavedStoriesView;