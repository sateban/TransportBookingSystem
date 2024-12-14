import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
// import { initializeApp } from "./script/firebase-app.js";

// If you enabled Analytics in your project, add the Firebase SDK for Google Analytics
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-analytics.js";
// import { getAnalytics } from "./script/firebase-analytics.js";

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
// } from "./script/firebase-database.js";

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
// } from "./script/firebase-auth.js";
// import { getFirestore } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

// import {
//   uploadBytes,
//   getStorage,
//   ref as fRef,
//   getDownloadURL,
// } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-storage.js";
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

// For
let isPageSchedule = window.location.href.includes("schedule");
let isPageAnalytics = window.location.href.includes("analytics");

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

// General Function Helper
window.getCurrentDate = (format) => {
  let today = new Date();
  let day = String(today.getDate()).padStart(2, "0");
  let month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  let year = today.getFullYear();
  let monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  if (format == "dmy") {
    return `${day}/${month}/${year}`;
  } else if (format == "ymd-") {
    return `${year}-${month}-${day}`;
  } else if (format == "ymd/") {
    return `${year}/${month}/${day}`;
  } else if (format == "mdyt") {
    return `${monthNames[today.getMonth()]} ${day}, ${year}`;
  }
};

window.sanitizeText = (text) => {
  return text
    .replaceAll(".", "_")
    .replaceAll("#", "_")
    .replaceAll("$", "_")
    .replaceAll("[", "_")
    .replaceAll("]", "_");
};

function drawBookingChart(today, overall) {
  // Set Data
  const data = google.visualization.arrayToDataTable([
    ["Contry", "Mhl"],
    [`${today} Bookings Today`, today],
    [`${overall} Overall Bookings`, overall],
  ]);

  // Set Options
  const options = {
    title: "",
    is3D: true,
  };

  // Draw
  const chart = new google.visualization.PieChart(
    document.getElementById("myChart")
  );
  chart.draw(data, options);
}

function drawMonetizationChart(d) {
  console.log(d);

  const chartData = [["Driver ID", "Amount"]]; // Header row
  const driverTotals = {};

  Object.entries(d.income).forEach(([date, dateData]) => {
    console.log(`Date: ${date}`);

    // Loop through drivers on the given date
    Object.entries(dateData.drivers).forEach(([driverId, driverData]) => {
      // console.log(`  Driver ID: ${driverId}`);
      // console.log(`  Amount: ${driverData.amount}`);
      // console.log(`  Passenger Name: ${driverData.passenger_name}`);
      // console.log(`  Total Distance: ${driverData.total_distance}`);
      // console.log('  ---');
      let driverName = d["users"]["drivers"][driverId]["drivername"];

      Object.entries(driverData).forEach(([time, data]) => {
        // console.log("Test", time, data);

        if (!driverTotals[driverName]) {
          driverTotals[driverName] = {
            amount: 0,
            id: driverId,
          }; // Initialize if not already present
        }

        driverTotals[driverName].amount += data.amount; // Add the amount
      });

      // chartData.push([driverId, driverData.amount]);
    });

    console.log("---");
  });

  // console.log(driverTotals);

  Object.entries(driverTotals).forEach(([id, amount]) => {
    // console.log(id, amount.amount);
    chartData.push([`P${amount.amount.toFixed(2)} - ${id}`, amount.amount]);
    // chartData.push([id, `P${+amount.toFixed(2)}`]);
  });

  // Set Data
  // const data = google.visualization.arrayToDataTable([
  //   ["Contry", "Mhl"],
  //   // [`${today} Bookings Today`, today],
  //   // [`${overall} Overall Bookings`, overall],
  // ]);
  const data = google.visualization.arrayToDataTable(chartData);

  // Set Options
  const options = {
    title: "Total Income",
    // is3D: true,
    // width: 800,
    // height: "100%",
    // hAxis: { title: "Date" },
    // vAxis: { title: "Amount" },
    is3D: true,
    // bubble: { textStyle: { fontSize: 11 } },
    slices: {
      0: { offset: 0.05 },
      1: { offset: 0.05 },
      2: { offset: 0.05 },
      3: { offset: 0.05 },
    },
    pieSliceText: "percentage", // Display percentage inside slices
    pieStartAngle: 90,
  };

  // Draw
  const chart = new google.visualization.PieChart(
    document.getElementById("monetization-chart")
  );
  chart.draw(data, options);

  return driverTotals;
}

