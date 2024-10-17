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
  let isAllowedToAppend = true;

  if (
    sessionStorage.getItem("uid") != "" &&
    sessionStorage.getItem("uid") != null
  ) {
    // window.location.href = "admin.html";
  }
   else {
    if(window.location.href.split("/")[3] != "index.html"){
      window.location.href = "index.html";
    }
  }

  const connectedRef = ref(database, "users/");
  onValue(connectedRef, (snapshot) => {
    const data = snapshot.val();
    console.log(data);

    // Prepare list of drivers
    let lists = ``;
    let b = $("#list-of-drivers").html();

    // $("#list-of-drivers")
    //   .find("tr")
    //   .each((i, v) => {
    //     $(v).remove();
    //   });

    if (data) {
      // if (isAllowedToAppend) {
      let d = data.drivers;
      for (let driver in d) {
        lists += `<tr>`;
        lists += `<td>${d[driver].plateno}</td>`;
        lists += `<td>${d[driver].drivername}</td>`;
        lists += `<td>${d[driver].driverage}</td>`;
        lists += `<td>${d[driver].driveraddress}</td>`;
        lists += `<td>${d[driver].drivercontact}</td>`;
        lists += `<td>${d[driver].vanmodel}</td>`;
        lists += `<td>${d[driver].dateaccountregistered}</td>`;
        lists += `</tr>`;
      }
      
      $("#btn-add-new").before(lists);
      // $("#btn-add-new").prev().remove();
      // isAllowedToAppend = true;
      // }
    } else {
      console.log("not connected");
    }
  });

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

  let allowNewRow = true;

  $("#main-box").ready(() => {
    console.log("MainBox Ready");
    var newRow = `
    <tr style="align-items: center;">
      <td>
        <input type="text" class="new-row-input" id="plate-no" placeholder="Van Plate Number" autocomplete="off"/>
      </td>
      <td>
        <input type="text" class="new-row-input" id="driver-name" placeholder="Driver Name" autocomplete="off"/>
      </td>
      <td>
        <input type="text" class="new-row-input" id="driver-age" placeholder="Driver Age" autocomplete="off"/>
      </td>
      <td>
        <input type="text" class="new-row-input" id="driver-address" placeholder="Driver Address" autocomplete="off"/>
      </td>
      <td>
        <input type="text" class="new-row-input" id="driver-contact" placeholder="Driver Contact No." autocomplete="off"/>
      </td>
      <td>
        <input type="text" class="new-row-input" id="van-model" placeholder="Van Model" autocomplete="off"/>
      </td>
      <td>
        <input type="date" class="new-row-input" id="date-account-registered" placeholder="Account Registered" disabled autocomplete="off"/>
      </td>
    </tr>
  `;

    $("#btn-add-new").on("click", () => {
      // console.log("Test");
      // Append the new row before the row with id 'btn-add-new'

      console.log(getCurrentDate("ymd-"));

      // Remove Add button with Check
      if ($("#encode-add i").hasClass("fa-plus-circle")) {
        if (allowNewRow) {
          $("#btn-add-new").before(newRow);
          $("#date-account-registered").val(getCurrentDate("ymd-"));
          $("#encode-add i").removeClass("fa-plus-circle");

          $("#encode-add i").addClass("fa-check");
          $("#encode-add i").css("color", "#00c700");
        } else {
          iziToast.warning({
            // title: "Invalid Input",
            message: `Please complete all inputs to add new one`,
            icon: "fa fa-bell-exclamation",
            position: "topRight",
            timeout: 4000,
          });
        }
      }
      // Remove check button with Add
      else {
        // Done encoding, verify content for non-empty values
        let data = validateEncode($("#btn-add-new"));

        if (!allowNewRow) {
          iziToast.warning({
            // title: "Invalid Input",
            message: `Please complete all inputs to add new one`,
            icon: "fa fa-bell-exclamation",
            position: "topRight",
            timeout: 4000,
          });
        } else {
          $("#encode-add i").removeClass("fa-check");
          $("#encode-add i").addClass("fa-plus-circle");
          $("#encode-add i").css("color", "#212529");

          // iziToast.success({
          //   title: "Success",
          //   message: `Validations complete, saving to database`,
          //   icon: "fa fa-bell-exclamation",
          //   position: "topRight",
          //   timeout: 4000,
          // });
          isAllowedToAppend = false;

          console.log(data);
          // Save to database
          const updates = {};
          updates[`/users/drivers/${data["drivername"]}`] = data;
          console.log(updates);
          update(ref(database), updates)
            .then(() => {
              iziToast.success({
                title: "Successfully Saved",
                message: `Driver's data has been saved`,
                icon: "fa fa-save",
                position: "topRight",
                timeout: 4000,
              });

              // setTimeout(() => {
                window.location.href = window.location.href;
              // }, 1500);
            })
            .catch((error) => {
              // iziToast.destroy();
              iziToast.warning({
                title: "Save Failed",
                message: `${error}`,
                icon: "fa fa-bell-exclamation",
                position: "topRight",
                timeout: 4000,
              });
              console.error("Update failed:", error);
            });
        }
      }
    });
  });

  function validateEncode(o) {
    let encodeAdd = o;
    let totalIndex = encodeAdd.parent().find("tr").length - 2; // subtracted by one to avoid selections buttons
    let available = encodeAdd.parent().find("tr").eq(totalIndex);
    let isCompleted = true;
    let data = {};

    // console.log(encodeAdd.parent().find("tr").eq(1));
    available.find("td input").each((i, v) => {
      if ($(v).val() == "") {
        isCompleted = false;
      } else {
        let id = $(v).attr("id").replaceAll("-", "");
        data[id] = $(v).val();
      }
    });

    if (!isCompleted) {
      allowNewRow = false;
    } else {
      allowNewRow = true;
    }

    return data;
  }

  // General Function Helper
  function getCurrentDate(format) {
    let today = new Date();
    let day = String(today.getDate()).padStart(2, "0");
    let month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    let year = today.getFullYear();

    if (format == "dmy") {
      return `${day}/${month}/${year}`;
    } else if (format == "ymd-") {
      return `${year}-${month}-${day}`;
    } else if (format == "ymd/") {
      return `${year}/${month}/${day}`;
    }
  }

  
  $("#btn-sign-out").on("click", () => {
    iziToast.question({
      // timeout: 20000,
      close: false,
      overlay: true,
      // displayMode: 'once',
      id: 'question',
      zindex: 999,
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      position: 'center',
      buttons: [
          ['<button><b>YES</b></button>', function (instance, toast) {
              instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
              window.location.href = "index.html";
              sessionStorage.setItem("uid", "");
          }, true],
          ['<button>NO</button>', function (instance, toast) {
   
              instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
   
          }],
      ],
      onClosing: function(instance, toast, closedBy){
          console.info('Closing | closedBy: ' + closedBy);
      },
      onClosed: function(instance, toast, closedBy){
          console.info('Closed | closedBy: ' + closedBy);
      }
  });
  });
});
