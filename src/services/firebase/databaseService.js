import { getApp } from '@react-native-firebase/app';
import {
  getDatabase,
  ref,
  push,
  set,
  update,
  remove,
  get,
  onValue,
} from '@react-native-firebase/database';
import database from '@react-native-firebase/database'; // <-- Import the namespaced API for ServerValue

const app = getApp();
const db = getDatabase(app);

class DatabaseService {
  // Add document to collection (push new child)
  async addDocument(collectionName, data) {
    try {
      const newRef = push(ref(db, collectionName));
      await set(newRef, {
        ...data,
        createdAt: database.ServerValue.TIMESTAMP,   // <-- Use namespaced API for TIMESTAMP
        updatedAt: database.ServerValue.TIMESTAMP,
      });
      return { success: true, id: newRef.key };
    } catch (error) {
      console.error('Error adding document:', error);
      return { success: false, error: error.message };
    }
  }

  // Get document by ID
  async getDocument(collectionName, docId) {
    try {
      const snapshot = await get(ref(db, `${collectionName}/${docId}`));
      if (snapshot.exists()) {
        return { success: true, data: { id: docId, ...snapshot.val() } };
      } else {
        return { success: false, error: 'Document not found' };
      }
    } catch (error) {
      console.error('Error getting document:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all documents from collection
  async getCollection(collectionName) {
    try {
      const snapshot = await get(ref(db, collectionName));
      const data = snapshot.val() || {};
      const documents = Object.keys(data).map(id => ({ id, ...data[id] }));
      return { success: true, data: documents };
    } catch (error) {
      console.error('Error getting collection:', error);
      return { success: false, error: error.message };
    }
  }

  // Update document
  async updateDocument(collectionName, docId, data) {
    try {
      await update(ref(db, `${collectionName}/${docId}`), {
        ...data,
        updatedAt: database.ServerValue.TIMESTAMP,   // <-- Use namespaced API for TIMESTAMP
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating document:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete document
  async deleteDocument(collectionName, docId) {
    try {
      await remove(ref(db, `${collectionName}/${docId}`));
      return { success: true };
    } catch (error) {
      console.error('Error deleting document:', error);
      return { success: false, error: error.message };
    }
  }

  // Real-time listener for document
  subscribeToDocument(collectionName, docId, callback) {
    const docRef = ref(db, `${collectionName}/${docId}`);
    const listener = onValue(docRef, snapshot => {
      if (snapshot.exists()) {
        callback({ success: true, data: { id: docId, ...snapshot.val() } });
      } else {
        callback({ success: false, error: 'Document not found' });
      }
    }, error => {
      callback({ success: false, error: error.message });
    });
    // Return unsubscribe function
    return () => listener();
  }

  // Real-time listener for collection
  subscribeToCollection(collectionName, callback) {
    const colRef = ref(db, collectionName);
    const listener = onValue(colRef, snapshot => {
      const data = snapshot.val() || {};
      const documents = Object.keys(data).map(id => ({ id, ...data[id] }));
      callback({ success: true, data: documents });
    }, error => {
      callback({ success: false, error: error.message });
    });
    // Return unsubscribe function
    return () => listener();
  }

  // User-specific methods
  async getUserData(userId) {
    return this.getDocument('users', userId);
  }

  async updateUserData(userId, data) {
    return this.updateDocument('users', userId, data);
  }

  async getUserPosts(userId) {
    // Assuming posts are stored under /posts/{postId} with a userId field
    const allPosts = await this.getCollection('posts');
    if (allPosts.success) {
      const userPosts = allPosts.data.filter(post => post.userId === userId);
      return { success: true, data: userPosts };
    }
    return allPosts;
  }
}

export default new DatabaseService();