$(document).ready(() => {
  // $(function () {
  //   $('[data-toggle="popover"]').popover();
  // });

  // $(".sd-CustomSelect").multipleSelect({
  //   selectAll: false,
  //   onOptgroupClick: function (view) {
  //     $(view).parents("label").addClass("selected-optgroup");
  //   },
  // });

  if (isPageSchedule || isPageAnalytics) {
    google.charts.load("current", { packages: ["corechart"] });
    google.charts.setOnLoadCallback(drawBookingChart);
  }

  // if (window.location.href.includes("index")) {
  let lists2 = ``;
  let isAllowedToAppend = true;

  if (
    sessionStorage.getItem("uid") != "" &&
    sessionStorage.getItem("uid") != null
  ) {
    // window.location.href = "admin.html";
  } else {
    // if(window.location.href.split("/")[3] != "index.html"){
    if (
      !window.location.href.includes("index.html") &&
      window.location.href.includes("admin.html")
    ) {
      window.location.href = "index.html";
    }
  }

  $("#date-today").text(getCurrentDate("mdyt") + " Bookings");

  let bookCount = 0;
  let overallBookCount = 0;

  if (isPageAnalytics) {
    const booking = ref(database, "activity/booking");
    onValue(booking, (snapshot) => {
      const data = snapshot.val();
      console.log(data);

      let userData = [];

      if (data) {
        // if (isAllowedToAppend) {
        // $("#btn-add-new").prev().remove();
        // isAllowedToAppend = true;
        // }
        for (let d in data) {
          let drivers = data[d].drivers;
          // console.log("%c ddd" + d, "color: red");

          for (let driverid in drivers) {
            let ts = drivers[driverid];

            for (let tsd in ts) {
              if (!isNaN(tsd)) {
                // console.log(formatTimestampToDate(+tsd));
                // console.log(formatTimestampToDate(+tsd), getCurrentDate("ymd-"));
                if (formatTimestampToDate(+tsd) == getCurrentDate("ymd-")) {
                  bookCount++;
                }

                overallBookCount++;

                for (let email in ts[tsd]) {
                  console.log(email);
                  let v = ts[tsd][email];

                  userData.push({
                    date: d,
                    driver: driverid,
                    rider: v.customerName,
                    pickup_location: v.pickup_location,
                    dropoff_location: v.dropoff_location,
                  });
                }
              }
            }
          }
        }

        //   {
        //     "date": "2024-10-26",
        //     "driver": "JG20241016NEN1675",
        //     "rider": "Steven Jake Fajarillo",
        //     "pickup_location": "E. Fernandez Road, Tinigaw, Estancia, Mobo, Kalibo, Aklan, Western Visayas, 5600, Philippines",
        //     "dropoff_location": "Kalibo International Airport, Talisay, Kalibo, Aklan, Western Visayas, 5600, Philippines"
        // }
        console.log(userData);
        let dlist = "";

        for (let d in userData) {
          let dd = userData[d];
          dlist += `
          <tr>
            <td>${dd.date}</td>
            <td>${dd.driver}</td>
            <td>${dd.rider}</td>
            <td>${dd.pickup_location}</td>
            <td>${dd.dropoff_location}</td>

          </tr>
        `;
        }

        $("#total-bookings-data").html(dlist);
        $("#total-booking-gen").text(bookCount + " Bookings Today");
        $("#overall-total-booking-gen").text(
          overallBookCount + " Overall Bookings"
        );

        drawBookingChart(bookCount, overallBookCount);

        $("#tbl-total-bookings").DataTable({
          searching: true,
          responsive: true,
          // columnDefs: [
          //   { visible: false,
          //     targets: [0] }
          // ],
          ordering: true,
          // processing: false,
          // serverSide: false,
          destroy: true,
          info: false,
          language: {
            emptyTable: "No entries to show",
            infoEmpty: "No entries to show",
          },
        });
      } else {
        console.log("not connected");
      }
    });
  }

  if (isPageAnalytics) {
    const monetization = ref(database, "/");
    onValue(monetization, (snapshot) => {
      const data = snapshot.val();

      let userData = [];

      if (data) {
        let driverTotals = drawMonetizationChart(data);
        // console.log("HERE!!", driverTotals);

        let dlist = "";

        Object.entries(driverTotals).forEach(([id, value]) => {
          // chartData.push([`P${amount.toFixed(2)} - ${id}`, amount]);
          // chartData.push([id, `P${+amount.toFixed(2)}`]);
          let totalBooking = 0;

          Object.entries(data.income).forEach(([date, dateData]) => {
            // Loop through drivers on the given date
            Object.entries(dateData.drivers).forEach(([driverId, driverData]) => {
              if(value.id == driverId){
                console.log("Sample", driverId, Object.keys(driverData).length);
                totalBooking += Object.keys(driverData).length;

              }
            });
          });

          dlist += `
          <tr driverid="${value.id}">
            <td id="driver-name">${id}</td>
            <td>P${value.amount.toFixed(2)}</td>
            <td>${totalBooking}</td>
          </tr>
        `;
        });

        $("#monetized-data").html(dlist);

        $("#tbl-monetization").DataTable({
          searching: true,
          responsive: true,
          // columnDefs: [
          //   { visible: false,
          //     targets: [0] }
          // ],
          ordering: true,
          // processing: false,
          // serverSide: false,
          destroy: true,
          info: false,
          language: {
            emptyTable: "No entries to show",
            infoEmpty: "No entries to show",
          },
        });
      } else {
        console.log("not connected");
      }
    });
  }

  function validatePassword(password) {
    /**
     * Validates a password based on the following rules:
     * - At least 8 characters long.
     * - Contains at least one uppercase letter.
     * - Contains at least one lowercase letter.
     * - Contains at least one digit.
     * - Contains at least one special character.
     *
     * @param {string} password - The password to validate.
     * @returns {Object} - An object with isValid (boolean) and message (string).
     */

    const rules = [
      {
        regex: /.{8,}/,
        message: "Password must be at least 8 characters long.",
      },
      {
        regex: /[A-Z]/,
        message: "Password must contain at least one uppercase letter.",
      },
      {
        regex: /[a-z]/,
        message: "Password must contain at least one lowercase letter.",
      },
      {
        regex: /\d/,
        message: "Password must contain at least one digit.",
      },
      // {
      //   regex: /[!@#$%^&*(),.?":{}|<>]/,
      //   message: "Password must contain at least one special character.",
      // },
      {
        regex: /^[^.#$[\]/]*$/,
        message:
          "Password cannot contain invalid Firebase characters (., #, $, [, ], /).",
      },
    ];

    for (let rule of rules) {
      if (!rule.regex.test(password)) {
        return { isValid: false, message: rule.message };
      }
    }

    return { isValid: true, message: "Password is valid." };
  }

  $("#change-driver-password").on("click", () => {
    let password = $("#driver-password").val();

    const result = validatePassword(password);
    // console.log(result.message);

    if (result.isValid) {
      iziToast.info({
        title: "Password Valid",
        message: `Please prepare email to Driver`,
        icon: "fa fa-check",
        position: "topRight",
        timeout: 3000,
      });

      $("#email-driver-name").attr("disabled", false);
      $("#btn-send-email").attr("disabled", false);

      let email = $("#email-driver-name").attr("email");
      let driverid = $("#email-driver-name").attr("driverid");

      $("#email-driver-name").text(
        `Hi ${email},
  Your new password is: ${$("#driver-password").val()}
        
Regards,
Napat Tours Admin`
      );

      // Modify Firebase password
      const updates = {};
      updates[`/users/drivers/${driverid}/driverpassword`] = password;
      console.log(updates);
      update(ref(database), updates)
        .then(() => {
          // iziToast.success({
          //   title: "Successfully Saved",
          //   message: `${blurrednode.toUpperCase()} has been saved`,
          //   icon: "fa fa-save",
          //   position: "topRight",
          //   timeout: 3000,
          // });
        })
        .catch((error) => {
          // iziToast.warning({
          //   title: "Save Failed",
          //   message: `${error}`,
          //   icon: "fa fa-bell-exclamation",
          //   position: "topRight",
          //   timeout: 4000,
          // });
        });
    } else {
      iziToast.warning({
        title: "Incorrect Password Format",
        message: `${result.message}`,
        icon: "fa fa-info",
        position: "topRight",
        timeout: 3000,
      });

      $("#email-driver-name").attr("disabled", true);
      $("#btn-send-email").attr("disabled", true);
      $("#email-driver-name").text("");
    }
  });

  $("#list-of-drivers").on("dblclick", ".message-driver", (e) => {
    let email = $(e.target).text();
    let driverid = $(e.target).attr("driverid");
    console.log(email, driverid);

    $("#email-driver-name").attr("email", email);
    $("#email-driver-name").attr("driverid", driverid);
    $("#driver-password").val("");

    $("#modalEmailDriver").modal("show");
  });

  $("#btn-send-email").on("click", (e) => {
    iziToast.destroy();
    iziToast.info({
      title: "Sending Email",
      message: `Please wait...`,
    });

    var formData = new FormData();
    formData.append("email", $("#email-driver-name").attr("email"));
    formData.append("subject", "Password Changed");

    formData.append(
      "message",
      $("#email-driver-name").val().replaceAll("\n", "<br>")
    );

    $.ajax({
      // url: "https://656697eb-cfef-4289-a1dd-7690085a678e-00-sw9o9mqxrpk3.pike.replit.dev/send_email",
      url: "https://9000-idx-napattours-1733320678728.cluster-e3wv6awer5h7kvayyfoein2u4a.cloudworkstations.dev/send_email",
      method: "POST",
      data: formData,
      processData: false,
      contentType: false,
      xhrFields: {
        // responseType: "blob",
      },
      success: function (data, textStatus, jqXHR) {
        iziToast.destroy();
        iziToast.success({
          title: "Success",
          message: `Email successfully sent to ${$("#email-driver-name").attr(
            "email"
          )}`,
        });
      },
      error: (e) => {
        iziToast.destroy();
        iziToast.warning({
          title: "Email Not Sent",
          message: `Please try again later (${e})`,
        });
      },
      done: () => {},
    });
  });

  $("#monetized-data").on("dblclick", "tr", (e) => {
    let name = $(e.target).parent().find("#driver-name").text();
    // console.log($(e.target).parent().find("#driver-name"));

    let id = $(e.target).eq(0).parent().attr("driverid").trim();
    $("#income-driver-name").text(name);
    $("#modalIndividualIncome").modal("show");

    const indMonetization = ref(database, "income/");
    onValue(indMonetization, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        console.log("INCOME", id, data);
        // let dlist = "";
        let dlist = [];

        Object.entries(data).forEach(([date, driver]) => {
          // chartData.push([`P${amount.toFixed(2)} - ${id}`, amount]);
          // chartData.push([id, `P${+amount.toFixed(2)}`]);
          Object.entries(driver).forEach(([d, drivers]) => {
            // chartData.push([`P${amount.toFixed(2)} - ${id}`, amount]);
            // chartData.push([id, `P${+amount.toFixed(2)}`]);

            Object.entries(drivers).forEach(([driverid, driverdata]) => {
              if (driverid == id) {
                Object.entries(driverdata).forEach(([time, timedata]) => {
                  // console.log(time, timedata);

                  // dlist += `
                  //   <tr>
                  //     <td>${date}</td>
                  //     <td>${time.replaceAll("-", ":")}</td>
                  //     <td>P${timedata.amount.toFixed(2)}</td>
                  //   </tr>
                  // `;
                  dlist.push({
                    date: date,
                    time: time.replaceAll("-", ":"),
                    earning: "P" + timedata.amount.toFixed(2),
                  });
                });
              }
            });
          });
        });

        // $("#individual-income").html(dlist);
        // console.log("writing HTML", dlist);

        $("#tbl-individual-income").DataTable({
          data: dlist,
          columns: [
            { data: "date" }, // Column for Date
            { data: "time" }, // Column for Time
            { data: "earning" }, // Column for Earning
          ],
          searching: true,
          responsive: true,
          // columnDefs: [
          //   { visible: false,
          //     targets: [0] }
          // ],
          ordering: true,
          // processing: false,
          // serverSide: false,
          destroy: true,
          info: false,
          language: {
            emptyTable: "No entries to show",
            infoEmpty: "No entries to show",
          },
        });

        dlist = "";
      } else {
        console.log("not connected");
      }
    });
  });

  function formatTimestampToDate(timestamp) {
    // Create a new Date object from the timestamp
    const date = new Date(timestamp);
    // Extract the year, day, and month
    const year = date.getFullYear(); // Get the full year (yyyy)
    const day = String(date.getDate()).padStart(2, "0"); // Get the day (dd) and ensure it is two digits
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Get the month (mm, 0-based, so add 1)

    // Return the formatted date
    return `${year}-${month}-${day}`;
  }

  window.formatTimestampToDateAll = (timestamp) => {
    const date = new Date(timestamp);

    const year = date.getFullYear(); // Get the full year (yyyy)
    const day = String(date.getDate()).padStart(2, "0"); // Get the day (dd) and ensure it is two digits
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Get the month (mm, 0-based, so add 1)

    // Extract hours, minutes, and seconds
    const hours = String(date.getHours()).padStart(2, "0"); // Get the hour (hh) and ensure it is two digits
    const minutes = String(date.getMinutes()).padStart(2, "0"); // Get the minutes (mm) and ensure it is two digits
    const seconds = String(date.getSeconds()).padStart(2, "0"); // Get the seconds (ss) and ensure it is two digits

    // Return the formatted date and time
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

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
        // lists2 += `<tr id="${d[driver].driverid.trim()}">`;

        lists += `<td>${d[driver].plateno}</td>`;
        // lists2 += `<td col="plateno">${d[driver].plateno}</td>`;

        lists += `<td>${d[driver].drivername}</td>`;
        // lists2 += `<td col="drivername">${d[driver].drivername}</td>`;

        lists += `<td driverid="${driver}" class="message-driver" title="Double click to send message to driver">${d[driver].driveremail}</td>`;
        // lists2 += `<td col="email">${d[driver].email}</td>`;

        // lists2 += `<td col="password">${d[driver].password}</td>`;

        lists += `<td>${d[driver].driverage}</td>`;
        // lists2 += `<td col="driverage">${d[driver].driverage}</td>`;

        lists += `<td>${d[driver].driveraddress}</td>`;
        // lists2 += `<td col="driveraddress">${d[driver].driveraddress}</td>`;

        lists += `<td>${d[driver].drivercontact}</td>`;
        // lists2 += `<td col="drivercontact">${d[driver].drivercontact}</td>`;

        lists += `<td>${d[driver].vanmodel}</td>`;
        // lists2 += `<td col="vanmodel">${d[driver].vanmodel}</td>`;

        lists += `<td>${d[driver].dateaccountregistered}</td>`;
        // lists2 += `<td col="dateaccountregistered">${d[driver].dateaccountregistered}</td>`;

        lists += `</tr>`;
        // lists2 += `</tr>`;

        lists2 += `
           <tr style="align-items: center;" driverid="${d[
             driver
           ].driverid.trim()}">
            <td>
              <input type="text" class="new-row-input" id="plate-no" placeholder="Van Plate Number" value="${
                d[driver].plateno
              }" autocomplete="off"/>
            </td>
            <td>
              <input type="text" class="new-row-input" id="driver-name" placeholder="Driver Name" value="${
                d[driver].drivername
              }" autocomplete="off"/>
            </td>
            <td>
              <input type="email" class="new-row-input" id="driver-email" placeholder="Email" value="${
                d[driver].driveremail
              }" autocomplete="off"/>
            </td>
            <td>
              <input type="password" class="new-row-input" id="driver-password" placeholder="Password" value="${
                d[driver].driverpassword
              }" autocomplete="off"/>
            </td>
            <td>
              <input type="text" class="new-row-input" id="driver-age" placeholder="Driver Age" value="${
                d[driver].driverage
              }" autocomplete="off"/>
            </td>
            <td>
              <input type="text" class="new-row-input" id="driver-address" placeholder="Driver Address" value="${
                d[driver].driveraddress
              }" autocomplete="off"/>
            </td>
            <td>
              <input type="text" class="new-row-input" id="driver-contact" placeholder="Driver Contact No." value="${
                d[driver].drivercontact
              }" autocomplete="off"/>
            </td>
            <td>
              <input type="text" class="new-row-input" id="van-model" placeholder="Van Model" value="${
                d[driver].vanmodel
              }" autocomplete="off"/>
            </td>
            <td>
              <input type="date" class="new-row-input" id="date-account-registered" placeholder="Account Registered" value="${
                d[driver].dateaccountregistered
              }" disabled autocomplete="off"/>
            </td>
          </tr>
        `;
      }

      $("#list-of-drivers").html(lists);
      // console.log(lists);
      // $("#btn-add-new").prev().remove();
      // isAllowedToAppend = true;
      // }
    } else {
      console.log("not connected");
    }
  });

  function formatTimestampToDate(timestamp) {
    // Create a new Date object from the timestamp
    const date = new Date(timestamp);

    // Extract the year, day, and month
    const year = date.getFullYear(); // Get the full year (yyyy)
    const day = String(date.getDate()).padStart(2, "0"); // Get the day (dd) and ensure it is two digits
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Get the month (mm, 0-based, so add 1)

    // Return the formatted date
    return `${year}-${day}-${month}`;
  }

  // On Total Bookings click
  // $("#total-booking").on("click", () => {

  // });

  // On UpdateInfo click
  $("#update-info").on("click", () => {
    $("#tbl-tbody-update-info").html(lists2);

    $("#tbl-update-info").DataTable({
      searching: true,
      responsive: true,
      dom: "t",
      // columnDefs: [
      //   { visible: false,
      //     targets: [0] }
      // ],
      ordering: false,
      // processing: false,
      // serverSide: false,
      destroy: true,
      info: false,
      language: {
        emptyTable: "No entries to show",
        infoEmpty: "No entries to show",
      },
    });
  });

  // Change Values of Users
  $("#tbl-update-info").on("click", (e) => {
    if (e.target.nodeName == "INPUT") {
      let originalValue = $(e.target).val();
      $(e.target).attr("originalVal", originalValue);
    }

    // console.log(e.target.nodeName);
  });

  // Check if value changed
  $(document).on("blur", "#tbl-update-info input", (e) => {
    let originalValue = $(e.target).attr("originalVal");
    let blurredValue = $(e.target).val();
    originalValue = originalValue == undefined ? "" : originalValue;
    blurredValue = blurredValue == undefined ? "" : blurredValue;

    if (originalValue != blurredValue) {
      console.log("Need to update to database");
      let driverid = $(e.target).parent().parent().attr("driverid");
      let blurrednode = $(e.target).attr("id").replaceAll("-", "");
      // blurrednode = blurrednode == "driverpassword" ? "password" : blurrednode;
      // blurrednode = blurrednode == "driveremail"    ? "email"    : blurrednode;

      const updates = {};
      updates[`/users/drivers/${driverid}/${blurrednode}`] = blurredValue;
      console.log(updates);
      update(ref(database), updates)
        .then(() => {
          iziToast.success({
            title: "Successfully Saved",
            message: `${blurrednode.toUpperCase()} has been saved`,
            icon: "fa fa-save",
            position: "topRight",
            timeout: 3000,
          });
        })
        .catch((error) => {
          iziToast.warning({
            title: "Save Failed",
            message: `${error}`,
            icon: "fa fa-bell-exclamation",
            position: "topRight",
            timeout: 4000,
          });
        });

      console.log(driverid, blurrednode);
    } else {
      console.log("Same Value");
    }
  });

  // On Total Bookings click
  $("#total-booking").on("click", () => {
    $("#tbl-total-bookings").DataTable({
      searching: true,
      responsive: true,
      // columnDefs: [
      //   { visible: false,
      //     targets: [0] }
      // ],
      ordering: true,
      // processing: false,
      // serverSide: false,
      destroy: true,
      info: false,
      language: {
        emptyTable: "No entries to show",
        infoEmpty: "No entries to show",
      },
    });
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
        <input type="email" class="new-row-input" id="driver-email" placeholder="Email" autocomplete="off"/>
      </td>
      <td>
        <input type="password" class="new-row-input" id="driver-password" placeholder="Password" autocomplete="off"/>
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

    var newScheduleRow = `
  <tr style="align-items: center;">
    <td>
      <input type="text" class="new-row-input" id="day-schedule" placeholder="Enter Schedule Day (M,T,W,Th,F,Sat,Sun)" autocomplete="off"/>
    </td>
    <td>
      <input type="time" class="new-row-input" id="start-time" placeholder="Start Time" autocomplete="off"/>
    </td>
    <td>
      <input type="time" class="new-row-input" id="start-end" placeholder="End Time" autocomplete="off"/>
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
          // Add additionla data
          let nameAbbrevation = data["drivername"].trim().substring(0, 2);
          let dateAbbrevation = data["dateaccountregistered"]
            .trim()
            .replaceAll("-", "");
          let plateAbbrevation = data["plateno"].trim().replaceAll("-", "");

          data["driverid"] = (
            nameAbbrevation +
            dateAbbrevation +
            plateAbbrevation
          ).toUpperCase();
          data["isAvailable"] = false;

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

    if (isPageSchedule) {
      //
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
            lists += `<tr driverid="${driver}">`;

            lists += `<td>${d[driver].drivername}</td>`;

            lists += `<td>${d[driver].schedule.day_available}</td>`;

            lists += `<td>${d[driver].schedule.start}</td>`;

            lists += `<td>${d[driver].schedule.end}</td>`;

            lists += `</tr>`;
          }

          $("#list-of-schedule").html(lists);
          // console.log(lists);
          // $("#btn-add-new").prev().remove();
          // isAllowedToAppend = true;
          // }
        } else {
          console.log("not connected");
        }
      });

      // add schedule
      // $("#btn-add-schedule").on("click", () => {
      //   // console.log("Test");
      //   // Append the new row before the row with id 'btn-add-new'

      //   console.log(getCurrentDate("ymd-"));

      //   // Remove Add button with Check
      //   if ($("#encode-add i").hasClass("fa-plus-circle")) {
      //     if (allowNewRow) {
      //       $("#btn-add-schedule").before(newScheduleRow);
      //       $("#date-account-registered").val(getCurrentDate("ymd-"));
      //       $("#encode-add i").removeClass("fa-plus-circle");

      //       $("#encode-add i").addClass("fa-check");
      //       $("#encode-add i").css("color", "#00c700");
      //     } else {
      //       iziToast.warning({
      //         // title: "Invalid Input",
      //         message: `Please complete all inputs to add new one`,
      //         icon: "fa fa-bell-exclamation",
      //         position: "topRight",
      //         timeout: 4000,
      //       });
      //     }
      //   }
      //   // Remove check button with Add
      //   else {
      //     // Done encoding, verify content for non-empty values
      //     let data = validateEncode($("#btn-add-schedule"));

      //     if (!allowNewRow) {
      //       iziToast.warning({
      //         // title: "Invalid Input",
      //         message: `Please complete all inputs to add new one`,
      //         icon: "fa fa-bell-exclamation",
      //         position: "topRight",
      //         timeout: 4000,
      //       });
      //     } else {
      //       $("#encode-add i").removeClass("fa-check");
      //       $("#encode-add i").addClass("fa-plus-circle");
      //       $("#encode-add i").css("color", "#212529");

      //       // iziToast.success({
      //       //   title: "Success",
      //       //   message: `Validations complete, saving to database`,
      //       //   icon: "fa fa-bell-exclamation",
      //       //   position: "topRight",
      //       //   timeout: 4000,
      //       // });
      //       isAllowedToAppend = false;

      //       // Save to database
      //       // const updates = {};
      //       // updates[`/users/drivers/${data["drivername"]}`] = data;
      //       // console.log(updates);
      //       // update(ref(database), updates)
      //       //   .then(() => {
      //       //     iziToast.success({
      //       //       title: "Successfully Saved",
      //       //       message: `Driver's data has been saved`,
      //       //       icon: "fa fa-save",
      //       //       position: "topRight",
      //       //       timeout: 4000,
      //       //     });

      //       //     // setTimeout(() => {
      //       //     window.location.href = window.location.href;
      //       //     // }, 1500);
      //       //   })
      //       //   .catch((error) => {
      //       //     // iziToast.destroy();
      //       //     iziToast.warning({
      //       //       title: "Save Failed",
      //       //       message: `${error}`,
      //       //       icon: "fa fa-bell-exclamation",
      //       //       position: "topRight",
      //       //       timeout: 4000,
      //       //     });
      //       //     console.error("Update failed:", error);
      //       //   });
      //     }
      //   }
      // });

      //
      $("#list-of-schedule").on("dblclick", "td", (e) => {
        let i = $(e.target).index();

        // e.target can be INPUT, on dblclick multiple inputs are being rendered
        // added this line to make sure whenever TD is activated only will it render the input
        if (e.target.nodeName == "TD") {
          if (i == 1) {
            let day = $(e.target).text();
            $(e.target).html(
              `<input type="text" value="${day}"> <i class="fa fa-check save-day-schedule" style="color: green; cursor: pointer" title="Save"></i>`
            );
          } else if (i == 2) {
            $(e.target).html(
              `<input type="time"> <i class="fa fa-check save-start-schedule" step="1800" style="color: green; cursor: pointer" title="Save"></i>`
            );
          } else if (i == 3) {
            $(e.target).html(
              `<input type="time"> <i class="fa fa-check save-end-schedule" step="1800" style="color: green; cursor: pointer" title="Save"></i>`
            );
          }
        }
      });

      $("#list-of-schedule").on("blur", "td", (e) => {
        let day = $(e.target).val();
        $(e.target).html(`<td>${day}</td>`);
        console.log("Blurred");
      });

      // List of Schedule - Day
      $("#list-of-schedule").on("click", ".save-day-schedule", (e) => {
        let day = $(e.target).parent().find("input").val().toUpperCase();
        let driverid = $(e.target).parent().parent().attr("driverid");
        console.log(driverid);

        let splitDay = day.split(",");
        let dayList = ["M", "T", "W", "TH", "F", "SAT", "SUN"];

        let notFoundDays = splitDay.filter((value) => !dayList.includes(value));

        if (notFoundDays.length > 0) {
          iziToast.warning({
            title: "Invalid input Days",
            message: `"${notFoundDays.join(", ")}" not found`,
            icon: "fa fa-check",
            position: "topRight",
            timeout: 3000,
          });
        } else {
          // iziToast.info({
          //   title: "Saving",
          //   message: `"Please wait...`,
          //   icon: "fa fa-info",
          //   position: "topRight",
          //   timeout: 3000,
          // });

          // Modify Firebase password
          const updates = {};
          updates[`/users/drivers/${driverid}/schedule/day_available`] = day;
          console.log(updates);
          update(ref(database), updates)
            .then(() => {
              iziToast.success({
                title: "Successfully Saved",
                // message: `${blurrednode.toUpperCase()} has been saved`,
                icon: "fa fa-save",
                position: "topRight",
                timeout: 3000,
              });
            })
            .catch((error) => {
              iziToast.warning({
                title: "Save Failed",
                message: `${error}`,
                icon: "fa fa-bell-exclamation",
                position: "topRight",
                timeout: 4000,
              });
            });
        }
      });

      // List of Schedule - Time Start
      $("#list-of-schedule").on("click", ".save-start-schedule", (e) => {
        let time = $(e.target).parent().find("input").val().trim();
        let driverid = $(e.target).parent().parent().attr("driverid");
        console.log(driverid);

        if (time == "") {
          iziToast.warning({
            title: "Please enter Start Time",
            icon: "fa fa-check",
            position: "topRight",
            timeout: 3000,
          });
        } else {
          // Modify Firebase password
          const updates = {};
          updates[`/users/drivers/${driverid}/schedule/start`] = time;
          console.log(updates);
          update(ref(database), updates)
            .then(() => {
              iziToast.success({
                title: "Successfully Saved",
                // message: `${blurrednode.toUpperCase()} has been saved`,
                icon: "fa fa-save",
                position: "topRight",
                timeout: 3000,
              });
            })
            .catch((error) => {
              iziToast.warning({
                title: "Save Failed",
                message: `${error}`,
                icon: "fa fa-bell-exclamation",
                position: "topRight",
                timeout: 4000,
              });
            });
        }
      });

      // List of Schedule - Time End
      $("#list-of-schedule").on("click", ".save-end-schedule", (e) => {
        let time = $(e.target).parent().find("input").val().trim();
        let driverid = $(e.target).parent().parent().attr("driverid");
        console.log(driverid);

        if (time == "") {
          iziToast.warning({
            title: "Please enter End Time",
            icon: "fa fa-check",
            position: "topRight",
            timeout: 3000,
          });
        } else {
          // Modify Firebase password
          const updates = {};
          updates[`/users/drivers/${driverid}/schedule/end`] = time;
          console.log(updates);
          update(ref(database), updates)
            .then(() => {
              iziToast.success({
                title: "Successfully Saved",
                // message: `${blurrednode.toUpperCase()} has been saved`,
                icon: "fa fa-save",
                position: "topRight",
                timeout: 3000,
              });
            })
            .catch((error) => {
              iziToast.warning({
                title: "Save Failed",
                message: `${error}`,
                icon: "fa fa-bell-exclamation",
                position: "topRight",
                timeout: 4000,
              });
            });
        }
      });
    }
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

  $("#btn-sign-out").on("click", () => {
    iziToast.question({
      // timeout: 20000,
      close: false,
      overlay: true,
      // displayMode: 'once',
      id: "question",
      zindex: 999,
      title: "Logout",
      message: "Are you sure you want to logout?",
      position: "center",
      buttons: [
        [
          "<button><b>YES</b></button>",
          function (instance, toast) {
            instance.hide({ transitionOut: "fadeOut" }, toast, "button");
            window.location.href = "index.html";
            sessionStorage.setItem("uid", "");
          },
          true,
        ],
        [
          "<button>NO</button>",
          function (instance, toast) {
            instance.hide({ transitionOut: "fadeOut" }, toast, "button");
          },
        ],
      ],
      onClosing: function (instance, toast, closedBy) {
        console.info("Closing | closedBy: " + closedBy);
      },
      onClosed: function (instance, toast, closedBy) {
        console.info("Closed | closedBy: " + closedBy);
      },
    });
  });
  // } else {
  // Dashboard
  window.searchAvailableDrivers = () => {
    // console.log(12);
    return new Promise((resolve, reject) => {
      // Simulating an asynchronous operation (e.g., a network request)
      const onlineDriver = ref(database, "users/drivers/");
      onValue(onlineDriver, (snapshot) => {
        const data = snapshot.val();
        let listOnlineDriver = [];

        for (let driver in data) {
          let detail = data[driver];

          if (detail.isAvailable) {
            listOnlineDriver.push({
              driverName: detail.drivername,
              driverID: detail.driverid,
            });
          }
        }

        if (listOnlineDriver.length > 0) {
          resolve(listOnlineDriver);
        } else {
          reject([]);
        }
      });
    });
  };

  window.getDriverReference = () => {
    let currentDate = getCurrentDate("ymd-");
    const onlineDriver = ref(
      database,
      "activity/booking/" + currentDate + "/drivers"
    );
    return onlineDriver;
  };

  window.getUserDetails = () => {
    return new Promise((resolve, reject) => {
      const users = ref(database, "users/drivers");
      get(users).then((snap) => {
        let data = snap.val();

        console.log(snap.exists());
        if (snap.exists()) {
          // console.log(data);
          resolve(data);
        } else {
          reject([]);
        }
      });
    });
    // return users;
  };

  window.getDriverSchedule = () => {
    return new Promise((resolve, reject) => {
      const schedule = ref(database, "users/drivers/");
      get(schedule).then((snap) => {
        let data = snap.val();

        console.log(snap.exists());
        if (snap.exists()) {
          console.log(data);

          resolve(data);
        } else {
          reject([]);
        }
      });
    });
    // return users;
  };

  window.getOnValue = () => {
    return onValue;
  };

  window.getRef = () => {
    return ref;
  };

  window.getUpdate = () => {
    return update;
  };

  window.getDatabase = () => {
    return database;
  };
  // }
});
