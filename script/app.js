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
let isPageAnalytics =
  window.location.href.includes("analytics") ||
  window.location.href.includes("reports");

let isPageFeedback = window.location.href.includes("feedback");
let isPageActivity = window.location.href.includes("activity");

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

function convertToTimestamp(dateString) {
  // Parse the date string into a JavaScript Date object
  const date = new Date(dateString);

  // Check if the Date object is valid
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format. Please use YYYY-MM-DD.");
  }

  // Return the Unix timestamp (in seconds)
  // return Math.floor(date.getTime() / 1000);
  return date.getTime();
}

function formatMonthName(value) {
  // Create a new Date object from the timestamp
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
    "Total",
  ];

  return monthNames[value];
}

function formatTimestampToYear(timestamp) {
  // Create a new Date object from the timestamp
  const date = new Date(timestamp);
  const year = date.getFullYear(); // Get the full year (yyyy)

  return year;
}

function formatTimestampToMonth(timestamp) {
  // Create a new Date object from the timestamp
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Get the month (mm, 0-based, so add 1)

  return month;
}

function formatTimestampToDay(timestamp) {
  // Create a new Date object from the timestamp
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, "0"); // Get the day (dd) and ensure it is two digits

  return day;
}

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
  } else if (format == "m") {
    return `${monthNames[today.getMonth()]}`;
  } else if (format == "mn") {
    // month name
    return today.getMonth + 1;
  } else if (format == "y") {
    // month name
    return year;
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

  $("#text-overall-booking").text(overall);

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
  let driverIncomeInd = {};

  Object.entries(d.income).forEach(([date, dateData]) => {
    let tsDate = convertToTimestamp(date);
    let fYear = +formatTimestampToYear(tsDate);
    let fMonth = formatTimestampToMonth(tsDate);

    console.log(`Date: ${date}, tsDate: ${formatTimestampToMonth(tsDate)}`);

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

        if (!driverIncomeInd[driverId]) {
          driverIncomeInd[driverId] = {};
          // console.log("Initialized driverIncomeInd");
        }

        if (!driverIncomeInd[driverId][fYear]) {
          driverIncomeInd[driverId][fYear] = {};
          // console.log("Initialized driverIncomeInd");
        }

        if (!driverIncomeInd[driverId][fYear][fMonth]) {
          driverIncomeInd[driverId][fYear][fMonth] = {};
          // console.log("Initialized driverIncomeInd");
        }

        if (!driverTotals[driverName]) {
          driverTotals[driverName] = {
            amount: 0,
            id: driverId,
          }; // Initialize if not already present
        }

        driverTotals[driverName].amount += data.amount; // Add the amount

        // console.log(`driverIncomeInd: driverId: ${driverId}, date: ${date}, fYear: ${fYear}, fMonth: ${fMonth}`);
        // let vYear = fYear;
        let incomeMonth =
          driverIncomeInd[driverId][fYear][fMonth]["income"] || 0;
        let bookingMonth =
          driverIncomeInd[driverId][fYear][fMonth]["booking"] || 0;

        // console.log("data.amount", incomeMonth);
        driverIncomeInd[driverId][fYear][fMonth]["income"] =
          incomeMonth + data.amount;
        driverIncomeInd[driverId][fYear][fMonth]["booking"] = bookingMonth + 1;
      });

      // chartData.push([driverId, driverData.amount]);
    });

    console.log("---");
  });

  // console.log("driverIncomeInd", driverIncomeInd);

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

  return { driverTotals, driverIncomeInd };
}

