import fb from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/storage";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";

const firebaseApp = fb.initializeApp({
  apiKey: "env.FIREBASE_API_KEY",
  authDomain: "dailymoji-db.firebaseapp.com",
  projectId: "dailymoji-db",
  storageBucket: "dailymoji-db.appspot.com",
  messagingSenderId: "227308926590",
  appId: "1:227308926590:web:993f32c6076be5e33f8a2f",
});

const db = firebaseApp.firestore();
const storage = fb.storage();

const provider = new GoogleAuthProvider();
const auth = getAuth();

const singInWithGoogle = () => {
  console.log("signing in with google");
  signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
    })
    .catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
    });
};

const logout = () => {
  console.log("loggin out");
  signOut(auth)
    .then(() => {
      // Sign-out successful.
    })
    .catch((error) => {
      // An error happened.
    });
};

export { db, auth, storage, fb, singInWithGoogle, logout };
