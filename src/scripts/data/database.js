import { openDB } from 'idb';

const DATABASE_NAME = 'lets-talks-database';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'offline-stories';

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database) {
    database.createObjectStore(OBJECT_STORE_NAME, {
      keyPath: 'id',
      autoIncrement: true,
    });
  },
});

export const IndexedDBHelper = {
  async addStory(story) {
    const db = await dbPromise;
    const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
    const store = tx.objectStore(OBJECT_STORE_NAME);
    await store.add(story);
    return tx.done;
  },

  async getAllStories() {
    const db = await dbPromise;
    return db.getAll(OBJECT_STORE_NAME);
  },

  async deleteStory(storyId) {
    const db = await dbPromise;
    return db.delete(OBJECT_STORE_NAME, storyId);
  },
};