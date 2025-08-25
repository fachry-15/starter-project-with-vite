import { getStories, getStoryDetail, addStory, addGuestStory as addGuestStoryApi } from '../data/api.js';
import CONFIG from '../config.js';

class StoryModel {
  static async fetchStories() {
    const result = await getStories();
    if (!result.success) throw new Error(result.message);
    return result.data;
  }

  static async fetchStoryDetail(id) {
    const result = await getStoryDetail(id);
    if (!result.success) throw new Error(result.message);
    return result.data;
  }
  
  static async addStory(data) {
    const result = await addStory(data);
    if (!result.success) throw new Error(result.message);
    return result.data;
  }

  static async addGuestStory(data) {
    const result = await addGuestStoryApi(data);
    if (!result.success) throw new Error(result.message);
    return result.data;
  }
  
  static getGeolocation() {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lon: position.coords.longitude
            });
          },
          (error) => {
            console.error("Geolocation error: ", error);
            reject(new Error('Geolocation is not supported or permission denied.'));
          }
        );
      } else {
        reject(new Error('Geolocation is not supported by this browser.'));
      }
    });
  }

  static async submitStory(data) {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      return this.addStory(data);
    } else {
      return this.addGuestStory(data);
    }
  }

  static async fetchAuthenticatedStories() {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      throw new Error('Missing authentication');
    }
    const result = await getStories();
    if (!result.success) throw new Error(result.message);
    return result.data;
  }

  static clearAuthData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }
  
  static async getLocationName(lat, lon) {
    try {
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${lon},${lat}.json?key=${CONFIG.MAPTILER_API_KEY}`
      );
      if (response.ok) {
        const data = await response.json();
        let locationName = 'Lokasi tidak dikenal';
        if (data && data.features && data.features.length > 0) {
          locationName = data.features[0].place_name || locationName;
        }
        return locationName;
      }
    } catch (error) {
      console.warn('Error getting location name:', error);
    }
    return 'Lokasi tersedia';
  }
}

export default StoryModel;