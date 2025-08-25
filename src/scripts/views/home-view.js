class HomeView {
  constructor(container) {
    this.container = container;
  }

  async renderStories(stories, helpers = {}) {
    // helpers: { getLocationName, formatDate, truncateText, truncateLocation }
    const {
      getLocationName = async () => '',
      formatDate = (d) => d,
      truncateText = (t, l) => t,
      truncateLocation = (t, l) => t,
    } = helpers;

    // Ambil nama lokasi untuk semua stories yang memiliki koordinat
    const storiesWithLocations = await Promise.all(
      stories.map(async (story) => {
        if (story.lat && story.lon) {
          const locationName = await getLocationName(story.lat, story.lon);
          return { ...story, locationName };
        }
        return story;
      })
    );

    this.container.innerHTML = storiesWithLocations.map(story => `
      <div class="story-card fade-in-up" data-story-id="${story.id}" style="box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-radius: 12px; overflow: hidden; transition: transform 0.3s ease, box-shadow 0.3s ease; background-color: white;">
        <div class="story-image" style="position: relative; height: 200px; overflow: hidden;">
          ${story.photoUrl 
            ? `<img src="${story.photoUrl}" alt="${story.name}'s story" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;">`
            : `<div style="width: 100%; height: 200px; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem;">📖</div>`
          }
          <div class="story-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.3); opacity: 0; transition: opacity 0.3s ease; display: flex; align-items: center; justify-content: center;">
            <button class="btn-view-story" data-story-id="${story.id}" style="padding: 8px 16px; background-color: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer;">
              <i class="fas fa-eye"></i> Lihat Cerita
            </button>
          </div>
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
              <div class="story-location" style="font-size: 0.8rem; color: #666; cursor: pointer; text-align: right; max-width: 150px;" title="${story.locationName || 'Lokasi tersedia'}" onclick="window.open('https://www.openstreetmap.org/?mlat=${story.lat}&mlon=${story.lon}&zoom=15', '_blank')">
                <i class="fas fa-map-marker-alt"></i>
                <span>${truncateLocation(story.locationName || 'Lokasi tersedia')}</span>
              </div>
            ` : ''}
          </div>
          <h3 class="story-title" style="font-size: 1.2rem; margin: 0 0 10px 0;">${story.description.split(' ').slice(0, 5).join(' ')}...</h3>
          <p class="story-excerpt" style="font-size: 0.9rem; color: #666; margin-bottom: 16px; line-height: 1.5;">${truncateText(story.description, 120)}</p>
        </div>
      </div>
    `).join('');

    // Add click handlers for view story buttons
    this.container.querySelectorAll('.btn-view-story').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const storyId = btn.dataset.storyId;
        if (helpers.onViewStory) helpers.onViewStory(storyId);
      });
    });

    // Add click handlers for story cards
    this.container.querySelectorAll('.story-card').forEach(card => {
      card.addEventListener('click', () => {
        const storyId = card.dataset.storyId;
        if (helpers.onViewStory) helpers.onViewStory(storyId);
      });
      
      // Add hover effect
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-5px)';
        card.style.boxShadow = '0 10px 20px rgba(0,0,0,0.15)';
        const overlay = card.querySelector('.story-overlay');
        if (overlay) {
          overlay.style.opacity = '1';
        }
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
        const overlay = card.querySelector('.story-overlay');
        if (overlay) {
          overlay.style.opacity = '0';
        }
      });
    });
  }

  renderLoading() {
    this.container.innerHTML = `
      <div class="loader"></div>
      <p style="margin-top: 15px; color: #666;">Memuat cerita...</p>
    `;
  }

  renderError(message) {
    this.container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <div style="font-size: 3.5rem; color: #e74c3c; margin-bottom: 20px;">😕</div>
        <h2>Gagal Memuat Cerita</h2>
        <p style="color: #666; margin: 15px 0 25px;">${message}</p>
        <button id="retry-btn" class="btn">Coba Lagi</button>
      </div>
    `;
  }
}

export default HomeView;