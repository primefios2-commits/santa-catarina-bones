import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCEWMWeVqdyJ0g-EZElyAKl7OZQhfbmgTA",
    authDomain: "santa-catarina-bones.firebaseapp.com",
    projectId: "santa-catarina-bones",
    storageBucket: "santa-catarina-bones.firebasestorage.app",
    messagingSenderId: "278317845544",
    appId: "1:278317845544:web:0ea7a9ef071fdc5eac791d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export const cloudinaryConfig = {
    cloudName: "jd95mbvc",
    uploadPreset: "fotos_produtos",
    uploadUrl: "https://api.cloudinary.com/v1_1/jd95mbvc/image/upload"
};

export { db, auth };
