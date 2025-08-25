import { getStories } from '../data/api.js';

class StoryModel {
  static async fetchStories() {
    const result = await getStories();
    if (!result.success) throw new Error(result.message);
    return result.data;
  }
}

export default StoryModel;