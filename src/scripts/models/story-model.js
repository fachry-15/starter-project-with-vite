import { getStories, getStoryDetail, addStory } from '../data/api.js';

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
}

export default StoryModel;