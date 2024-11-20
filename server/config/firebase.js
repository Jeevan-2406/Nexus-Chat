import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyATv39IOmUFUyC1fYRmpfD2pKDw7e7L914",
  authDomain: "nexus-chat-5fccc.firebaseapp.com",
  projectId: "nexus-chat-5fccc",
  storageBucket: "nexus-chat-5fccc.firebasestorage.app",
  messagingSenderId: "614479925534",
  appId: "1:614479925534:web:f31b436d04b78bb3be390f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage }; 