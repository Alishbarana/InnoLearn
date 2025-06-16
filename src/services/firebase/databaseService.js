import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

class DatabaseService {
  // Add document to collection
  async addDocument(collectionName, data) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error adding document:', error);
      return { success: false, error: error.message };
    }
  }

  // Get document by ID
  async getDocument(collectionName, docId) {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { 
          success: true, 
          data: { id: docSnap.id, ...docSnap.data() } 
        };
      } else {
        return { success: false, error: 'Document not found' };
      }
    } catch (error) {
      console.error('Error getting document:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all documents from collection
  async getCollection(collectionName, queryOptions = {}) {
    try {
      let q = collection(db, collectionName);
      
      // Apply query options
      if (queryOptions.where) {
        queryOptions.where.forEach(condition => {
          q = query(q, where(condition.field, condition.operator, condition.value));
        });
      }
      
      if (queryOptions.orderBy) {
        q = query(q, orderBy(queryOptions.orderBy.field, queryOptions.orderBy.direction || 'asc'));
      }
      
      if (queryOptions.limit) {
        q = query(q, limit(queryOptions.limit));
      }
      
      const querySnapshot = await getDocs(q);
      const documents = [];
      
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, data: documents };
    } catch (error) {
      console.error('Error getting collection:', error);
      return { success: false, error: error.message };
    }
  }

  // Update document
  async updateDocument(collectionName, docId, data) {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
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
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting document:', error);
      return { success: false, error: error.message };
    }
  }

  // Real-time listener for document
  subscribeToDocument(collectionName, docId, callback) {
    const docRef = doc(db, collectionName, docId);
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback({ success: true, data: { id: doc.id, ...doc.data() } });
      } else {
        callback({ success: false, error: 'Document not found' });
      }
    }, (error) => {
      callback({ success: false, error: error.message });
    });
  }

  // Real-time listener for collection
  subscribeToCollection(collectionName, queryOptions = {}, callback) {
    let q = collection(db, collectionName);
    
    // Apply query options
    if (queryOptions.where) {
      queryOptions.where.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value));
      });
    }
    
    if (queryOptions.orderBy) {
      q = query(q, orderBy(queryOptions.orderBy.field, queryOptions.orderBy.direction || 'asc'));
    }
    
    if (queryOptions.limit) {
      q = query(q, limit(queryOptions.limit));
    }
    
    return onSnapshot(q, (querySnapshot) => {
      const documents = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      callback({ success: true, data: documents });
    }, (error) => {
      callback({ success: false, error: error.message });
    });
  }

  // User-specific methods
  async getUserData(userId) {
    return this.getDocument('users', userId);
  }

  async updateUserData(userId, data) {
    return this.updateDocument('users', userId, data);
  }

  async getUserPosts(userId) {
    return this.getCollection('posts', {
      where: [{ field: 'userId', operator: '==', value: userId }],
      orderBy: { field: 'createdAt', direction: 'desc' }
    });
  }
}

export default new DatabaseService();