import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";

// If you enabled Analytics in your project, add the Firebase SDK for Google Analytics
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-analytics.js";

import {
  getDatabase,
  ref,
  onValue,
  child,
  push,
  update,
  set,
  get,
  onDisconnect,
  onChildAdded,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";

// Add Firebase products that you want to use
//   import { getAuth } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  EmailAuthProvider,
  GoogleAuthProvider,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

import {
  uploadBytes,
  getStorage,
  ref as fRef,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-storage.js";
// import { GoogleAuthProvider } from "firebase/auth";

const provider = new GoogleAuthProvider();

// const firebaseConfig = {
//   apiKey: "AIzaSyCvlr0Et_vfS1dgne5p0kwImln2JZmApJQ",
//   authDomain: "tcu-game.firebaseapp.com",
//   databaseURL: "https://tcu-game-default-rtdb.firebaseio.com",
//   projectId: "tcu-game",
//   storageBucket: "tcu-game.appspot.com",
//   messagingSenderId: "15034051366",
//   appId: "1:15034051366:web:0526952f94ed1776df6fe7",
//   measurementId: "G-558WEMC4E7",
// };

const firebaseConfig = {
  apiKey: "AIzaSyCydy40N5szWZ98ddB5EMADfcpejhpGLMg",
  authDomain: "napat-tour.firebaseapp.com",
  databaseURL:
    "https://napat-tour-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "napat-tour",
  storageBucket: "napat-tour.appspot.com",
  messagingSenderId: "602146408728",
  appId: "1:602146408728:web:63c297444418e38635f66d",
  measurementId: "G-8JY53JQ3TT",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth();

// const db = getDatabase(app);
const database = getDatabase(app);

const presenceRef = ref(database, "disconnectmessage");
// Write a string when this client loses connection
onDisconnect(presenceRef).set("I disconnected!");

const connectedRef = ref(database, "logs/");
onValue(connectedRef, (snapshot) => {
  const data = snapshot.val();

  if (data) {
    console.log("Retrieve Spelling: ", data);
  } else {
    console.log("not connected");
  }
});

$(document).ready(() => {
  if(sessionStorage.getItem("uid") != "" && sessionStorage.getItem("uid") != null){
    // window.location.href = "admin.html";
  }

  function loginUser(email, password) {
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
      sessionStorage.setItem("uid", user.uid);
      window.location.href = "admin.html";
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorMessage);

      iziToast.warning({
        title: "Login Error",
        message: errorMessage,
        icon: "fa fa-bell-exclamation",
        position: "topRight",
        timeout: 4000,
      });
    });
  }

  $("#btn-login").on("click", (e) => {
    e.preventDefault();

    let email = $("#email");
    let password = $("#password");

    if (email.val() == "" && password.val() != "") {
      email.focus();
      iziToast.warning({
        // title: "Invalid Input",
        message: `Please enter email`,
        icon: "fad fa-mailbox",
        position: "topRight",
        timeout: 4000,
      });
    } else if (email.val() != "" && password.val() == "") {
      password.focus();
      iziToast.warning({
        // title: "Invalid Input",
        message: `Please enter password`,
        icon: "fad fa-lock",
        position: "topRight",
        timeout: 4000,
      });
    } else if (email.val() == "" && password.val() == "") {
      email.focus();
      iziToast.warning({
        // title: "Invalid Input",
        message: `Please enter email and password`,
        icon: "fa fa-bell-exclamation",
        position: "topRight",
        timeout: 4000,
      });
    } else {
      loginUser(email.val(), password.val());
    }
  });

  $("#main-box").ready(()=>{
    console.log("MainBox Ready");
    var newRow = `
    <tr>
      <td><input type="text" class="new-row-input" id="plate-no" placeholder="Van Plate Number" /></td>
      <td><input type="text" class="new-row-input" id="driver-name" placeholder="Driver Name" /></td>
      <td><input type="text" class="new-row-input" id="driver-age" placeholder="Driver Age" /></td>
      <td><input type="text" class="new-row-input" id="driver-address" placeholder="Driver Address" /></td>
      <td><input type="text" class="new-row-input" id="driver-contact" placeholder="Driver Contact No." /></td>
      <td><input type="text" class="new-row-input" id="van-model" placeholder="Van Model" /></td>
      <td><input type="text" class="new-row-input" id="date-account-registered" placeholder="Account Registered" /></td>
    </tr>
  `;

    $("#btn-add-new").on("click", () => {
      // console.log("Test");
       // Append the new row before the row with id 'btn-add-new'
      $('#btn-add-new').before(newRow);
    });
  });
});