$(document).ready(() => {
  // $(function () {
  // $('[data-toggle="popover"]').popover();
  // });

  // $(".sd-CustomSelect").multipleSelect({
  //   selectAll: false,
  //   onOptgroupClick: function (view) {
  //     $(view).parents("label").addClass("selected-optgroup");
  //   },
  // });

  if (isPageSchedule || isPageAnalytics) {
    google.charts.load("current", { packages: ["corechart"] });
    // google.charts.setOnLoadCallback(drawBookingChart);
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

  // $("#date-today").text(getCurrentDate("mdyt") + " Bookings");

  // let selOption = "";
  // selOption += `

  // `;
  $("#option-year, #option-revenue").append(
    new Option(getCurrentDate("y") - 1, getCurrentDate("y") - 1)
  );
  $("#option-year, #option-revenue").append(
    new Option(getCurrentDate("y"), getCurrentDate("y"))
  );
  $("#option-year, #option-revenue").append(
    new Option(getCurrentDate("y") + 1, getCurrentDate("y") + 1)
  );

  $("#option-year, #option-revenue").val(getCurrentDate("y"));

  $("#option-revenue-month").append(new Option("Overall", 0));

  for (let i = 1; i <= 12; i++) {
    $("#option-revenue-month").append(new Option(formatMonthName(i - 1), i));
  }

  // $("#option-revenue-month").val(new Date().getMonth());
  $("#option-revenue-month").val(0);

  // $("#option-year").append(new Option("2025", 2025));

  // $("#option-year").append(
  //   new Option("getCurrentDate", "hahaha")
  // );
  // $("#Bookings").append(getCurrentDate("y"));

  let bookCount = 0;
  let overallBookCount = 0;

  let monthColor = [
    "#4a8dff",
    "#f84964",
    "#f84998",
    "#bd49f8",
    "#26b1dc",
    "#46a455",
    "#a6a992",
    "#e9e54f",
    "#ffa62c",
    "#ffa9a9",
    "#484848",
    "#93c739",
    "#00855d", // Total
  ];

  $("#calendar").datepicker({
    inline: true,
    firstDay: 1,
    showOtherMonths: true,
    dayNamesMin: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  });

  // Set current date
  $("#calendar").datepicker("setDate", new Date());

  // $('#calendar-test').datepicker({
  //   inline:true,
  //   firstDay: 1,
  //   showOtherMonths:true,
  //   dayNamesMin:['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  // });

  if (isPageAnalytics) {
    const booking = ref(database, "activity/booking");
    onValue(booking, (snapshot) => {
      const data = snapshot.val();
      console.log(data);

      let userData = [];
      let dateData = {};

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

                // console.log("formatTimestampToYear", formatTimestampToMonth(+tsd));

                // if(!dateData[yearKey]){
                let count = 0;
                let dayCount = 0;
                let yearKey = +formatTimestampToYear(+tsd);
                let monthKey = +formatTimestampToMonth(+tsd);
                let dayKey = +formatTimestampToDay(+tsd);

                // console.log("dayKey", dayKey);

                // Ensure `dateData[yearKey]` exists
                if (!dateData[yearKey]) {
                  dateData[yearKey] = {};
                }

                // Ensure `dateData[yearKey][monthKey]` exists
                if (!dateData[yearKey][monthKey]) {
                  dateData[yearKey][monthKey] = {};
                }

                // Ensure count is set correctly
                count = dateData[yearKey][monthKey].monthCount || 0;
                dayCount = dateData[yearKey][monthKey][dayKey] || 0;

                // Update `dateData` with the new structure
                dateData[yearKey] = {
                  ...dateData[yearKey],
                  [monthKey]: {
                    ...dateData[yearKey][monthKey],
                    [dayKey]: dayCount + 1,
                    monthCount: count + 1,
                  },
                };

                overallBookCount++;

                for (let email in ts[tsd]) {
                  // console.log(email);
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

        console.log("dateData", dateData);

        let pageList = `<div class='row' style='text-align: center; font-weight: bold; margin-bottom: 15px;'>
            <div class='col-2'>Month</div>
            <div class='col-4'>Overall Booking</div>
            <div class='col-6'>Calendar</div>
          </div>
          
          <div class='row'>
              <div class="col-6">
          
          `;
        let pageList2 = pageList;
        let selectedYear = $("#option-year").val();

        displayBookingData(selectedYear);

        $("#option-year")
          .off("change")
          .on("change", (e) => {
            selectedYear = $(e.target).val();
            displayBookingData($(e.target).val());
            // renderCal(1);
            progressClick();
          });

        progressClick();
        function progressClick() {
          $(".progress-add")
            .off("click")
            .on("click", (e) => {
              let monthName = $(e.target).attr("month");
              let monthIndex = +$(e.target).attr("monthIndex");
              let totalMonthCount = +$(e.target).attr("totalMonthCount");

              if (monthName != "Total") {
                // let dayCalendar = $(e.target)
                //   .parent()
                //   .parent()
                //   .parent()
                //   .find(".day-calendar");
                // console.log(dayCalendar);

                // $(".day-calendar").each((i, d) => {
                //   if ($(d).css("display") == "block") {
                //     $(d).css("display", "none");
                //   }
                // });

                // dayCalendar.css()
                // let calendarPage = `
                //   <div id="calendar-${monthName.toLowerCase()}"
                //     style="
                //       /*width: 50%;
                //       max-width: 100px;
                //       height: 100px;
                //       overflow: hidden;*/
                //       border: 1px solid #ddd;
                //     "
                //     class="day-calendar-month"
                //   >${monthName}</div>
                // `;
                // dayCalendar.css()
                let calendarPage = `
              <div class="group header">
                <!--<p class="left pointer minusmonth">&laquo;</p>-->
                <p " class="left monthname center pointer" style="background: white"></p>
                <!--<p class="right pointer addmonth">&raquo;</p>-->
              </div>
              <ul class="group" style="padding: 2px">
                <li>Mo</li>
                <li>Tu</li>
                <li>We</li>
                <li>Th</li>
                <li>Fr</li>
                <li>Sa</li>
                <li>Su</li>
              </ul>
            `;

                // $(`#day-calendar`).html(calendarPage);
                // dayCalendar.fadeIn();

                // let calendarEl = document.getElementById(
                //   `calendar-${monthName.toLowerCase()}`
                // );
                // console.log(calendarEl);

                // var calendar = new FullCalendar.Calendar(calendarEl, {
                //   initialView: "dayGridMonth", // or your desired view
                //   height: "auto",
                //   aspectRatio: 1.5, // Adjust ratio
                //   windowResize: function () {
                //     calendar.updateSize(); // Recalculate on resize
                //   },
                // });

                // calendar.render();

                // let calendar = new FullCalendar.Calendar(calendarEl, {
                //   initialView: "dayGridDay", // Options: 'timeGridDay' or 'dayGridDay'
                //   selectable: true,
                //   headerToolbar: {
                //     left: "prevYear,prev,next,nextYear today",
                //     center: "title",
                //     right: "dayGridMonth,dayGridWeek,dayGridDay",
                //   },
                //   select: function (startDate, endDate, jsEvent, view) {
                //     console.log(startDate, endDate, jsEvent, view);
                //     // Check if any event exists on the selected date
                //   },
                //   // validRange: {
                //   //   start: new Date().toISOString().split("T")[0], // Disable dates before today
                //   // },
                //   height: 400,                // Explicit height in pixels
                //   contentHeight: 'auto',
                //   // contentHeight: 500,
                //   // width: "50%",
                //   initialDate: '2023-01-12',
                //   // navLinks: true, // can click day/week names to navigate views
                //   // editable: true,
                //   // dayMaxEvents: true, // allow "more" link when too many events
                //   // plugins: [ 'rrule' ], // Include the RRule plugin
                //   // events: events,
                //   windowResize: function(view) {
                //     if (window.innerWidth < 600) {
                //       calendar.changeView('listMonth'); // Switch to a list view for small screens
                //     } else {
                //       calendar.changeView('dayGridMonth'); // Default view for larger screens
                //     }
                //   },
                //   // events: //events,
                //   // [
                //   //   {
                //   //     // title: "My repeating event",
                //   //     // start: "10:00", // a start time (10am in this example)
                //   //     // end: "14:00", // an end time (2pm in this example)
                //   //     // dow: [1, 4], // Repeat monday and thursday
                //   //   },
                //   //   {
                //   //     title: "My repeating event",
                //   //     daysOfWeek: ["3", "5"], // these recurrent events move separately
                //   //     startTime: "11:00:00",
                //   //     endTime: "11:30:00",
                //   //     color: "red",
                //   //   },
                //   //   {
                //   //     title: "My repeating event2",
                //   //     daysOfWeek: ["3", "5"], // these recurrent events move separately
                //   //     startTime: "09:00:00",
                //   //     endTime: "12:30:00",
                //   //     color: "green",
                //   //   },
                //   // ],
                //   // themeSystem: "lumen",
                // });

                // calendar.render();

                renderCal(monthIndex + 1, false);
                $("#total-records").html(
                  `<div style="font-size: 15px; color: #555555; font-weight: bold">Total: ${totalMonthCount} Bookings</div>`
                );
              }

              // $("#calendar-month-name").

              // $(".day-calendar-month").css("max-width", "unset !important");
              // $(".day-calendar-month").css("width", "unset !important");
            });
        }

        function displayBookingData(value) {
          let selectedYear = value;

          let maxMonthCount = 0;
          let totalMonthCount = 0;
          let totalMonthCount2 = 0;

          let totalYearCount = 0;
          let maxMonth = null; // Store the month with the max monthCount
          let isEmpty = true;

          for (let month in dateData[selectedYear]) {
            if (dateData[selectedYear][month].monthCount > maxMonthCount) {
              maxMonthCount = dateData[selectedYear][month].monthCount;
              maxMonth = month;
            }

            totalMonthCount += maxMonthCount; //dateData[selectedYear][month].monthCount;

            if (selectedYear == new Date().getFullYear()) {
              totalYearCount += dateData[selectedYear][month].monthCount;
            }
          }

          totalMonthCount2 = maxMonthCount;

          console.log(
            "totalMonthCount ",
            totalMonthCount,
            dateData[selectedYear]
          );

          for (let year in dateData) {
            if (year == selectedYear) {
              isEmpty = false;

              // for(let month in dateData[year]){
              for (let month in monthColor) {
                let monthName = formatMonthName(month);

                // console.log("monthName", dateData[year], month + 1);
                // if(dateData[year][+month + 1]){
                let monthCount = dateData[year][+month + 1]?.monthCount ?? 0;
                let valNow = Math.round((monthCount / totalMonthCount) * 100);
                console.log("valNow", monthCount);
                console.log("valNow", monthName, monthColor.length - 1);

                if (month != monthColor.length - 1) {
                  pageList += `                
                        <div class="row">    
                          <div class="col-3" style="text-align: center">${monthName}</div>
                          <div class="col-9">
                            <div class="progress" style="width: unset; height: 15px; cursor: pointer">
                              <div class="progress-bar progress-add progress-bar-striped progress-bar-animated" 
                                role="progressbar" 
                                month="${monthName}"
                                monthIndex=${month}
                                totalMonthCount=${monthCount}
                                aria-valuenow="${valNow}"
                                aria-valuemin="0" 
                                aria-valuemax="100" 
                                title="${monthCount} Bookings"
                                style="width: ${valNow}%; background-color: ${
                    monthColor[+month]
                  }; transition: 1s">
                                ${valNow}%
                              </div>
                            </div>
                          </div>
                        </div>
                    
                    `;
                } else {
                  pageList += `          
                  <hr/>      
                  <div class="row">    
                    <div class="col-3" style="text-align: center">${monthName}</div>
                    <div class="col-9">
                      <div class="progress" style="width: unset; height: 15px; cursor: pointer">
                        <div class="progress-bar progress-add progress-bar-striped progress-bar-animated" 
                          role="progressbar" 
                          month="${monthName}"
                          monthIndex=${month}
                          aria-valuenow="100"
                          aria-valuemin="0" 
                          aria-valuemax="100" 
                          style="width: 100%; background-color: ${
                            monthColor[+month]
                          }; transition: 1s">
                          ${totalYearCount} Total Bookings for Year ${selectedYear}
                        </div>
                      </div>
                    </div>
                  </div>
              
              `;
                }
                // }
              }
            }
          }

          console.log({ isEmpty });

          if (isEmpty) {
            for (let month in monthColor) {
              let monthName = formatMonthName(month);

              // console.log("monthName", dateData[year], month + 1);
              // if(dateData[year][+month + 1]){
              let monthCount = 0;
              let valNow = 0;

              if (month != monthColor.length - 1) {
                pageList += `                
                        <div class="row">    
                          <div class="col-3" style="text-align: center">${monthName}</div>
                          <div class="col-9">
                            <div class="progress" style="width: unset; height: 15px; cursor: pointer">
                              <div class="progress-bar progress-add progress-bar-striped progress-bar-animated" 
                                role="progressbar" 
                                month="${monthName}"
                                monthIndex=${month}
                                totalMonthCount=${monthCount}
                                aria-valuenow="${valNow}"
                                aria-valuemin="0" 
                                aria-valuemax="100" 
                                title="${monthCount} Bookings"
                                style="width: ${valNow}%; background-color: ${
                  monthColor[+month]
                }; transition: 1s">
                                ${valNow}%
                              </div>
                            </div>
                          </div>
                        </div>
                    
                  `;
              } else {
                pageList += `          
                  <hr/>      
                  <div class="row">    
                    <div class="col-3" style="text-align: center">${monthName}</div>
                    <div class="col-9">
                      <div class="progress" style="width: unset; height: 15px; cursor: pointer">
                        <div class="progress-bar progress-add progress-bar-striped progress-bar-animated" 
                          role="progressbar" 
                          month="${monthName}"
                          monthIndex=${month}
                          aria-valuenow="100"
                          aria-valuemin="0" 
                          aria-valuemax="100" 
                          style="width: 100%; background-color: ${
                            monthColor[+month]
                          }; transition: 1s">
                          ${totalYearCount} Total Bookings for Year ${selectedYear}
                        </div>
                      </div>
                    </div>
                  </div>`;
              }
              // }
            }
          }

          pageList += `
             </div>
              <div class="col-6">
                <div style="" id="day-calendar">
                  <!--<div id="calendar-test"></div>-->

                  <div class="calendar">
                    <div class="group header1">
                      <!--<p class="left pointer minusmonth">&laquo;</p>-->
                      <p id="calendar-month-name" class="left monthname center pointer" style="background: white"></p>
                      <p class="center pointer" id="total-records"></p>
                    </div>
                    <ul class="group" style="padding: 2px">
                      <li>Mo</li>
                      <li>Tu</li>
                      <li>We</li>
                      <li>Th</li>
                      <li>Fr</li>
                      <li>Sa</li>
                      <li>Su</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          `;

          //   <div style="display: none" class="day-calendar">
          //   <div id="day-calendar-${monthName}" class="col-12" style="/* display: flex; */justify-content: center;align-items: center;height: 100px;    max-width: unset;">
          //   </div>
          // </div>

          $("#page-booking-month").html(pageList);
          pageList = pageList2;

          $("#total-records").html(
            `<div style="font-size: 15px; color: #555555; font-weight: bold">Total: ${totalMonthCount2} Bookings</div>`
          );

          // $("#text-total-per-year").text("" + totalYearCount);

          //
          var d = new Date();
          var themonth = d.getMonth() + 1;

          renderCal(themonth, isEmpty);

          // var calendarEl = document.getElementById('calendar-test'); // Target the div

          // var calendar = new FullCalendar.Calendar(calendarEl, {
          //   initialView: 'dayGridMonth', // Initial calendar layout
          //   height: '100%', // Dynamically adjust height
          //   headerToolbar: {
          //     left: 'prev,next',
          //     center: 'title',
          //     right: 'dayGridMonth,timeGridWeek'
          //   },
          // });
          // calendar.render(); // Render the calendar
        }

        // $(".minusmonth").click(function () {
        //   themonth += -1;
        //   renderCal(themonth);
        // });

        // $(".addmonth").click(function () {
        //   themonth += 1;
        //   renderCal(themonth);
        // });

        // function addMonth(themonth){

        // }

        function renderCal(themonth, isEmpty) {
          $(".calendar li").remove();
          $(".calendar ul").append(
            "<li>Mon</li><li>Tue</li><li>Wed</li><li>Thu</li><li>Fri</li><li>Sat</li> <li>Sun</li>"
          );
          var d = new Date(),
            currentMonth = themonth, //d.getMonth() + themonth, // get this month
            days = numDays(currentMonth, d.getYear()), // get number of days in the month
            fDay = firstDay(currentMonth, d.getYear()) - 1, // find what day of the week the 1st lands on
            months = [
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
            ]; // month names

          $(".calendar p.monthname").text(
            months[currentMonth - 1] + " Daily Records"
          ); // add month name to calendar

          for (var i = 0; i < fDay - 1; i++) {
            // place the first day of the month in the correct position
            $('<li class="empty">&nbsp;</li>').appendTo(".calendar ul");
          }

          for (var i = 1; i <= days; i++) {
            console.log(selectedYear, themonth, Object.keys(dateData).length);
            let val = isEmpty
              ? ""
              : dateData[selectedYear][themonth]?.[i] ?? "";

            if (
              d.getDate() == i &&
              d.getMonth() + 1 == themonth &&
              d.getFullYear() == selectedYear
            ) {
              $(
                `<li class='active'>` +
                  i +
                  `<div style='font-size: 10px'>${
                    val == "" ? "0" : val
                  } today</div></li>`
              ).appendTo(".calendar ul");
            } else {
              // write out the days
              $(
                `<li class=''>` +
                  i +
                  `<div style='font-size: 10px'>${
                    val == "" ? "&nbsp;" : val + " bookings"
                  }</div></li>`
              ).appendTo(".calendar ul");
            }
          }

          function firstDay(month, year) {
            return new Date(year, month, 1).getDay();
          }

          function numDays(month, year) {
            return new Date(year, month, 0).getDate();
          }

          // $(".calendar li").click(function () {
          //   $(".calendar li").removeClass("active");
          //   $(this).addClass("active");
          // });
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

        // drawBookingChart(bookCount, overallBookCount);

        $("#tbl-total-bookings").DataTable({
          searching: true,
          // autoWidth: false,
          // width: "100px !important",
          scrollX: true,
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
          initComplete: function () {
            console.log("initComplete");

            // Add a date picker input to the 'Start Date' footer for filtering
            this.api()
              .columns(2)
              .every(function () {
                var column = this;
                console.log(column);

                $(
                  '<input type="text" placeholder="Filter Start Date" style="width: 100%">'
                )
                  .appendTo($(column.footer()))
                  .datepicker({
                    changeMonth: true,
                    changeYear: true,
                    dateFormat: "yy-mm-dd",
                    onSelect: function (date) {
                      column.search(date).draw();
                    },
                  });
              });
          },
        });
      } else {
        console.log("not connected");
      }
    });
  }

  if (isPageAnalytics || isPageActivity) {
    let optYearSelected = +$("#option-revenue").val();
    let optMonthSelected = +$("#option-revenue-month").val();

    const monetization = ref(database, "/");
    onValue(monetization, (snapshot) => {
      const data = snapshot.val();

      let userData = [];

      if (data) {
        if (isPageActivity) {
          let activities = [];
          let counter = 0;
          console.log("isPageActivity", data.activity.admin);

          Object.entries(data.activity.admin).forEach(([timestamp, value]) => {
            console.log(timestamp, value);

            activities.push({
              id: counter,
              timestamp: formatTimestampToDateAll(+timestamp),
              activity: value.activity,
              page: value.page.toUpperCase(),
              uid: value.uid,
            });
            counter++;
          });

          $("#tbl-activity").DataTable({
            data: activities,
            columns: [
              { data: "id" },
              { data: "timestamp" },
              { data: "activity" },
              { data: "page" },
            ],
            columnDefs: [
              {
                targets: 0, // Target column 0
                visible: false, // Hide column 0
                searchable: false, // Exclude from search (optional)
              },
            ],
            // createdRow: function (row, rowData, dataIndex) {
            //   // $(row).attr("driverid", rowData.driverid);
            //   // $(row).css("background", "#ffe8d4");
            // },
            searching: true,
            responsive: true,
            ordering: true,
            destroy: true,
            info: false,
            language: {
              emptyTable: "No entries to show",
              infoEmpty: "No entries to show",
            },
          });
        }

        if (isPageAnalytics) {
          let driverTotals = drawMonetizationChart(data);
          console.log("HERE!!", driverTotals);

          $("#option-revenue")
            .off("change")
            .on("change", (e) => {
              optYearSelected = $(e.target).val();
              renderRevenueTable(driverTotals);
            });

          $("#option-revenue-month")
            .off("change")
            .on("change", (e) => {
              optMonthSelected = $(e.target).val();
              console.log("change optMonthSelected", optMonthSelected);
              renderRevenueTable(driverTotals);
            });

          renderRevenueTable(driverTotals);

          function renderRevenueTable(driverTotals) {
            // let dlist = "";
            let dlist = [];
            let tBook = 0;
            let tInc = 0;

            Object.entries(driverTotals.driverTotals).forEach(([id, value]) => {
              // chartData.push([`P${amount.toFixed(2)} - ${id}`, amount]);
              // chartData.push([id, `P${+amount.toFixed(2)}`]);
              let totalBooking = 0;
              let totalBooking2 = 0;
              let totalIncome = 0;

              Object.entries(data.income).forEach(([date, dateData]) => {
                // Loop through drivers on the given date
                Object.entries(dateData.drivers).forEach(
                  ([driverId, driverData]) => {
                    if (value.id == driverId) {
                      console.log(
                        "Sample",
                        driverId,
                        Object.keys(driverData).length
                      );

                      // let mInc =
                      //     driverTotals.driverIncomeInd[driverId]?.[
                      //       optYearSelected
                      //     ]?.[optMonthSelected]?.["income"] || 0;
                      // console.log(mInc);

                      // Overall
                      if (optMonthSelected == 0) {
                        totalBooking += Object.keys(driverData).length;
                        // tBook += totalBooking;
                        // console.log("tBook += totalBooking;", totalBooking);
                      }
                      // Per Month
                      else {
                        // console.log("22222", driverTotals.driverIncomeInd[driverId]);
                        // console.log("11111", driverTotals.driverIncomeInd[driverId][optYearSelected][+optMonthSelected], optMonthSelected);
                        let monthlyIncome =
                          driverTotals.driverIncomeInd[driverId]?.[
                            optYearSelected
                          ]?.[optMonthSelected]?.["income"] || 0;
                        let monthlyBooking =
                          driverTotals.driverIncomeInd[driverId]?.[
                            optYearSelected
                          ]?.[optMonthSelected]?.["booking"] || 0;
                        console.log("monthlyIncome", monthlyIncome);
                        console.log("bookingMonth", monthlyBooking);
                        // totalBooking = month;
                        totalIncome = monthlyIncome;
                        totalBooking2 = monthlyBooking;
                        // totalBooking += Object.keys(driverData).length;
                        // tBook += +monthlyIncome;

                        // let totalBooking2 =
                        // Object.entries(driverTotals.driverIncomeInd).forEach(
                        //   ([c, value]) => {
                        //     let month = value[optYearSelected][optMonthSelected] || 0;
                        //     // let month = value[optYearSelected]; //[optMonthSelected] || 0;
                        //     console.log("Loggging", driverId, c, month);

                        //     if(c == driverId){
                        //       totalBooking = month;
                        //       console.log("Loggging", month);
                        //     }

                        //     // Object.entries(month).forEach(([v, b]) => {
                        //     //   console.log(v, b);

                        //     // });
                        //   }
                        // );
                      }
                    }
                  }
                );
              });

              if (optMonthSelected == 0) {
                // dlist += `
                // <tr driverid="${value.id}">
                //   <td id="driver-name">${id}</td>
                //   <td>P${value.amount.toFixed(2)}</td>
                //   <td>${totalBooking}</td>
                // </tr>
                // `;
                dlist.push({
                  driverid: value.id,
                  driverName: id, // #id
                  amount: value.amount.toFixed(2),
                  totalBooking: totalBooking,
                });

                tBook += totalBooking;
                tInc += +value.amount.toFixed(2);
              } else {
                console.log("totalBooking:", totalBooking);
                console.log("totalIncome:", totalIncome);
                console.log("optMonthSelected:", optMonthSelected);

                // dlist += `
                // <tr driverid="${value.id}">
                //   <td id="driver-name">${id}</td>
                //   <td>P${totalIncome.toFixed(2)}</td>
                //   <td>${totalBooking}</td>
                // </tr>
                // `;

                dlist.push({
                  driverid: value.id,
                  driverName: id, // #id
                  amount: `P${totalIncome.toFixed(2)}`,
                  totalBooking: totalBooking2,
                });

                tBook += totalBooking2;
                tInc += +value.amount.toFixed(2);
              }

              // if (optMonthSelected == 0) {
              //   dlist = "";
              // }
            });

            // Add Total Row
            dlist.push({
              driverid: "Total",
              driverName: "Total Revenue", // #id
              amount: `P${tInc.toFixed(2)}`,
              totalBooking: tBook,
            });

            tInc = 0;
            tBook = 0;

            console.log(dlist);
            // $("#monetized-data").html(dlist);

            // Check if the DataTable instance already exists, then destroy it
            // if ($.fn.DataTable.isDataTable("#tbl-monetization")) {
            // $("#tbl-monetization").DataTable().destroy();

            // Destroy the existing DataTable instance
            // if ($.fn.DataTable.isDataTable("#tbl-monetization")) {
            // $("#tbl-monetization").DataTable().destroy();
            // }

            $("#tbl-monetization").DataTable({
              data: dlist,
              columns: [
                { data: "driverName" },
                { data: "amount" },
                {
                  data: "totalBooking",
                  //   render: function (data, type, row) {
                  //     // Create a <td> cell with a data-custom attribute
                  //     return `<span data-custom="${row.customAttr}">${data}</span>`;
                  // },
                },
              ],
              createdRow: function (row, rowData, dataIndex) {
                // dlist += `
                // <tr driverid="${value.id}">
                //   <td id="driver-name">${id}</td>
                //   <td>P${totalIncome.toFixed(2)}</td>
                //   <td>${totalBooking}</td>
                // </tr>
                // `;
                // driverid: value.id,
                // driverName: id, // #id
                // amount: `P${totalIncome.toFixed(2)}`,
                // totalBooking: totalBooking2

                if (rowData.driverid != "Total") {
                  $(row).attr("driverid", rowData.driverid);
                  $("td", row).eq(0).attr("id", "driver-name");
                  // $('td', row).eq(2).attr('title', `Value is ${rowData.value}`);
                  // } else {
                  //   $('td', row).eq(2).attr('driverid', rowData.driverid);
                  //   $('td', row).eq(2).attr('title', `Value is ${rowData.value}`);
                } else {
                  $(row).css("background", "#ffe8d4");
                  // $('td', row).css('pointer-events', 'none'); // Disable interaction
                  // $(row).addClass("no-sort");
                  // const $table = $('#tbl-monetization');
                  // const lastRow = $table.find('tbody tr:last-child');

                  // const footer = $table.find('tfoot');
                  // if (!footer.length) {
                  //     $table.append('<tfoot></tfoot>');
                  //     $table.find("tfoot").html("<tr>" + $(row).html() + "</tr>");
                  //     console.log($($table));
                  //     $(row).empty();
                  // }
                  // footer.empty().append(lastRow); // Move row to tfoot
                }
              },
              searching: true,
              responsive: true,
              // createdRow: function (row, data, dataIndex) {
              //   // Add a custom attribute to the <tr> element
              //   // $(row).attr("data-row-id", data.id); // Assuming `data.id` contains a unique identifier
              //   // $(row).addClass("custom-class"); // Optionally, add a class to the row
              //   console.log("data.id", data.id);
              // },
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
            // }

            // console.log($("#monetized-data"));
          }
        }
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

        logActivity(
          `Send email to ${$("#email-driver-name").attr(
            "email"
          )} for updated password`,
          "accounts"
        );
      },
      error: (e) => {
        iziToast.destroy();
        iziToast.warning({
          title: "Email Not Sent",
          message: `Please try again later (${e.message})`,
        });

        logActivity(
          `Failed to send email to ${$("#email-driver-name").attr(
            "email"
          )} for updated password`,
          "accounts"
        );
      },
      done: () => {},
    });
  });

  $("#monetized-data").on("dblclick", "tr", (e) => {
    let name = $(e.target).parent().find("#driver-name").text();
    // console.log($(e.target).parent().find("#driver-name"));

    let id = ($(e.target).eq(0).parent()?.attr("driverid") ?? "").trim();
    console.log("id", id);

    if (id != "") {
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
    }
  });

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
        let isDeleted = d[driver]?.isDeleted ?? false;

        if (!isDeleted) {
          lists += `<tr>`;
          // lists2 += `<tr id="${d[driver].driverid.trim()}">`;

          lists += `<td>${d[driver].plateno}</td>`;
          // lists2 += `<td col="plateno">${d[driver].plateno}</td>`;

          lists += `<td>${d[driver].drivername}</td>`;
          // lists2 += `<td col="drivername">${d[driver].drivername}</td>`;

          if (isPageFeedback) {
            lists += `<td>${d[driver].driveremail}</td>`;

            if (d[driver].feedback) {
              let li = "<ul style='padding: 0px; margin: 0px'>";
              Object.entries(d[driver].feedback).forEach(([email, value]) => {
                console.log(
                  sanitizeText(d[driver].driveremail),
                  sanitizeText(email)
                );

                li += `<li><span style="font-weight: normal">Customer: </span>${
                  value?.customerName ?? ""
                }</li>`;
                li += `<li><span style="font-weight: normal">Rating: </span>${"⭐".repeat(
                  value?.rating ?? 0
                )}</li>`;
                li += `<li><span style="font-weight: normal">Comment: </span>${
                  value?.comment ?? ""
                }</li>`;
                li += `<br/>`;
              });

              li += "</ul>";
              lists += `<td>${li}</td>`;
            } else {
              lists += `<td>~ </td>`;
            }
          } else {
            lists += `<td driverid="${driver}" pass="${d[driver].driverpassword}" class="message-driver" title="Double click to send message to driver">${d[driver].driveremail}</td>`;

            lists += `<td>${d[driver].driverage}</td>`;
            // lists2 += `<td col="driverage">${d[driver].driverage}</td>`;

            lists += `<td>${d[driver].driveraddress}</td>`;
            // lists2 += `<td col="driveraddress">${d[driver].driveraddress}</td>`;

            lists += `<td>${d[driver].drivercontact}</td>`;
            // lists2 += `<td col="drivercontact">${d[driver].drivercontact}</td>`;

            lists += `<td>${d[driver].vanmodel}</td>`;
            // lists2 += `<td col="vanmodel">${d[driver].vanmodel}</td>`;

            lists += `<td>${d[driver].dateaccountregistered}</td>`;

            lists += `
          <td style="font-size: 20px; text-align: center">
            <i class="fa fa-trash btn-delete-user" style="cursor: pointer" title="Delete"></i>
            <i class="fa fa-edit btn-update-user" style="cursor: pointer" title="Edit"></i>  
          </td>`;
            // lists2 += `<td col="dateaccountregistered">${d[driver].dateaccountregistered}</td>`;

            lists += `</tr>`;
          }
          // lists2 += `<td col="email">${d[driver].email}</td>`;

          // lists2 += `<td col="password">${d[driver].password}</td>`;
        }
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
        logActivity("Successful Login", "login");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorMessage);
        logActivity("Error Login", "login");

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
    console.log("Testtetett");

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

      $("#page-register")
        .find("input")
        .each((i, v) => {
          $(v).val("");
        });

      $("#reg-modal-title").text("Register Driver Account");
      $("#btn-register-driver").css("display", "block");
      $("#btn-update-driver").css("display", "none");
      $("#modalAccount").modal("show");
      $("#date-account-registered").val(getCurrentDate("ymd-"));

      // Remove Add button with Check
      if ($("#encode-add i").hasClass("fa-plus-circle")) {
        // if (allowNewRow) {
        //   $("#btn-add-new").before(newRow);
        //   $("#date-account-registered").val(getCurrentDate("ymd-"));
        //   $("#encode-add i").removeClass("fa-plus-circle");
        //   $("#encode-add i").addClass("fa-check");
        //   $("#encode-add i").css("color", "#00c700");
        // } else {
        //   iziToast.warning({
        //     // title: "Invalid Input",
        //     message: `Please complete all inputs to add new one`,
        //     icon: "fa fa-bell-exclamation",
        //     position: "topRight",
        //     timeout: 4000,
        //   });
        // }
      }
      // Remove check button with Add
      if (1 == 0) {
        // Done encoding, verify content for non-empty values
        // let data = validateEncode($("#btn-add-new"));

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
      /**
       * **/
    });

    $("#btn-register-driver").on("click", () => {
      // Done encoding, verify content for non-empty values
      let data = validateEncode();
      console.log(data);

      if (data.isCompleted) {
        // Check password if same first
        if ($("#pass").val() != $("#pass2").val()) {
          iziToast.info({
            title: "Password mismatch",
            message: `Password do not match`,
            icon: "fa fa-bell-exclamation",
            position: "topRight",
            timeout: 4000,
          });
        } else {
          let ret = validatePassword($("#pass").val());

          if (!ret.isValid) {
            iziToast.info({
              title: "Password Incorrect",
              message: `${ret.message}`,
              icon: "fa fa-bell-exclamation",
              position: "topRight",
              timeout: 4000,
            });
          } else {
            // Add extra details
            let nameAbbrevation = data.data["drivernamef"]
              .trim()
              .substring(0, 2);
            let dateAbbrevation = data.data["dateaccountregistered"]
              .trim()
              .replaceAll("-", "");
            let plateAbbrevation = data.data["plateno"]
              .trim()
              .replaceAll("-", "");

            data.data["driverid"] = (
              nameAbbrevation +
              dateAbbrevation +
              plateAbbrevation
            ).toUpperCase();
            data.data["isAvailable"] = false;
            data.data["isDeleted"] = false;
            data.data["driverpassword"] = $("#pass").val();

            data.data["drivername"] = data.data["drivernamef"].trim();

            logActivity("Save Driver's Info", "accounts");
            //
            const updates = {};
            updates[`/users/drivers/${data.data["driverid"]}`] = data.data;
            console.log({ updates });

            // console.log(updates);
            update(ref(database), updates)
              .then(() => {
                iziToast.success({
                  title: "Successfully Saved",
                  message: `Driver's data has been saved`,
                  icon: "fa fa-save",
                  position: "topRight",
                  timeout: 4000,
                });

                setTimeout(() => {
                  window.location.href = window.location.href;
                }, 1500);
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
      } else {
        iziToast.warning({
          title: "Incomplete",
          message: `Please enter all driver's info`,
          icon: "fa fa-bell-exclamation",
          position: "topRight",
          timeout: 4000,
        });
      }

      // if (!allowNewRow) {
      //   iziToast.warning({
      //     // title: "Invalid Input",
      //     message: `Please complete all inputs to add new one`,
      //     icon: "fa fa-bell-exclamation",
      //     position: "topRight",
      //     timeout: 4000,
      //   });
      // } else {
      // $("#encode-add i").removeClass("fa-check");
      // $("#encode-add i").addClass("fa-plus-circle");
      // $("#encode-add i").css("color", "#212529");

      // iziToast.success({
      //   title: "Success",
      //   message: `Validations complete, saving to database`,
      //   icon: "fa fa-bell-exclamation",
      //   position: "topRight",
      //   timeout: 4000,
      // });
      // isAllowedToAppend = false;

      // console.log(data);
      // // Add additionla data
      // let nameAbbrevation = data["drivername"].trim().substring(0, 2);
      // let dateAbbrevation = data["dateaccountregistered"]
      //   .trim()
      //   .replaceAll("-", "");
      // let plateAbbrevation = data["plateno"].trim().replaceAll("-", "");

      // data["driverid"] = (
      //   nameAbbrevation +
      //   dateAbbrevation +
      //   plateAbbrevation
      // ).toUpperCase();
      // data["isAvailable"] = false;

      // // Save to database
      // const updates = {};
      // updates[`/users/drivers/${data["drivername"]}`] = data;
      // console.log(updates);
      // update(ref(database), updates)
      //   .then(() => {
      //     iziToast.success({
      //       title: "Successfully Saved",
      //       message: `Driver's data has been saved`,
      //       icon: "fa fa-save",
      //       position: "topRight",
      //       timeout: 4000,
      //     });

      //     // setTimeout(() => {
      //     window.location.href = window.location.href;
      //     // }, 1500);
      //   })
      //   .catch((error) => {
      //     // iziToast.destroy();
      //     iziToast.warning({
      //       title: "Save Failed",
      //       message: `${error}`,
      //       icon: "fa fa-bell-exclamation",
      //       position: "topRight",
      //       timeout: 4000,
      //     });
      //     console.error("Update failed:", error);
      //   });
      // }
    });

    $(document).on("click", ".btn-delete-user", (e) => {
      let driverid = $(e.target)
        .parent()
        .parent()
        .find("td")
        .eq(2)
        .attr("driverid");

      iziToast.warning({
        title: "WARNING",
        message: `Are you sure you want to delete this account?`,
        icon: "fa fa-bell-exclamation",
        overlay: true,
        // timeout: 4000,
        // zindex: 999,
        position: "center",
        buttons: [
          [
            "<button><b>YES</b></button>",
            function (instance, toast) {
              instance.hide({ transitionOut: "fadeOut" }, toast, "button");
              console.log(
                $(e.target).parent().parent().find("td").eq(2).attr("driverid")
              );
              // console.log($(e.target).parent().parent());

              logActivity("Delete Driver's Info", "accounts");

              const updates = {};
              updates[`/users/drivers/${driverid}/isDeleted`] = true;
              console.log(updates);

              update(ref(database), updates)
                .then(() => {
                  iziToast.success({
                    title: "Successful",
                    message: `Driver account has been deleted successfully`,
                    icon: "fa fa-save",
                    position: "topRight",
                    timeout: 4000,
                  });
                })
                .catch((error) => {
                  // iziToast.destroy();
                  iziToast.warning({
                    title: "Delete Failed",
                    message: `${error}`,
                    icon: "fa fa-bell-exclamation",
                    position: "topRight",
                    timeout: 4000,
                  });
                  console.error("Update failed:", error);
                });
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

    $(document).on("click", ".btn-update-user", (e) => {
      let driverid = $(e.target)
        .parent()
        .parent()
        .find("td")
        .eq(2)
        .attr("driverid");
      let driverpassword = $(e.target)
        .parent()
        .parent()
        .find("td")
        .eq(2)
        .attr("pass");
      let data = $(e.target).parent().parent().find("td");

      $("#btn-update-driver").attr("driverid", driverid);

      $("#reg-modal-title").text("Update Driver Account");
      $("#btn-update-driver").css("display", "block");
      $("#btn-register-driver").css("display", "none");

      $("#modalAccount").modal("show");

      // First Name
      $("#driver-name-f").val(data.eq(1).text().trim());

      // Email
      $("#driver-email").val(data.eq(2).text().trim());

      // Van Plate Numnber
      $("#plate-no").val(data.eq(0).text().trim());

      // Age
      $("#driver-age").val(data.eq(3).text().trim());

      // Address
      $("#driver-address").val(data.eq(4).text().trim());

      // Contact
      $("#driver-contact").val(data.eq(5).text().trim());

      // Van Model
      $("#van-model").val(data.eq(6).text().trim());

      // Account Registered
      $("#date-account-registered").val(data.eq(7).text().trim());

      // Password
      $("#pass").val(driverpassword);

      // Password2
      $("#pass2").val(driverpassword);

      // iziToast.warning({
      //   title: "WARNING",
      //   message: `Are you sure you want to delete this account?`,
      //   icon: "fa fa-bell-exclamation",
      //   overlay: true,
      //   // timeout: 4000,
      //   // zindex: 999,
      //   position: "center",
      //   buttons: [
      //     [
      //       "<button><b>YES</b></button>",
      //       function (instance, toast) {
      //         instance.hide({ transitionOut: "fadeOut" }, toast, "button");
      //         console.log(
      //           $(e.target).parent().parent().find("td").eq(2).attr("driverid")
      //         );
      //         // console.log($(e.target).parent().parent());

      //         const updates = {};
      //         updates[`/users/drivers/${driverid}/isDeleted`] = true;
      //         console.log(updates);

      //         update(ref(database), updates)
      //           .then(() => {
      //             iziToast.success({
      //               title: "Successful",
      //               message: `Driver account has been deleted successfully`,
      //               icon: "fa fa-save",
      //               position: "topRight",
      //               timeout: 4000,
      //             });

      //           })
      //           .catch((error) => {
      //             // iziToast.destroy();
      //             iziToast.warning({
      //               title: "Delete Failed",
      //               message: `${error}`,
      //               icon: "fa fa-bell-exclamation",
      //               position: "topRight",
      //               timeout: 4000,
      //             });
      //             console.error("Update failed:", error);
      //           });
      //         ;
      //       },
      //       true,
      //     ],
      //     [
      //       "<button>NO</button>",
      //       function (instance, toast) {
      //         instance.hide({ transitionOut: "fadeOut" }, toast, "button");
      //       },
      //     ],
      //   ],
      //   onClosing: function (instance, toast, closedBy) {
      //     console.info("Closing | closedBy: " + closedBy);
      //   },
      //   onClosed: function (instance, toast, closedBy) {
      //     console.info("Closed | closedBy: " + closedBy);
      //   },
      // });
    });

    $("#btn-update-driver").on("click", (e) => {
      // Done encoding, verify content for non-empty values
      let data = validateEncode();
      let driverid = $(e.target).attr("driverid");

      console.log(driverid);

      if (data.isCompleted) {
        // Check password if same first
        if ($("#pass").val() != $("#pass2").val()) {
          iziToast.info({
            title: "Password mismatch",
            message: `Password do not match`,
            icon: "fa fa-bell-exclamation",
            position: "topRight",
            timeout: 4000,
          });
        } else {
          let ret = validatePassword($("#pass").val());

          if (!ret.isValid) {
            iziToast.info({
              title: "Password Incorrect",
              message: `${ret.message}`,
              icon: "fa fa-bell-exclamation",
              position: "topRight",
              timeout: 4000,
            });
          } else {
            // Add extra details
            let nameAbbrevation = data.data["drivernamef"]
              .trim()
              .substring(0, 2);
            let dateAbbrevation = data.data["dateaccountregistered"]
              .trim()
              .replaceAll("-", "");
            let plateAbbrevation = data.data["plateno"]
              .trim()
              .replaceAll("-", "");

            data.data["driverid"] = driverid.trim();
            data.data["isAvailable"] = false;
            data.data["isDeleted"] = false;
            data.data["driverpassword"] = $("#pass").val().trim();

            data.data["drivername"] = data.data["drivernamef"].trim();

            const updates = {};
            updates[`/users/drivers/${driverid.trim()}`] = data.data;
            console.log({ updates });

            iziToast.warning({
              title: "WARNING",
              message: `Are you sure you want to update this account?`,
              icon: "fa fa-bell-exclamation",
              overlay: true,
              // timeout: 4000,
              // zindex: 999,
              position: "center",
              buttons: [
                [
                  "<button><b>YES</b></button>",
                  function (instance, toast) {
                    instance.hide(
                      { transitionOut: "fadeOut" },
                      toast,
                      "button"
                    );

                    logActivity("Update Driver's Account", "accounts");

                    // console.log(updates);
                    update(ref(database), updates)
                      .then(() => {
                        iziToast.success({
                          title: "Successfully Updated",
                          message: `Driver's data has been updated`,
                          icon: "fa fa-save",
                          position: "topRight",
                          timeout: 4000,
                        });

                        setTimeout(() => {
                          window.location.href = window.location.href;
                        }, 1500);
                      })
                      .catch((error) => {
                        // iziToast.destroy();
                        iziToast.warning({
                          title: "Update Failed",
                          message: `${error}`,
                          icon: "fa fa-bell-exclamation",
                          position: "topRight",
                          timeout: 4000,
                        });
                        console.error("Update failed:", error);
                      });
                  },
                  true,
                ],
                [
                  "<button>NO</button>",
                  function (instance, toast) {
                    instance.hide(
                      { transitionOut: "fadeOut" },
                      toast,
                      "button"
                    );
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
          }
        }
      } else {
        iziToast.warning({
          title: "Incomplete",
          message: `Please enter all driver's info`,
          icon: "fa fa-bell-exclamation",
          position: "topRight",
          timeout: 4000,
        });
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

            lists += `<td>${d[driver]?.schedule?.day_available ?? ""}</td>`;

            lists += `<td>${d[driver]?.schedule?.start ?? ""}</td>`;

            lists += `<td>${d[driver]?.schedule?.end ?? ""}</td>`;

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
        let drivername = $(e.target).parent().parent().find("td").eq(0).text();
        console.log(drivername);

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

              logActivity(
                `Update schedule of ${drivername} to ${day}`,
                "schedule"
              );
            })
            .catch((error) => {
              iziToast.warning({
                title: "Save Failed",
                message: `${error}`,
                icon: "fa fa-bell-exclamation",
                position: "topRight",
                timeout: 4000,
              });

              logActivity(
                `Failed update of schedule of ${drivername} to ${day}`,
                "schedule"
              );
            });
        }
      });

      // List of Schedule - Time Start
      $("#list-of-schedule").on("click", ".save-start-schedule", (e) => {
        let time = $(e.target).parent().find("input").val().trim();
        let driverid = $(e.target).parent().parent().attr("driverid");
        let drivername = $(e.target).parent().parent().find("td").eq(0).text();
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

              logActivity(
                `Update start time of ${drivername} to ${time}`,
                "schedule"
              );
            })
            .catch((error) => {
              iziToast.warning({
                title: "Save Failed",
                message: `${error}`,
                icon: "fa fa-bell-exclamation",
                position: "topRight",
                timeout: 4000,
              });

              logActivity(
                `Failed to update start time of ${drivername} to ${time}`,
                "schedule"
              );
            });
        }
      });

      // List of Schedule - Time End
      $("#list-of-schedule").on("click", ".save-end-schedule", (e) => {
        let time = $(e.target).parent().find("input").val().trim();
        let driverid = $(e.target).parent().parent().attr("driverid");
        let drivername = $(e.target).parent().parent().find("td").eq(0).text();
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

              logActivity(
                `Update end time of ${drivername} to ${time}`,
                "schedule"
              );
            })
            .catch((error) => {
              iziToast.warning({
                title: "Save Failed",
                message: `${error}`,
                icon: "fa fa-bell-exclamation",
                position: "topRight",
                timeout: 4000,
              });

              logActivity(
                `Failed to update end time of ${drivername} to ${time}`,
                "schedule"
              );
            });
        }
      });
    }
  });

  function validateEncode() {
    let encodeAdd = $("#page-register");
    let data = {};
    let isCompleted = true;
    // let isPassSame = false;

    encodeAdd.find("input").each((i, v) => {
      // console.log(i, v);
      if ($(v).val() != "") {
        let id = $(v).attr("id").replaceAll("-", "");
        data[id] = $(v).val();
      } else {
        isCompleted = false;
      }
    });

    return { data, isCompleted: isCompleted };
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

            logActivity("Admin Logout", "dashboard");
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

  window.logActivity = (act, page) => {
    const updates = {};
    let data = {};

    data = {
      activity: act,
      page: page,
      uid: sessionStorage.getItem("uid"),
    };

    updates[`/activity/admin/${new Date().getTime()}/`] = data;

    update(ref(database), updates)
      .then(() => {
        console.log("Act Success");
      })
      .catch((error) => {
        console.log("Act Error");
      });
  };
  // }
});
