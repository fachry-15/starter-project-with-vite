// File: src/scripts/utils/idb-helper.js

import { openDB } from 'idb';

const DATABASE_NAME = 'lets-talks-database';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'saved-stories';

const openDatabase = () => {
  return openDB(DATABASE_NAME, DATABASE_VERSION, {
    upgrade(database) {
      database.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
    },
  });
};

export async function addStoryToIndexedDB(story) {
  const db = await openDatabase();
  const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
  const store = tx.objectStore(OBJECT_STORE_NAME);
  await store.put(story);
  return tx.done;
}

export async function getAllSavedStories() {
  const db = await openDatabase();
  return db.getAll(OBJECT_STORE_NAME);
}

export async function getSavedStory(id) {
  const db = await openDatabase();
  return db.get(OBJECT_STORE_NAME, id);
}

export async function deleteStoryFromIndexedDB(id) {
  const db = await openDatabase();
  await db.delete(OBJECT_STORE_NAME, id);
}