let isListeningForLocation = false;
let isPickupListeningForLocation = false;
let isDropListeningForLocation = false;
let allowReadingCoordinates = false;
let isPickingSchedule = false;
let isReservation = false;
let isStartNavigation = false;
let pickingSchedule = "";
let pickingDriverID = "";
let pickingDriverName = "";
let isManualPickup = false;
let locationDetails = {
  coordinates: {
    lat: 0.0,
    lng: 0.0,
  },
};

let navigationData = [];

let inputFocus = {
  currentFocused: "",
};

var map; // Declare the map variable globally
var marker; // Declare the marker variable globally

let waypoints = [
  L.latLng(11.6837159, 122.3571831),
  // L.latLng(11.6794671, 122.3640332),
];

function initializeMap() {
  console.log("Initializing Map...");
  // Initialize the map only once
  // map = L.map("map").setView([0, 0], 3); // Set initial view (default center)
  // let boundPoint = waypoints.map((point) => {
  //   let newLat = point.lat;
  //   let newLng = point.lng;
  //   return L.latLng(newLat, newLng);
  // });

  // let bounds = L.latLngBounds(boundPoint[0], boundPoint[1]);
  let bounds = boundPoint(waypoints); //L.latLngBounds(boundPoint[0], boundPoint[1]);

  map = L.map("map", {
    // drawControl: true,
    // maxBounds: bounds,
    minZoom: 8, // zoom out -> the small the greater the zoom out, default useing 15
    maxZoom: 18,
    center: [0, 0],
    trackResize: 5,
    maxBoundsViscosity: 1.0, // Optional: Makes the bounds more restrictive (0 to 1)
    zoomControl: true,
    maxNativeZoom: 28,
    closePopupOnClick: false,
    // zoom: 19,
    // rotate: true,
  });

  var streetsLayer = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
    }
  );

  console.log(waypoints);

  // var control = L.Routing.control({
  //   waypoints: waypoints,
  //   routeWhileDragging: false,
  //   // zoom: {
  //   //   position: 'bottomleft'
  //   // }
  // }).addTo(map);

  // map.zoomControl.setPosition('bottomright');
  map.zoomControl.setPosition("topright");

  // Initialize geocoder control
  // var geocoder = L.Control.geocoder({
  //   defaultMarkGeocode: false,
  // })
  //   .on("markgeocode", function (e) {
  //     var latlng = e.geocode.center;
  //     console.log("Test Here", e);
  //     control.setWaypoints([
  //       // L.latLng(51.5, -0.09),  // Starting point
  //       waypoints[0],
  //       latlng, // End point from geocoder
  //     ]);

  //     let w = [
  //       waypoints[0],
  //       latlng,
  //       // L.latLng(11.6794671, 122.3640332),
  //     ];
  //     // w[0]["lat"] = waypoints[0];
  //     // w[0]["lng"] = latlng;
  //     // console.log(w);
  //     // console.log(waypoints[0], latlng, w[0]);

  //     // map.setView(latlng, 13);
  //     // map.options.minZoom = 8;
  //     // map.options.maxBounds = boundPoint(waypoints);

  //     fitWaypointsOnSearch(w);
  //     // console.log(w);
  //   })
  //   .addTo(map);

  // control.on("routesfound", function (e) {
  //   const routes = e.routes;
  //   const totalDistance = routes[0].summary.totalDistance; // Distance in meters
  //   // console.log(`Total Distance: ${totalDistance} meters`);
  //   $("#distance").text(`Total Distance: ${totalDistance} meters`);

  //   // Optionally, display the distance on the map or in a popup
  //   L.popup()
  //     .setLatLng(routes[0].waypoints[0].latLng) // Display near the starting point
  //     .setContent(`Total Distance: ${(totalDistance / 1000).toFixed(2)} km`)
  //     .openOn(map);
  // });

  // L.DomEvent.on(routingControl, "routesfound", function (e) {
  //   const routes = e.routes; // Get the routes
  //   const routePoints = routes[0].coordinates; // Get the coordinates of the first route

  //   // Now calculate the bounds
  //   const bounds = calculateBounds(routePoints);
  //   console.log(bounds);
  // });

  $(".leaflet-top.leaflet-right").append(`
    <div class="leaflet-control-geocoder leaflet-bar leaflet-control" id="find-location">
      <button
        class="leaflet-control-geocoder-icon"
        type="button"
        aria-label="Initiate a new search"
        style="outline-style: none; background-image: url('assets/images/location.svg')"
      >
        &nbsp;
      </button>
      <div class="leaflet-control-geocoder-form">
        <input class="" type="text" placeholder="Search..." />
      </div>
      <div class="leaflet-control-geocoder-form-no-error">Nothing found.</div>
      <ul
        class="leaflet-control-geocoder-alternatives leaflet-control-geocoder-alternatives-minimized"
      ></ul>
    </div>
    `);

  // Add a click event listener to the map
  map.on("click", function (e) {
    // Get latitude and longitude
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    // Print latitude and longitude to the console
    console.log(`Latitude: ${lat}, Longitude: ${lng}`);
  });

  $("#find-location").on("click", () => {
    $("#overlayed-text").text("Retrieving Location...");
    // Allow user to read when the request is sent quickly
    $(".overlay").fadeIn(500);
    let counter = 0;
    let json = { request_current_location: true };

    sendData(json);
    isListeningForLocation = true;

    let loading = setInterval(() => {
      counter++;

      if (counter % 2 == 0) {
        $(".overlay").fadeIn(500);
      } else {
        $(".overlay").fadeOut(500);
      }

      // When response received from Android
      // disabled loading overlay
      if (!isListeningForLocation) {
        clearInterval(loading);

        let retLoc = JSON.parse($("#response-listener").text());
        console.log(retLoc.lat);
        // waypoints = setWayPointsNewValue(+retLoc.lat, +retLoc.lng);
        let wp = L.latLng(+retLoc.lat, +retLoc.lng); // New values
        fitWaypointsNewValue(wp);
      }
    }, 600);
  });

  streetsLayer.addTo(map);

  fitWaypoints();

  // MapHelper.removeRoutingControl();
}

function fitWaypointsNewValue(wp) {
  var bounds = L.latLngBounds([wp], [wp]);
  // map.fitBounds(bounds, { padding: [50, 50] }); // Adjust padding as needed
  // map.fitBounds(bounds); // Adjust padding as needed
  map.fitBounds(bounds, {
    // padding: [50, 50],       // Optional padding
    animate: true, // Enable animation
    duration: 1.5, // Duration of the animation in seconds (default is 0.25)
  });

  map.setZoom(16); // Ensure zoom doesn't go beyond 15
}

// function setWayPointsNewValue(latitude, longitude){
//   return waypoints[0] = L.latLng(latitude, longitude); // New values
// }

function setLatLng(latitude, longitude) {
  let latlngFromAndroid = { lat: latitude, lng: longitude };
  let latlngFromAndroidStr = JSON.stringify(latlngFromAndroid);

  $("#response-listener").text(latlngFromAndroidStr);
}

function setUserData(email, name, uid, userType) {
  // $("#response-listener").text(latlngFromAndroidStr);
  sessionStorage.setItem("userEmail", email);
  sessionStorage.setItem("userName", name);
  sessionStorage.setItem("userUID", uid);
  sessionStorage.setItem("userType", userType);

  // console.log("TESTINGSETTINGS", email, name, uid);

  // iziToast.success({
  //   title: "Success",
  //   message: `Testing here ${email}`,
  //   icon: "fa fa-map-pin",
  //   position: "topRight",
  //   timeout: 4000,
  // });
}

function showReservation() {
  // sessionStorage.setItem("userEmail", email);
  // sessionStorage.setItem("userName", name);
  // sessionStorage.setItem("userUID", uid);
  // sessionStorage.setItem("userType", userType);

  console.log("showReservation", "Command received");
  hideChooseDestination();
  hideCenterMarker();
  hideReturnToHailing();
  hideHailingOverlay();

  showTripSchedule();
  isReservation = true;

  // // $("#calendar").ready(() => {
  // setTimeout(() => {
  //   let calendarEl = document.getElementById("calendar");
  //   let today = new Date();

  //   let calendar = new FullCalendar.Calendar(calendarEl, {
  //     selectable: true,
  //     headerToolbar: {
  //       left: "prevYear,prev,next,nextYear today",
  //       center: "title",
  //       right: "dayGridMonth,dayGridWeek,dayGridDay",
  //     },
  //     select: function (startDate, endDate, jsEvent, view) {},
  //     dateClick: function (info) {},
  //     validRange: {
  //       start: new Date().toISOString().split("T")[0], // Disable dates before today
  //     },
  //     // Custom double-click handling
  //     // height: "calc(100vh - 200px)",
  //     // height: "500px",
  //     height: "auto",
  //     contentHeight: "auto",
  //     aspectRatio: 1.35,
  //     width: "100%",
  //     initialDate: today, //'2023-01-12',
  //     navLinks: true, // can click day/week names to navigate views
  //     editable: true,
  //     dayMaxEvents: true, // allow "more" link when too many events
  //     // events: events,
  //     themeSystem: "lumen",
  //   });

  //   calendar.render();
  // }, 1000);
}

function startNavigation() {
  console.log("startNavigation", "Command received");
  hideChooseDestination();
  hideCenterMarker();
  hideReturnToHailing();
  hideHailingOverlay();

  hideTripSchedule();
  showStartNavigation();
  isStartNavigation = true;

  // Load passenger data
  // $("#tbl-navigation")
  let driverEmail = sessionStorage.getItem("userEmail");
  let driverUsername = sessionStorage.getItem("userName");
  let driverUID = sessionStorage.getItem("userUID");
  let driverUserType = sessionStorage.getItem("userType");

  let onlineDriver = getDriverReference();
  let onValue = getOnValue();
  let ref = getRef();
  let update = getUpdate();
  let database = getDatabase();

  let dlist = `<div>`;

  onValue(onlineDriver, (snapshot) => {
    let data = snapshot.val();
    let inList = [];

    console.log(JSON.stringify(data));

    if (!data) {
      $("#data-navigation").html(`
        <div>No current bookings</div><br>
        <div>
        <button class="btn-start" disabled style='background: gray'>
          Start
        </button>
        </div>
          `);
    }

    Object.entries(data).forEach(([uid, d]) => {
      if (driverUID == uid) {
        console.log("data2", uid, inList.includes(uid));
        let maxTs = 0;
        let strMaxTs = "";
        // Object.entries(d).forEach(([ts, tsData]) => {
        //   if (!isNaN(parseInt(ts))) {
        //     if (parseInt(ts) > maxTs) {
        //       maxTs = parseInt(ts);
        //       strMaxTs = ts;
        //     }
        //   }
        // // });
        // let processedData = {};
        // // let processedData = [];

        // Object.keys(d).forEach((timestamp) => {
        //   const key = Object.keys(d[timestamp])[0];

        //   if (key != undefined) {
        //     const email = key;
        //     const customerData = d[timestamp][key];
        //     console.log("CustomerData", email, timestamp);

        //     // if (processedData[email] != email) {
        //       // processedData[email] = [];
        //       processedData[email] = {
        //         timestamp: Number(timestamp),
        //         details: customerData,
        //       };

        //       // console.log("processedData", email);
        //     // }

        //     // Add the timestamp and details to the email's group
        //     // processedData .push({
        //     //   timestamp: Number(timestamp),
        //     //   details: customerData,
        //     // });

        //   }
        // });

        // console.log("processedData:", Object.keys(processedData).length);

        // Object.keys(processedData).forEach(email => {
        //   // Find the maximum timestamp for the email
        //   const maxTimestamp = Math.max(...Object.entries(processedData[email]).map((entry) => {
        //     console.log("entry.timestamp", entry);
        //     return entry.timestamp
        //     }
        //   ));
        //   // maxTimestamps[email] = maxTimestamp;

        //   console.log("email", email, maxTimestamp);
        // });

        // // Step 2: Find the email with the largest timestamp
        // const emailWithLargestTimestamp = Object.keys(processedData).reduce((acc, email) => {
        //   const maxTimestamp = Math.max(...processedData[email].map(entry => entry.timestamp));
        //   return maxTimestamp > acc.largestTimestamp ? { email, largestTimestamp: maxTimestamp } : acc;
        // }, { email: null, largestTimestamp: -Infinity });

        // console.log("Processed Data by Email:", processedData);
        // console.log("Email with Largest Timestamp:", emailWithLargestTimestamp);

        const maxTimestamps = Object.values(data).reduce(
          (result, timestamps) => {
            Object.entries(timestamps).forEach(([timestamp, emailData]) => {
              const email = Object.keys(emailData)[0]; // Get the email key
              const numericTimestamp = Number(timestamp);
              if (!result[email] || numericTimestamp > result[email]) {
                result[email] = numericTimestamp;
              }
            });
            return result;
          },
          {}
        );

        // console.log("maxTimestamp", maxTimestamps[sanitizeText(userData.customerID)]);

        // for (let d in maxTimestamps) {
        //   console.log("maxTimestamps[d]", maxTimestamps[d]);
        // }

        Object.entries(d).forEach(([ts, tsData]) => {
          // if (!isNaN(parseInt(ts)) && ts == strMaxTs) {
          if (!isNaN(parseInt(ts))) {
            Object.entries(tsData).forEach(([user, userData]) => {
              console.log("data---", userData.customerID, ts, user);

              for (let d in maxTimestamps) {
                if (!isNaN(parseInt(maxTimestamps[d]))) {
                  if (parseInt(ts) == parseInt(maxTimestamps[d])) {
                    // dlist.push({
                    //   customerName: userData.customerName,
                    //   pickup: userData.pickup_location,
                    //   destination: userData.dropoff_location,
                    //   distance: userData.totalDistance
                    // });
                    let status = userData?.status ?? "";
                    console.log(
                      "@@maxTimestamps[d]",
                      maxTimestamps[d],
                      " status:",
                      status
                    );

                    // if (!inList.includes(uid) && status == "confirmed") {
                    if (status == "confirmed") {
                      inList.push(uid);

                      navigationData.push({
                        timestamp: ts,
                        customerName: userData.customerName,
                        customerID: userData.customerID,
                        pickup: userData.pickup_location,
                        destination: userData.dropoff_location,
                        distance: userData.totalDistance,
                        dropoff_coordinates_lat:
                          userData.dropoff_coordinates_lat,
                        dropoff_coordinates_lng:
                          userData.dropoff_coordinates_lng,
                        pickup_coordinates_lat: userData.pickup_coordinates_lat,
                        pickup_coordinates_lng: userData.pickup_coordinates_lng,
                      });

                      dlist += `
                <div class="col-12" style="text-align: left; border-left: solid 3px gray; padding-left: 5px">
                  <div>
                    <b>Customer Name:</b> ${userData.customerName}
                  </div>

                  <div>
                    <b>Pickup:</b> ${userData.pickup_location}
                  </div>

                  <div>
                    <b>Destination:</b> ${userData.dropoff_location}
                  </div>

                  <div>
                    <b>Distance:</b> ${userData.totalDistance}km
                  </div>
                </div>
                <br>
              `;
                    }
                  }
                }
              }
            });
          }
        });
      }
    });

    if (inList.length == 0) {
      dlist += `
        <div>No current bookings</div><br>
      `;
    }

    dlist += `
    <div>
      <button class="btn-start" ${
        inList.length > 0 ? "" : "disabled style='background: gray'"
      }>
        Start
      </button>
    </div>
    </div>`;

    $("#data-navigation").html(dlist);
    dlist = "";
    inList = [];

    // $("#tbl-navigation").DataTable({
    //   data: dlist,
    //   columns: [
    //     { data: "customerName" },
    //     { data: "pickup" },
    //     { data: "destination" },
    //     { data: "distance" },
    //   ],
    //   // searching: true,
    //   responsive: true,
    //   // rowReorder: {
    //   //   selector: 'td:nth-child(2)'
    //   // },
    //   // columnDefs: [
    //   //   { visible: false,
    //   //     targets: [0] }
    //   // ],
    //   ordering: true,
    //   // processing: false,
    //   // serverSide: false,
    //   destroy: true,
    //   info: false,
    //   language: {
    //     emptyTable: "No entries to show",
    //     infoEmpty: "No entries to show",
    //   },
    // });
  });
}

$(document).ready(() => {
  setTimeout(() => {
    let calendarEl = document.getElementById("calendar");
    let today = new Date();

    console.log("Test");

    // let onValue = getOnValue();
    // let ref = getRef();
    // let update = getUpdate();
    // let database = getDatabase();
    // let totalDistance = sessionStorage.getItem("totalDistance");
    // let dbDriverName = "";

    getUserDetails().then((d) => {
      console.log(d);
      let events = [];

      //     title: "My repeating event2",
      //     daysOfWeek: ["3", "5"], // these recurrent events move separately
      //     startTime: "09:00:00",
      //     endTime: "12:30:00",
      //     color: "green",

      Object.entries(d).forEach(([id, value]) => {
        Object.entries(value).forEach(([value2, data]) => {
          if (value2 == "schedule") {
            let days = data.day_available.toUpperCase();
            days = days.replaceAll("M", "1");
            days = days.replaceAll("SAT", "6");
            days = days.replaceAll("TH", "4");
            days = days.replaceAll("T", "2");
            days = days.replaceAll("W", "3");
            days = days.replaceAll("F", "5");
            days = days.replaceAll("SUN", "0");
            let splitDays = days.split(",");
            console.log(days);

            events.push({
              title: "Schedule: " + value.drivername,
              // title: "Schedule: " + value.drivername +  ` (${id})`,
              daysOfWeek: splitDays,
              startTime: data.start,
              endTime: data.end,
              color: "green",
              extendedProps: {
                driverid: id,
                drivername: value.drivername,
              },
            });
          }
        });
      });

      let calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridDay", // Options: 'timeGridDay' or 'dayGridDay'
        selectable: true,
        headerToolbar: {
          left: "prevYear,prev,next,nextYear today",
          center: "title",
          right: "dayGridMonth,dayGridWeek,dayGridDay",
        },
        select: function (startDate, endDate, jsEvent, view) {
          console.log(startDate, endDate, jsEvent, view);
          // Check if any event exists on the selected date
        },
        dateClick: function (info) {
          // handleDoubleClick(info);
          console.log(info);

          let dateSelected = info.start;
          let eventsOnDate = calendar.getEvents().filter((event) => {
            return event.start <= dateSelected && dateSelected < event.end;
          });

          console.log(eventsOnDate);

          if (eventsOnDate.length > 0) {
            // Show event details for the first event found
            displayEventDetails(eventsOnDate[0]);
          } else {
            // No events, display a message
            // document.getElementById("eventDetails").innerHTML =
            //   "No events on this date.";
            // document.getElementById("eventDetails").style.display = "block";
          }
        },
        eventClick: function (info) {
          console.log("Event Click", info);

          // Stop Trip Schedule overlay from being shown
          isReservation = false;

          info.jsEvent.preventDefault();

          // Log the event details to the console
          // console.log('Event clicked:', info.event);
          console.log("Title:", info.event.title);
          console.log("Start:", info.event.start.toISOString());
          console.log("Time:", info.event.start);
          console.log("driverid:", info.event.extendedProps.driverid);

          let startTime = new Date(info.event.start);
          let today = new Date();

          if (today.getTime() < startTime.getTime()) {
            pickingSchedule = formatTimestampToDateAll(startTime.getTime());
            pickingDriverID = info.event.extendedProps.driverid;
            pickingDriverName = info.event.extendedProps.drivername;

            iziToast.question({
              timeout: false,
              close: false,
              overlay: true,
              displayMode: "once",
              id: "question",
              zindex: 10999,
              title: "Schedule Selection",
              message: "Would you like to set this schedule for this driver?",
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

                    hideTripSchedule();
                    showHailingOverlay();
                    isPickingSchedule = true;

                    iziToast.info({
                      timeout: false,
                      title: "Location Setup",
                      message: `Please set Pickup and Drop-off points for the van reservation`,
                      icon: "fa fa-map-pin",
                      position: "topCenter",
                      timeout: 4000,
                    });

                    $(".overlay-search-pickup .title").text(
                      $(".overlay-search-pickup .title").text() +
                        " (Reservation)"
                    );
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
          } else {
            iziToast.warning({
              timeout: false,
              // close: false,
              overlay: true,
              // displayMode: "once",
              title: "Unable to set schedule",
              message: `You selection has been denied due to outside of valid reservation time`,
              icon: "fa fa-map-pin",
              position: "center",
              timeout: 4000,
            });
          }
        },
        validRange: {
          start: new Date().toISOString().split("T")[0], // Disable dates before today
        },
        // Custom double-click handling
        // height: "calc(100vh - 200px)",
        // height: "500px",
        // height: "auto",
        // contentHeight: "auto",
        contentHeight: 500,
        // aspectRatio: 1.35,
        width: "100%",
        initialDate: today, //'2023-01-12',
        navLinks: true, // can click day/week names to navigate views
        editable: true,
        dayMaxEvents: true, // allow "more" link when too many events
        // plugins: [ 'rrule' ], // Include the RRule plugin
        // events: events,
        events: events,
        // [
        //   {
        //     // title: "My repeating event",
        //     // start: "10:00", // a start time (10am in this example)
        //     // end: "14:00", // an end time (2pm in this example)
        //     // dow: [1, 4], // Repeat monday and thursday
        //   },
        //   {
        //     title: "My repeating event",
        //     daysOfWeek: ["3", "5"], // these recurrent events move separately
        //     startTime: "11:00:00",
        //     endTime: "11:30:00",
        //     color: "red",
        //   },
        //   {
        //     title: "My repeating event2",
        //     daysOfWeek: ["3", "5"], // these recurrent events move separately
        //     startTime: "09:00:00",
        //     endTime: "12:30:00",
        //     color: "green",
        //   },
        // ],
        themeSystem: "lumen",
      });

      calendar.render();

      var lastClickTime = 0;
      function handleDoubleClick(info) {
        var now = new Date().getTime();
        var timeSince = now - lastClickTime;

        if (timeSince < 300 && timeSince > 0) {
          // console.log("Day double-clicked: " + info.dateStr);
          // AddEvent(info.dateStr);
        } else {
          console.log("Single Click");
        }

        lastClickTime = now;
      }

      function AddEvent(date) {
        console.log("Add Event");

        let html = `
      <form>
        <div class="form-group row">
          <label for="events-count" class="col-sm-3 col-form-label"
            >Event Name</label>
          <div class="col-sm-9">
            <input
              type="text"
              id="swal-name-input"
              class="form-control"
              placeholder="Enter Event Name"
              autocomplete="off"
            />
          </div>
        </div>
        <!--<div class="form-group row">
          <label for="events-count" class="col-sm-3 col-form-label"
            >Event Date</label>
          <div class="col-sm-9">
            <input
              type="date"
              class="form-control"
              id="swal-date-input"
              placeholder="Select Date"
              autocomplete="off"
            />
          </div>
          </div>
          -->
      <form>
      `;

        // Swal.fire({
        //   title: "Add Event",
        //   icon: "info",
        //   html: html,
        //   confirmButtonText: "Add",
        //   timerProgressBar: true,
        //   didOpen: () => {},
        //   willClose: (e) => {},
        //   confirmButtonColor: "#5995fd",
        //   showCancelButton: false,
        //   width: "60%",
        // }).then((result) => {
        //   if (result.isConfirmed) {
        //     let selectedDate = date;
        //     let enteredName = $("#swal-name-input").val();
        //     let isEventExisting = false;

        //     for (let item in data) {
        //       if (data[item].title == enteredName) {
        //         isEventExisting = true;
        //         break;
        //       }
        //     }

        //     if (enteredName == "") {
        //       iziToast.warning({
        //         title: "Input is empty",
        //         message: `Please enter event name`,
        //         icon: "fa fa-exclamation",
        //       });
        //     } else if (isEventExisting) {
        //       iziToast.warning({
        //         title: "Event already exist",
        //         message: `Please try other event name`,
        //         icon: "fa fa-exclamation",
        //       });
        //     } else {
        //       data[`${GetDate(0)}_${GetDate(2)}`] = {
        //         start: selectedDate,
        //         title: enteredName,
        //       };

        //       calendar.addEvent({
        //         title: enteredName,
        //         start: selectedDate,
        //       });

        //       const eventsResult = _ref("events");
        //       update(eventsResult, data);

        //       iziToast.success({
        //         title: "Success",
        //         message: `Event "${enteredName}" successfully added`,
        //         icon: "fa fa-check",
        //       });

        //       calendar.render();

        //       // RenderMainCalendar(data, data);
        //     }
        //   }
        // });

        // $(".swal2-html-container").css("overflow", "hidden");
      }
      // onValue(onlineDriver, (snapshot) => {
      //   const data = snapshot.val();
      //   let listOnlineDriver = [];
      //   console.log(data);

      //   // for (let driver in data) {
      //   //   let detail = data[driver];

      //   //   if (detail.isAvailable) {
      //   //     let isConfirmed =
      //   //       detail.status == undefined ? "" : detail.status;
      //   //     listOnlineDriver.push({
      //   //       // driverName: detail.drivername,
      //   //       driverID: driver,
      //   //       status: isConfirmed,
      //   //     });
      //   //   }
      //   // }

      // });
    });
  }, 1000);

  // Start engines
  $(document).on("click", ".btn-start", (e) => {
    console.log("Start Button clicked");

    hideStartNavigation();

    let lat = sessionStorage.getItem("lat");
    let lng = sessionStorage.getItem("lon");

    // let json = { request_current_location: true };
    let json = { start_navigation: true };
    sendData(json);

    // const marker = L.marker([lat, lng]).addTo(map);

    // // Bind a popup to the marker
    // marker.bindPopup(
    //   "<b><span style='font-size: 20px'>🚗</span> You are here</b>"
    // );

    // // Optionally, open the popup immediately
    // marker.openPopup();

    //
    console.log("navigationData", navigationData);

    // const startPoint = {
    //   lat: +$("#input-pickup-location").attr("lat"),
    //   lng: +$("#input-pickup-location").attr("lng"),
    // };
    // const endPoint = {
    //   lat: +$("#input-dropoff-location").attr("lat"),
    //   lng: +$("#input-dropoff-location").attr("lng"),
    // };

    // let wp = [];
    // let wp = [
    //   L.latlng(11.74191596046379, 122.27159854764896),
    //   L.latlng(11.52065294621054, 122.45846738609085)
    // ];

    // dropoff_coordinates_lat: userData.dropoff_coordinates_lat,
    // dropoff_coordinates_lng: userData.dropoff_coordinates_lng,
    // pickup_coordinates_lat: userData.pickup_coordinates_lat,
    // pickup_coordinates_lng: userData.pickup_coordinates_lng

    // // Origin of driver
    // wp.push(
    //   L.latLng(lat, lng)
    // );

    // for(let d in navigationData){
    //   // console.log(navigationData[d].customerName);
    //   wp.push(
    //     L.latLng(navigationData[d].dropoff_coordinates_lat, navigationData[d].dropoff_coordinates_lng)
    //   );

    //   wp.push(
    //     L.latLng(navigationData[d].pickup_coordinates_lat, navigationData[d].pickup_coordinates_lng)
    //   );
    // }

    // console.log("Testing ABC", JSON.stringify( wp.push(
    //   L.latLng(lat, lng)
    // )));

    // let allowOnce = true;
    // let allowOnce2 = true;
    // let counter = 0;

    // let loc = [
    //   { lat: 11.709711088653284, lng: 122.30137612016853 },
    //   { lat: 11.706254444767735, lng: 122.3087008912548 },
    //   { lat: 11.70573340100923, lng: 122.32917074057924 },
    //   { lat: 11.714724048375777, lng: 122.35247720076161 },
    //   { lat: 11.710837825352822, lng: 122.36196983724764 },
    // ];

    // let t = setInterval(() => {
    // showMultRoute(loc[counter].lat, loc[counter].lng);

    //   if (loc.length == counter - 1) {
    //     clearInterval(t);
    //   }

    //   counter++;
    // }, 1000);
    // showRoute(11.74191596046379, 122.27159854764896);
  });
});

function setIntervalLocation(latitude, longitude) {
  console.log("setIntervalLocation()");
  showMultRoute(+latitude, +longitude);
}

function receiveLocation2(latitude, longitude, inBrowserCall = false) {
  // document.getElementById("error").innerHTML =
  //   "Latitude: " +
  //   latitude +
  //   ", Longitude: " +
  //   longitude +
  //   " Random:" +
  //   Math.random();
  sessionStorage.setItem("lat", latitude);
  sessionStorage.setItem("lon", longitude);

  waypoints[0] = L.latLng(latitude, longitude); // New values

  if (!map) {
    initializeMap(); // Initialize the map if it hasn't been done yet
  }

  // map = L.map("map", {
  //   drawControl: false,
  //   minZoom: 4,
  //   maxZoom: 3,
  //   center: [0, 0],
  //   zoom: 19,
  //   rotate: true,
  // });
  // Update the map view
  // map.setView([latitude, longitude], 3);

  // Function to add route with border effect
  function addRouteWithBorder(route) {
    // Add border polyline
    L.polyline(route, {
      color: "#0f26f5", // Border color
      weight: 8, // Border width
    }).addTo(map);

    // Add main route polyline
    // L.polyline(route, {
    //   color: "#527dff", // Path color
    //   weight: 4, // Path width
    // }).addTo(map);
  }

  function hasRoutingControl(map) {
    var hasControl = false;
    map.eachLayer(function (layer) {
      if (layer instanceof L.Routing.Control) {
        hasControl = true;
      }
    });
    return hasControl;
  }

  if (inBrowserCall) {
    console.log("In Browser Call");

    let control = L.Routing.control({
      waypoints: waypoints,
      // createMarker: function () {
      //   return null;
      // }, // Disable markers
      draggableWaypoints: false, // Disable dragging
      addWaypoints: false, // Prevent adding waypoints
      routeWhileDragging: false,
      lineOptions: {
        styles: [{ color: "#0f53ff", weight: 6 }],
      },
      show: false,
    })
      .on("routesfound", function (e) {
        var route = e.routes[0].coordinates;
        addRouteWithBorder(route);
        fitWaypoints();
      })
      .addTo(map);
  }

  // Define a custom icon
  var customIcon = L.icon({
    iconUrl: "assets/images/napat_tours_bus_only.png", // Path to your custom icon image
    iconSize: [38, 95], // Size of the icon [width, height]
    iconAnchor: [22, 94], // Point of the icon which will correspond to marker's location
    popupAnchor: [-3, -76], // Point from which the popup should open relative to the iconAnchor
    // shadowUrl: 'path_to_your_icon_shadow.png', // Optional shadow image
    shadowSize: [50, 64], // Size of the shadow [width, height]
    shadowAnchor: [4, 62], // Point of the shadow relative to the marker's location
  });

  // Update the marker position
  // if (marker) {
  //   marker.setLatLng([latitude, longitude]);
  // } else {
  //   marker = L.marker(
  //     [latitude, longitude] // { icon: customIcon }
  //   )
  //     .addTo(map)
  //     .bindPopup("Starting <b>Point</b>")
  //     .openPopup();
  // }
}

// receiveLocation(14.370958441729798, 120.93901384235421);
// receiveLocation(11.380985878331284, 122.06387884559439);
// receiveLocation2(11.6837159, 122.3571831, true);
initializeMap();

function fitWaypoints() {
  var bounds = L.latLngBounds(waypoints);
  // map.fitBounds(bounds, { padding: [50, 50] }); // Adjust padding as needed
  map.fitBounds(bounds); // Adjust padding as needed

  map.setZoom(map.getZoom() - 2); // Ensure zoom doesn't go beyond 15
}

function fitWaypointsOnSearch(w) {
  var bounds = L.latLngBounds(w);

  map.fitBounds(bounds, {
    // padding: [100, 100], // Top/bottom and left/right padding in pixels
  });

  // Use fitBounds with padding to ensure the map fits correctly
  // map.setZoom(map.getZoom()); // Ensure zoom doesn't go beyond 15
  // map.setMaxZoom(map.getZoom()); // Ensure zoom doesn't go beyond 15
  map.setMinZoom(map.getZoom() - 2); // Ensure zoom doesn't go beyond 15

  console.log("map.getZoom()", map.getZoom());
  setMaxBoundsOnSearch(w);
}

function setMaxBoundsOnSearch(w) {
  // var currentZoom = map.getZoom();
  // Update the maxBoundsViscosity based on the zoom level (optional)
  // var viscosity = currentZoom > 12 ? 0.1 : 0.5; // Allow more flexibility when zoomed in
  readSVGPath()
    .then((value) => {
      // console.log("Value", value);
      w[0].lat = value[0];
      w[0].lng = value[1];
      w[1].lat = value[2];
      w[1].lng = value[3];

      const originalBounds = L.latLngBounds(
        w.map((w) => L.latLng(w.lat, w.lng))
      );
      const expandedBounds = expandBounds(originalBounds, 80);

      map.setMaxBounds(expandedBounds);

      // var rectangle = L.rectangle(expandedBounds, {
      //   color: "#ff7800", // Rectangle border color
      //   weight: 2, // Border thickness
      //   fillOpacity: 0.2, // Fill opacity
      // }).addTo(map);
    })
    .catch((error) => {
      console.log("Error", error);
    });

  // console.log({ expandedBounds });
  // console.log(readSVGPath());
}

function readSVGPath() {
  // Regular expression to match all coordinate pairs
  let foundElement = null;
  let isReady = false;
  let wp = {};

  let panner = setInterval(() => {
    map.panBy([1, 1]);
  }, 1000);

  return new Promise((resolve, reject) => {
    try {
      // Listen for the 'moveend' event, which happens after the view has been changed
      map.on("moveend", function () {
        // console.log("Map view has been updated, including setMaxBounds.");

        let domRed = $(".leaflet-interactive");
        for (let i = 0; i < domRed.length; i++) {
          let redPath = $(domRed).eq(i).css("stroke");

          if (redPath == "rgb(255, 0, 0)") {
            // console.log(redPath);
            foundElement = $(domRed).eq(i).attr("d");
            break;
          }
        }

        if (foundElement != null && !isReady) {
          // console.log(foundElement);

          const regex = /[\d.-]+/g;
          // console.log(foundElement);

          const coords = foundElement.match(regex).map(Number);

          // Initialize arrays to hold latitude and longitude
          const latLngArray = [];

          // Iterate through the coordinates
          for (let i = 0; i < coords.length; i += 2) {
            const x = coords[i];
            const y = coords[i + 1];

            // Convert SVG coordinates to LatLng (adjust as needed for your projection)
            const latLng = map.layerPointToLatLng(L.point(x, y)); // 'map' is your Leaflet map instance
            latLngArray.push(latLng);
          }

          // Now latLngArray contains the corresponding LatLng points
          // console.log(latLngArray);

          // Initialize min and max variables with extreme values
          let minLat = Infinity,
            maxLat = -Infinity;
          let minLng = Infinity,
            maxLng = -Infinity;

          // Iterate over latLngArray to find the min and max values
          latLngArray.forEach((latLng) => {
            const lat = latLng.lat;
            const lng = latLng.lng;

            // Update min and max latitudes
            if (lat < minLat) minLat = lat;
            if (lat > maxLat) maxLat = lat;

            // Update min and max longitudes
            if (lng < minLng) minLng = lng;
            if (lng > maxLng) maxLng = lng;
          });

          // Output the results
          // console.log("Min Lat:", minLat);
          // console.log("Max Lat:", maxLat);
          // console.log("Min Lng:", minLng);
          // console.log("Max Lng:", maxLng);

          isReady = true;

          wp[0] = minLat;
          wp[1] = minLng;
          wp[2] = maxLat;
          wp[3] = maxLng;

          // return "test";
          clearInterval(panner);
          resolve(wp);
        }
      });
    } catch (error) {
      // Reject the promise if any errors occur
      reject(error);
    }
  });
}

function expandBounds(bounds, percentage) {
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();

  const latDiff = ne.lat - sw.lat;
  const lngDiff = ne.lng - sw.lng;

  const newSw = L.latLng(
    sw.lat - (latDiff * (percentage / 100)) / 2,
    sw.lng - (lngDiff * (percentage / 100)) / 2
  );

  const newNe = L.latLng(
    ne.lat + (latDiff * (percentage / 100)) / 2,
    ne.lng + (lngDiff * (percentage / 100)) / 2
  );

  return L.latLngBounds(newSw, newNe);
}

function boundPoint(waypoints) {
  let boundPoint = waypoints.map((point) => {
    let newLat = point.lat;
    let newLng = point.lng;
    return L.latLng(newLat, newLng);
  });

  return boundPoint;
}

function sendData(jsonData) {
  window.Android.sendDataToAndroid(JSON.stringify(jsonData));
}

function showTripSchedule() {
  let searchPickupContainer = $(".trip-schedule");
  let overlaySearchPickup = $(".overlay-trip-schedule");

  searchPickupContainer.removeClass("hide");
  searchPickupContainer.addClass("show");
  overlaySearchPickup.fadeIn(500);
}

function showStartNavigation() {
  let searchPickupContainer = $(".trip-start");
  let overlaySearchPickup = $(".overlay-trip-navigation");

  searchPickupContainer.removeClass("hide");
  searchPickupContainer.addClass("show");
  // overlaySearchPickup.delay(500).fadeIn(500);
  overlaySearchPickup.fadeIn(500);
}

function hideStartNavigation() {
  let searchPickupContainer = $(".trip-start");
  let overlaySearchPickup = $(".overlay-trip-navigation");

  searchPickupContainer.removeClass("show");
  searchPickupContainer.addClass("hide");
  overlaySearchPickup.fadeOut(500);
}

function hideTripSchedule() {
  let searchPickupContainer = $(".trip-schedule");
  let overlaySearchPickup = $(".overlay-trip-schedule");

  searchPickupContainer.removeClass("show");
  searchPickupContainer.addClass("hide");
  overlaySearchPickup.delay(200).fadeOut(500);
}

function hideHailingOverlay() {
  let searchPickupContainer = $(".search-pickup-box");
  let overlaySearchPickup = $(".overlay-search-pickup");
  searchPickupContainer.removeClass("show");
  searchPickupContainer.addClass("hide");
  overlaySearchPickup.delay(200).fadeOut(500);
}

function showHailingOverlay() {
  if (!isReservation) {
    // window.showHailingOverlay = () => {
    let searchPickupContainer = $(".search-pickup-box");
    let overlaySearchPickup = $(".overlay-search-pickup");
    searchPickupContainer.removeClass("hide");
    searchPickupContainer.addClass("show");
    overlaySearchPickup.delay(200).fadeIn(500);
  } else {
    // Allow trip schedule overlay to be shown again when picking dates
    let searchPickupContainer = $(".trip-schedule");
    let overlaySearchPickup = $(".overlay-trip-schedule");
    searchPickupContainer.removeClass("hide");
    searchPickupContainer.addClass("show");
    overlaySearchPickup.delay(200).fadeIn(500);
  }
}

function showReturnToHailing() {
  $(".hailing-overlay").fadeIn(500);
}

function hideReturnToHailing() {
  $(".hailing-overlay").fadeOut(500);
}

function showCenterMarker() {
  $(".center-marker").fadeIn(500);
}

function hideCenterMarker() {
  $(".center-marker").fadeOut(500);
}

function showChooseDestination() {
  $(".destination-overlay").fadeIn(500);
}

function hideChooseDestination() {
  $(".destination-overlay").fadeOut(500);
  // console.log("Fading Out");
}

// function hideChooseDestination() {
//   iziToast.destroy();
// }

function xshowChooseDestination() {
  iziToast.show({
    // theme: 'dark',
    icon: "fas fa-map-pin",
    iconColor: "#ff8f00",
    // title: "Choose Destination",
    // message: 'Welcome!',
    timeout: false,
    position: "bottomCenter", // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter
    // progressBarColor: 'rgb(0, 255, 184)',
    buttons: [
      // ['<button>Ok</button>', function (instance, toast) {
      //     alert("Hello world!");
      // }, true], // true to focus
      [
        "<button>Choose this Destination</button>",
        function (instance, toast) {
          instance.hide(
            {
              transitionOut: "fadeOutUp",
              onClosing: function (instance, toast, closedBy) {
                console.info("closedBy: " + closedBy); // The return will be: 'closedBy: buttonName'
              },
            },
            toast,
            "buttonName"
          );
        },
      ],
    ],
    onOpening: function (instance, toast) {
      console.info("callback abriu!");
      checkViewHeightStatus();
    },
    onClosing: function (instance, toast, closedBy) {
      console.info("closedBy: " + closedBy); // tells if it was closed by 'drag' or 'button'
    },
  });
}

function checkViewHeightStatus() {
  let bodyHeight = +sessionStorage.getItem("bodyHeight");
  let iziWrapper = $(".iziToast-wrapper");
  let iziWrapperHeight = +iziWrapper.css("height").split("px")[0];
  $(".title")
    .eq(1)
    .text(bodyHeight + " | " + iziWrapper.css("height"));

  iziWrapper.css("bottom", "100px");
  // if (iziWrapper.length > 0) {
  //   iziWrapper.css("bottom", (bodyHeight - (bodyHeight - iziWrapperHeight)) + "px")
  // }
}

$("#test").on("click", () => {
  console.log("Test");
  fitWaypoints();
});

window.Test = (w) => {
  // map.setMaxBounds(boundPoint(w));
  // map.panBy([1, 1]);
  receiveLocation2(14, 210);
};

// Send JSON data to Android

$("#zoomOut").on("click", () => {
  console.log("Test");

  try {
    window.Android.sendDataToAndroid(JSON.stringify(jsonData));
  } catch (e) {
    console.log("Hello error", e);
    $("#error").text(e);
  }
});

$(document).ready(function () {
  // Select the div element using jQuery
  const targetDiv = $("#response-listener")[0]; // jQuery returns a collection, so we need to get the first element

  // Create a MutationObserver instance
  const observer = new MutationObserver(function (mutationsList) {
    mutationsList.forEach(function (mutation) {
      if (mutation.type === "childList" || mutation.type === "characterData") {
        console.log("Div content changed:");

        isListeningForLocation = false;

        // 📌 Pickup Listener
        if (
          isPickupListeningForLocation &&
          !["listener", ""].includes($("#response-listener").text()) // Make exception for default and empty values
        ) {
          RetrieveActualAddressName(JSON.parse($("#response-listener").text()));
        }

        // 📌 Drop-off Listener
        if (
          isDropListeningForLocation &&
          !["listener", ""].includes($("#response-listener").text()) // Make exception for default and empty values
        ) {
          RetrieveActualAddressName(JSON.parse($("#response-listener").text()));
        }
      }
    });
  });

  // Start observing the div for changes
  observer.observe(targetDiv, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  // // Change the div content programmatically using jQuery
  // $('#changeDiv').click(function() {
  //     $('#response-listener').text('Change Div Content');
  // });
});

// 🔰 Reverse GeoCoding to Translate Latitude and Longitude to Actual Address
function RetrieveActualAddressName(coordinates) {
  var lat = coordinates.lat;
  var lon = coordinates.lng;

  // Reverse geocoding using Nominatim
  var url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2`;

  console.log(isPickupListeningForLocation, inputFocus.currentFocused);

  // Fetch the address data from Nominatim
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      var address = data.display_name; // Extract address from the response

      // Use for Auto Retrieve location
      if (!isManualPickup) {
        if (isPickupListeningForLocation) {
          $("#input-pickup-location").val(address);
          $("#input-pickup-location").attr("lat", lat);
          $("#input-pickup-location").attr("lng", lon);
          isPickupListeningForLocation = false;
        } else if (isDropListeningForLocation) {
          $("#input-dropoff-location").val(address);
          $("#input-dropoff-location").attr("lat", lat);
          $("#input-dropoff-location").attr("lng", lon);
          isDropListeningForLocation = false;
        }
      }
      // Manual Pick
      else {
        let iFocus = inputFocus.currentFocused;
        iziToast.destroy();

        if (iFocus == "pickup") {
          $("#input-pickup-location").val(address);
          $("#input-pickup-location").attr("lat", lat);
          $("#input-pickup-location").attr("lng", lon);
        } else if (iFocus == "drop") {
          $("#input-dropoff-location").val(address);
          $("#input-dropoff-location").attr("lat", lat);
          $("#input-dropoff-location").attr("lng", lon);
        }

        if (iFocus != "") {
          iziToast.success({
            title: "Success",
            message: `Retrieved Location: ${address}`,
            icon: "fa fa-map-pin",
            position: "topRight",
            timeout: 4000,
          });
        }
      }
    })
    .catch((error) => {
      iziToast.destroy();

      console.error("Error fetching data:", error);
      iziToast.warning({
        title: "Error",
        message: `Error fetching data:", ${error}`,
        icon: "fa fa-exclamation-circle",
        position: "topRight",
        timeout: 4000,
      });
    });
}

// Drop-off Location
$("#btn-search-pickup").on("click", (e) => {
  // console.log(e);
  hideSearchLocation();
  $("#input-pickup-location").focus();
  inputFocus.currentFocused = "pickup";
});

// Pickup Location
$("#btn-search-dropoff").on("click", () => {
  hideSearchLocation();
  $("#input-dropoff-location").focus();
  inputFocus.currentFocused = "drop";
});

// Drop-off Location
$(
  "#pickup-use-current-location .location-text, #pickup-pin-location .location-text"
).on("click", (e) => {
  inputFocus.currentFocused = "pickup";
});

// Pickup Location
$("#current-location .location-text, #drop-pin-location .location-text").on(
  "click",
  () => {
    inputFocus.currentFocused = "drop";
  }
);

$(".close-btn").on("click", () => {
  hideHailingOverlay();
  showReturnToHailing();
  hideCenterMarker();
  hideChooseDestination();
  // card.classList.add("hide");
});

$(".close-btn.schedule").on("click", () => {
  hideTripSchedule();
  // card.classList.add("hide");
});

$(".close-btn.navigation").on("click", () => {
  hideStartNavigation();
  // card.classList.add("hide");
});

function hideSearchLocation() {
  $(".location-box").css("display", "none");
  // $(".location-box.input").css("display", "block");
  $(".location-box.input").fadeIn(1000);
}

function setWebViewHeight(value) {
  console.log("setWebViewHeight: ", value);
  let finalHeight = Math.floor(+value * 0.75);
  $(".hailing-overlay").css("top", finalHeight + "px");
  $("body").css("height", Math.ceil(+value) + "px");
  sessionStorage.setItem("bodyHeight", Math.ceil(+value));
}

let facilitiesArray = [
  {
    value: ",  ",
    key: 0,
    id: "admin",
    label: ",   • ADMIN",
    year: "NA",
    role: "admin",
  },
  {
    value: "Taylor, Christopher L",
    key: 1,
    id: "christophertl",
    label: "Taylor, Christopher L • GUARD",
    year: "NA",
    role: "guard",
  },
];

$("#input-pickup-location, #input-dropoff-location").autocomplete({
  source: function (request, response) {
    $.ajax({
      url: "https://nominatim.openstreetmap.org/search",
      // "https://nominatim.openstreetmap.org/search?format=json&q=" +
      // $("#input-pickup-location").val() + "",
      data: {
        // term: request.term, // Term being typed by the user
        format: "json",
        q: request.term,
        // viewbox: "10.188466,480.474426,12.155372,484.646484",
        // bounded: 1,
        term: request.term,
        bounded: 1,
        viewbox: "121.781,10.361,123.225,12.004", // Retrieved from https://norbertrenner.de/osm/bbox.html
      },
      success: function (data) {
        let downloadedData = [];

        for (let i = 0; i < data.length; i++) {
          let d = data[i - 0];
          downloadedData.push({
            key: i + 1,
            value: d.display_name,
            label: d.display_name,
            id: d.osm_id,
            lat: d.lat,
            lng: d.lon,
          });
        }

        console.log(data);
        response(downloadedData); // Pass the data to jQuery UI autocomplete
      },
      error: function () {
        console.error("Failed to fetch data.");
        response([]); // Return empty array on error
      },
    });

    // // Use `label` property from each object to display in autocomplete suggestions
    // const results = $.map(facilitiesArray, function(item) {
    //   // Filter based on `value` or `label` to show relevant results
    //   if (item.value.toLowerCase().includes(request.term.toLowerCase())) {
    //     return {
    //       label: item.label,
    //       value: item.value, // This sets the value in the input field
    //       id: item.id,
    //       role: item.role
    //     };
    //   } else {
    //     return null;
    //   }
    // });

    // console.log(results);
    // response(results);
  },
  select: function (event, ui) {
    let target = event.target;
    // console.log("target: ", ui);

    event.preventDefault(); // Prevent the default behavior
    $(target).val(ui.item.value); // Set value to the input
    // lng: +$("#input-pickup-location").attr("lng"),
    // lat: +$("#input-dropoff-location").attr("lat"),
    $(target).attr("lat", ui.item.lat);
    $(target).attr("lng", ui.item.lng);

    console.log("Selected: ", ui.item); // Log the selected item
  },
  search: function (event, ui) {
    console.log(event, ui);
  },
  focus: function (event, ui) {
    event.preventDefault();
    // $("#input-pickup-location").val(ui.item.value); // Set value while navigating suggestions
  },
  close: function (event, ui) {
    // code below makes the selection to not disapper, good for debugging
    // if (!$("ul.ui-autocomplete").is(":visible")) {
    //   $("ul.ui-autocomplete").show();
    // }
  },
  open: function (event, ui) {
    var $input = $(this);
    var $autocomplete = $(".ui-autocomplete");

    // Dynamically set the width of the autocomplete suggestions to match the input width
    $autocomplete.css({
      width: $input.outerWidth() + "px",
    });
  },
});

// function showSearchInput(){
//   $(".location-box").css("display", "none");
// }

/**
 * Auto Look-up for Location
 */

$("#input-pickup-location").on("focus blur", (e) => {
  let currentLocation = $("#pickup-use-current-location");
  let currentPinLocation = $("#pickup-pin-location");
  let dropLocation = $("#drop-use-current-location");
  let dropPinLocation = $("#drop-pin-location");
  let pickupGPSOptions = $("#pickup-gps-options");
  let dropGPSOptions = $("#drop-gps-options");
  // dropGPSOptions.css("display", "none");
  dropGPSOptions.fadeOut(300);
  // dropLocation.css("visibility", "hidden");
  // dropPinLocation.css("visibility", "hidden");
  // dropLocation.fadeOut(500);

  if (e.type == "focus") {
    // pickupGPSOptions.css("display", "block");
    pickupGPSOptions.fadeIn(300);
    // currentLocation.css("visibility", "visible");
    // currentPinLocation.css("visibility", "visible");
    // currentLocation.fadeIn(500);
  }
  // else {
  //   currentLocation.fadeOut(500);
  //   currentLocation.css("visibility", "hidden");
  // }
});

$("#input-dropoff-location").on("focus blur", (e) => {
  let dropLocation = $("#drop-use-current-location");
  let dropPinLocation = $("#drop-pin-location");
  let currentLocation = $("#pickup-use-current-location");
  let currentPinLocation = $("#pickup-pin-location");
  let pickupGPSOptions = $("#pickup-gps-options");
  let dropGPSOptions = $("#drop-gps-options");
  // pickupGPSOptions.css("display", "none");
  pickupGPSOptions.fadeOut(300);
  // currentLocation.css("visibility", "hidden");
  // currentPinLocation.css("visibility", "hidden");
  // currentLocation.fadeOut(500);

  if (e.type == "focus") {
    // dropGPSOptions.css("display", "block");
    dropGPSOptions.fadeIn(300);
    // dropLocation.css("visibility", "visible");
    // dropPinLocation.css("visibility", "visible");
    // dropLocation.fadeIn(500);
  }
  // else {
  //   dropLocation.fadeOut(500);
  //   dropLocation.css("visibility", "hidden");
  // }
});

// 📌 Request Location from Android
$("#pickup-use-current-location").on("click", (e) => {
  let json = { request_current_location: true };
  sendData(json);
  isPickupListeningForLocation = true;
});

// 📌 Request Drop-off from Android
$("#drop-use-current-location").on("click", (e) => {
  let json = { request_current_location: true };
  sendData(json);
  isDropListeningForLocation = true;
});

// 📍 Manually Map Pin for Pickup
$("#pickup-pin-location").on("click", (e) => {
  hideHailingOverlay();
  showReturnToHailing();
  allowReadingCoordinates = true;
  showCenterMarker();
  showChooseDestination();
  // showChooseDestination();
  // checkViewHeightStatus();
});

// 📍 Manually Map Pin for Drop-off
$("#drop-pin-location").on("click", (e) => {
  hideHailingOverlay();
  showReturnToHailing();
  allowReadingCoordinates = true;
  showCenterMarker();
  showChooseDestination();
});

// Return button
$(".hailing-overlay").on("click", () => {
  console.log("isStartNavigation", isStartNavigation);

  if (isStartNavigation) {
    showStartNavigation();
  } else {
    showHailingOverlay();
    hideReturnToHailing();
    allowReadingCoordinates = false;
    hideCenterMarker();
    hideChooseDestination();
  }
});

// Choose Destination Button
$(".destination-overlay").on("click", () => {
  // console.log(locationDetails["coordinates"]);
  let lat = locationDetails["coordinates"].lat;
  let lng = locationDetails["coordinates"].lng;

  if (lat <= 0 && lng <= 0) {
    iziToast.warning({
      title: "Please move marker",
      // message: `Please enter Pickup and Drop-off locations`,
      icon: "fa fa-exclamation-circle",
      position: "topRight",
      timeout: 5000,
    });
  } else {
    iziToast.info({
      title: "Loading selected location",
      // message: `Please enter Pickup and Drop-off locations`,
      icon: "fa fa-map-pin",
      position: "topRight",
      timeout: 4000,
    });

    showHailingOverlay();
    isManualPickup = true;
    RetrieveActualAddressName(locationDetails.coordinates);
    hideCenterMarker();
  }
});

// 🔲 Done button
$("#btn-done").on("click", (e) => {
  let pickupText = $("#input-pickup-location").val();
  let dropoffText = $("#input-dropoff-location").val();

  let currentDate = getCurrentDate("ymd-");
  let email = sessionStorage.getItem("userEmail");
  let name = sessionStorage.getItem("userName");
  let uid = sessionStorage.getItem("userUID");
  let userType = sessionStorage.getItem("userType");

  console.log(pickupText, dropoffText);

  if (pickupText == "" && dropoffText == "") {
    iziToast.warning({
      title: "Incomplete Fields",
      message: `Please enter Pickup and Drop-off locations`,
      icon: "fa fa-exclamation-circle",
      position: "topRight",
      timeout: 5000,
    });
  } else if (pickupText == "" && dropoffText != "") {
    iziToast.warning({
      title: "Incomplete Field",
      message: `Please enter Pickup locations`,
      icon: "fa fa-exclamation-circle",
      position: "topRight",
      timeout: 5000,
    });
  } else if (pickupText != "" && dropoffText == "") {
    iziToast.warning({
      title: "Incomplete Field",
      message: `Please enter Drop-off locations`,
      icon: "fa fa-exclamation-circle",
      position: "topRight",
      timeout: 5000,
    });
  } else {
    iziToast.success({
      title: "Searching Route",
      message: `Please wait`,
      icon: "fa fa-check",
      position: "topRight",
      timeout: 1000,
    });

    const startPoint = {
      lat: +$("#input-pickup-location").attr("lat"),
      lng: +$("#input-pickup-location").attr("lng"),
    };
    const endPoint = {
      lat: +$("#input-dropoff-location").attr("lat"),
      lng: +$("#input-dropoff-location").attr("lng"),
    };

    let allowOnce = true;
    let allowOnce2 = true;
    let counter = 0;

    showRoute(startPoint, endPoint);
    hideHailingOverlay();

    setTimeout(() => {
      console.log({ isPickingSchedule });

      if (!isPickingSchedule) {
        iziToast.question({
          timeout: false,
          close: false,
          overlay: true,
          displayMode: "once",
          id: "question",
          zindex: 999,
          title: "Route Selection",
          message: "Select this destination?",
          position: "center",
          buttons: [
            [
              "<button><b>YES</b></button>",
              function (instance, toast) {
                instance.hide({ transitionOut: "fadeOut" }, toast, "button");

                $("#find-location").fadeOut();

                iziToast.success({
                  title: "Route Selected",
                  message: `Searching for nearby drivers, please wait...`,
                  icon: "fa fa-check",
                  position: "topRight",
                  timeout: false,
                });

                // let json = { search_driver: true };
                // sendData(json);

                // searchAvailableDrivers()
                //   .then((data) => {
                //     console.log(data); // Output: "Data fetched!"
                //     return "Processing data...";
                //   })
                //   .then((processedData) => {
                //     console.log(processedData); // Output: "Processing data..."
                //   })
                //   .catch((error) => {
                //     console.error("Error:", error);
                //   });

                let onlineDriver = getDriverReference();
                let onValue = getOnValue();
                let ref = getRef();
                let update = getUpdate();
                let database = getDatabase();
                let totalDistance = sessionStorage.getItem("totalDistance");
                let dbDriverName = "";

                getUserDetails().then((d) => {
                  onValue(onlineDriver, (snapshot) => {
                    const data = snapshot.val();
                    let listOnlineDriver = [];
                    console.log(data);

                    // for (let driver in data) {
                    //   let detail = data[driver];

                    //   if (detail.isAvailable) {
                    //     let isConfirmed =
                    //       detail.status == undefined ? "" : detail.status;
                    //     listOnlineDriver.push({
                    //       // driverName: detail.drivername,
                    //       driverID: driver,
                    //       status: isConfirmed,
                    //     });
                    //   }
                    // }

                    for (let driver in data) {
                      let detail = data[driver];

                      if (detail.isAvailable) {
                        let fStatus = "";

                        for (let data in detail) {
                          let key = Object.keys(detail[data])[0];
                          let status = "";

                          try {
                            status =
                              detail[data][key]["status"] == undefined
                                ? ""
                                : detail[data][key]["status"];
                          } catch {
                            status = "";
                          }

                          if (status != "") {
                            fStatus = status;
                          }
                        }

                        for (let drvr in d) {
                          if (driver == drvr) {
                            // console.log(d[drvr].drivername);
                            dbDriverName = d[drvr].drivername;
                            break;
                          }
                        }

                        listOnlineDriver.push({
                          // driverName: detail.drivername,
                          driverID: driver,
                          status: fStatus,
                          driverName: dbDriverName,
                        });
                      }
                    }

                    if (listOnlineDriver.length > 0) {
                      iziToast.destroy();

                      if (listOnlineDriver.length > 1) {
                        iziToast.success({
                          title: `Found ${listOnlineDriver.length} available Drivers`,
                          message: `Selecting nearest and available driver`,
                          icon: "fa fa-check",
                          position: "topRight",
                          timeout: false,
                        });
                      } else {
                        // 🔰🔰🔰🔰🔰🔰🔰🔰🔰
                        // One driver found
                        iziToast.success({
                          title: `Found ${listOnlineDriver.length} available Driver`,
                          message: `Waiting for the driver to confirm, please wait`,
                          icon: "fa fa-check",
                          position: "topRight",
                          timeout: false,
                        });

                        let driverStatus = listOnlineDriver[0].status;
                        console.log("status", driverStatus);

                        if (driverStatus == "confirmed") {
                          iziToast.destroy();
                          iziToast.success({
                            title: `Driver Found`,
                            message: `${listOnlineDriver[0].driverID} is your driver`,
                            icon: "fa fa-check",
                            position: "topRight",
                            timeout: false,
                          });

                          if (allowOnce2) {
                            allowOnce2 = false;

                            // Create new chat
                            let dateNow = Date.now();
                            // let data2 = {
                            //   created_by: email,
                            //   participants: listOnlineDriver[0].driverID,
                            // };

                            let data3 = {
                              id: listOnlineDriver[0].driverID,
                              message:
                                "Your Van booking is now in-line please wait for the driver to arrive (This is an automated message)",
                              time_read: "",
                              user_type: "driver",
                            };

                            let sanitizedCreatedBy = sanitizeText(
                              `chats/users/${email}/${listOnlineDriver[0].driverID}/created_by`
                            );

                            let sanitizedDriverName = sanitizeText(
                              `chats/users/${email}/${listOnlineDriver[0].driverID}/driverName`
                            );

                            let sanitizedParticipants = sanitizeText(
                              `chats/users/${email}/${listOnlineDriver[0].driverID}/participants`
                            );

                            let sanitizedPath2 = sanitizeText(
                              `chats/users/${email}/${listOnlineDriver[0].driverID}/messages/${dateNow}`
                            );

                            let sanitizedDriver = sanitizeText(
                              `chats/users/${email}/${listOnlineDriver[0].driverID}/rider_seen`
                            );

                            let sanitizedRider = sanitizeText(
                              `chats/users/${email}/${listOnlineDriver[0].driverID}/driver_seen`
                            );

                            const updates1 = {};
                            updates1[sanitizedCreatedBy] = email;

                            const updates2 = {};
                            updates2[sanitizedParticipants] =
                              listOnlineDriver[0].driverID;

                            const updates3 = {};
                            updates3[sanitizedPath2] = data3;

                            const updates4 = {};
                            updates4[sanitizedDriverName] =
                              listOnlineDriver[0].driverName;

                            const updates5 = {};
                            updates5[sanitizedDriver] = false;

                            const updates6 = {};
                            updates6[sanitizedRider] = false;

                            update(ref(database), updates1);
                            update(ref(database), updates2);
                            update(ref(database), updates4);
                            update(ref(database), updates5);
                            update(ref(database), updates6);

                            update(ref(database), updates3)
                              .then(() => {
                                console.log("Chat initialized");

                                setTimeout(() => {
                                  let json = { open_chat: true };
                                  sendData(json);
                                }, 2000);
                              })
                              .catch((error) => {
                                console.log("Unable to Initialize chat");
                              });
                          }
                        } else if (driverStatus == "declined") {
                          iziToast.destroy();
                          iziToast.info({
                            title: `Driver Declined Request`,
                            message: `Please select another`,
                            icon: "fa fa-check",
                            position: "topRight",
                            timeout: false,
                          });
                        }

                        if (allowOnce) {
                          counter++;
                          allowOnce = false;
                          console.log(
                            "allowOnce",
                            allowOnce,
                            " counter",
                            counter
                          );
                          let picklat = +$("#input-pickup-location").attr(
                            "lat"
                          );
                          let picklng = +$("#input-pickup-location").attr(
                            "lng"
                          );
                          let pickname = $("#input-pickup-location").val();

                          let droplat = +$("#input-dropoff-location").attr(
                            "lat"
                          );
                          let droplng = +$("#input-dropoff-location").attr(
                            "lng"
                          );
                          let dropname = $("#input-dropoff-location").val();

                          const updates = {};
                          let data = {
                            arrival: "",
                            customerID: email,
                            customerName: name,
                            dropoff_coordinates_lat: droplat,
                            dropoff_coordinates_lng: droplng,
                            dropoff_location: dropname,
                            for_pickup: "",
                            ongoing_trip: "",
                            picked_up: "",
                            pickup_coordinates_lat: picklat,
                            pickup_coordinates_lng: picklng,
                            pickup_location: pickname,
                            totalDistance: totalDistance,
                            scheduledDate: pickingSchedule,
                          };

                          console.log("totalDistance", totalDistance);

                          console.log(listOnlineDriver);
                          let sanitizedPath = sanitizeText(
                            `activity/booking/${currentDate}/drivers/${
                              listOnlineDriver[0].driverID
                            }/${Date.now()}/${email}/`
                          );
                          updates[sanitizedPath] = data;

                          console.log(updates);

                          // Update hail for the rider to check if rider's can be picked up
                          update(ref(database), updates)
                            .then(() => {
                              console.log("Rider pinged");
                            })
                            .catch((error) => {
                              console.log("Error pinging the rider");
                              // iziToast.warning({
                              //   title: "Save Failed",
                              //   message: `${error}`,
                              //   icon: "fa fa-bell-exclamation",
                              //   position: "topRight",
                              //   timeout: 4000,
                              // });
                            });
                        }
                      }
                    } else {
                      iziToast.destroy();

                      iziToast.info({
                        title: "No Available Driver",
                        message: `Please wait, still searching...`,
                        icon: "fa fa-exclamation-circle",
                        position: "topRight",
                        timeout: false,
                      });
                    }
                  });
                });
              },
              true,
            ],
            [
              "<button>NO</button>",
              function (instance, toast) {
                instance.hide({ transitionOut: "fadeOut" }, toast, "button");

                showHailingOverlay();
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
      } else {
        // For Reservation
        iziToast.success({
          timeout: false,
          // close: false,
          overlay: true,
          // displayMode: "once",
          title: "Schedule has been sent to the driver, waiting for response",
          message: `When accepted, please be ready within this date and time: ${pickingSchedule}`,
          icon: "fa fa-map-pin",
          position: "center",
          timeout: false,
          onClosed: function (instance, toast, closedBy) {
            console.info("Closed | closedBy: " + closedBy);
            location.reload();
          },
          buttons: [
            // ['<button>Ok</button>', function (instance, toast) {
            //     alert("Hello world!");
            // }, true], // true to focus
            [
              "<button>Open Chat</button>",
              function (instance, toast) {
                instance.hide(
                  {
                    transitionOut: "fadeOutUp",
                    onClosing: function (instance, toast, closedBy) {
                      console.info("closedBy: " + closedBy); // The return will be: 'closedBy: buttonName'
                    },
                  },
                  toast,
                  "buttonName"
                );

                let json = { open_chat: true };
                sendData(json);
              },
            ],
          ],
        });

        let picklat = +$("#input-pickup-location").attr("lat");
        let picklng = +$("#input-pickup-location").attr("lng");
        let pickname = $("#input-pickup-location").val();

        let droplat = +$("#input-dropoff-location").attr("lat");
        let droplng = +$("#input-dropoff-location").attr("lng");
        let dropname = $("#input-dropoff-location").val();

        let totalDistance = sessionStorage.getItem("totalDistance");

        const updates = {};
        let data = {
          arrival: "",
          customerID: email,
          customerName: name,
          dropoff_coordinates_lat: droplat,
          dropoff_coordinates_lng: droplng,
          dropoff_location: dropname,
          for_pickup: "",
          ongoing_trip: "",
          picked_up: "",
          pickup_coordinates_lat: picklat,
          pickup_coordinates_lng: picklng,
          pickup_location: pickname,
          totalDistance: totalDistance,
          isScheduled: true,
          scheduledDate: pickingSchedule,
        };

        // console.log(listOnlineDriver);
        let sanitizedPath = sanitizeText(
          `activity/booking/${currentDate}/drivers/${pickingDriverID}/${Date.now()}/${email}/`
        );
        updates[sanitizedPath] = data;

        console.log(updates);
        let ref = getRef();
        let update = getUpdate();
        let database = getDatabase();
        // Update hail for the rider to check if rider's can be picked up
        update(ref(database), updates)
          .then(() => {
            console.log("Rider pinged");
          })
          .catch((error) => {
            console.log("Error pinging the rider");
          });

        // Initialize Chat request to Driver
        let sanitizedCreatedBy = sanitizeText(
          `chats/users/${email}/${pickingDriverID}/created_by`
        );

        let sanitizedDriverName = sanitizeText(
          `chats/users/${email}/${pickingDriverID}/driverName`
        );

        let sanitizedParticipants = sanitizeText(
          `chats/users/${email}/${pickingDriverID}/participants`
        );

        let sanitizedPath2 = sanitizeText(
          `chats/users/${email}/${pickingDriverID}/messages/${Date.now()}`
        );

        let sanitizedDriver = sanitizeText(
          `chats/users/${email}/${pickingDriverID}/rider_seen`
        );

        let sanitizedRider = sanitizeText(
          `chats/users/${email}/${pickingDriverID}/driver_seen`
        );

        let data3 = {
          id: pickingDriverID,
          message: `Your Van booking is pending to accept, please wait for the driver (${pickingDriverID}) to respond (This is an automated message)`,
          time_read: "",
          user_type: "driver",
          isScheduled: true,
        };

        const updates1 = {};
        updates1[sanitizedCreatedBy] = email;

        const updates2 = {};
        updates2[sanitizedParticipants] = pickingDriverID;

        const updates3 = {};
        updates3[sanitizedPath2] = data3;

        const updates4 = {};
        updates4[sanitizedDriverName] = pickingDriverName;

        const updates5 = {};
        updates5[sanitizedDriver] = false;

        const updates6 = {};
        updates6[sanitizedRider] = false;

        update(ref(database), updates1);
        update(ref(database), updates2);
        update(ref(database), updates4);
        update(ref(database), updates5);
        update(ref(database), updates6);
        update(ref(database), updates3)
          .then(() => {
            console.log("Chat initialized");

            // setTimeout(() => {
            //   let json = { open_chat: true };
            //   sendData(json);
            // }, 2000);
          })
          .catch((error) => {
            console.log("Unable to Initialize chat");
          });

        // Open Chat in Rider's App
        // let json = { request_current_location: true };
        // sendData(json);
        // isPickupListeningForLocation = true;
      }
    }, 1800);
  }
});

// Read Coordinates on Movement for Manual Pin
// map.on("move", updateCoordinates);
map.on("moveend", updateCoordinates);

function showRoute(start, end) {
  // const map = initializeMap();

  // Add routing control
  let control = L.Routing.control({
    waypoints: [
      L.latLng(start.lat, start.lng), // Starting point
      L.latLng(end.lat, end.lng), // Destination point
    ],
    routeWhileDragging: true, // Allows the user to drag and modify the route
    fitSelectedRoutes: true, // Auto-zooms the map to fit the route
  }).addTo(map);

  control.on("routesfound", function (e) {
    const routes = e.routes;
    const totalDistance = routes[0].summary.totalDistance; // Distance in meters
    // console.log(`Total Distance: ${totalDistance} meters`);
    $("#distance").text(`Total Distance: ${totalDistance} meters`);
    sessionStorage.setItem("totalDistance", (totalDistance / 1000).toFixed(2));

    // Optionally, display the distance on the map or in a popup
    L.popup()
      .setLatLng(routes[0].waypoints[0].latLng) // Display near the starting point
      .setContent(`Total Distance: ${(totalDistance / 1000).toFixed(2)} km`)
      .openOn(map);
  });
}

// Declare a global variable to store the control instance
let controlMult;
let distanceThreshold = 5.0; // km
let arrivedDistance = 0.2; // km

function showMultRoute(lat, lng) {
  let wp = [];

  // Origin of driver
  wp.push(L.latLng(lat, lng));
  // wp.push(L.latLng(11.74191596046379, 122.27159854764896));

  for (let d in navigationData) {
    // console.log(navigationData[d].customerName);
    wp.push(
      L.latLng(
        navigationData[d].dropoff_coordinates_lat,
        navigationData[d].dropoff_coordinates_lng
      )
    );

    wp.push(
      L.latLng(
        navigationData[d].pickup_coordinates_lat,
        navigationData[d].pickup_coordinates_lng
      )
    );
  }

  // Remove all layers from the map
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker || layer instanceof L.Popup) {
      map.removeLayer(layer);
    }
  });

  if (controlMult) {
    map.removeControl(controlMult); // Remove the routing control from the map
    controlMult = null; // Reset the control variable
  }

  console.log("Waypoints", wp.length);

  // Add routing control
  controlMult = L.Routing.control({
    waypoints: wp,
    // waypoints: [
    //   L.latLng(11.74191596046379, 122.27159854764896), // Starting point
    //   L.latLng(11.52065294621054, 122.45846738609085), // Destination point
    // ],
    routeWhileDragging: false, // Allows the user to drag and modify the route
    fitSelectedRoutes: false, // Auto-zooms the map to fit the route
    showAlternatives: true, // Enables alternative routes
    // altLineOptions: {
    //   styles: [
    //     { color: "blue", opacity: 0.7, weight: 4 }, // Primary route style
    //     { color: "green", opacity: 0.7, weight: 4 }, // Alternative route style
    //   ],
    // },
    router: L.Routing.osrmv1({
      serviceUrl: "https://router.project-osrm.org/route/v1", // OSRM Service URL
    }),
  })
    .on("routingerror", function (e) {
      console.error("Routing Error:", e.error.message);
      console.error("Routing Error:", e.error.url);
    })
    .addTo(map);

  let onlineDriver = getDriverReference();
  let onValue = getOnValue();
  let ref = getRef();
  let update = getUpdate();
  let database = getDatabase();

  controlMult.on("routesfound", function (e) {
    const routes = e.routes;
    // console.log("routes", JSON.stringify(routes[0].coordinates));
    // console.log("routes", routes[0].coordinates.length);

    routes.forEach((route, index) => {
      const totalDistance = route.summary.totalDistance; // Distance in meters
      const totalTime = route.summary.totalTime; // Time in seconds

      console.log(`Route ${index + 1}:`);
      console.log(`- Distance: ${(totalDistance / 1000).toFixed(2)} km`);
      console.log(`- Time: ${(totalTime / 60).toFixed(2)} minutes`);

      // Optionally, display route information in a popup or UI element
      // if (index === 0) {
      L.popup()
        .setLatLng(route.waypoints[0].latLng) // Display near the starting point
        .setContent(
          `<b><span style='font-size: 20px'>🚗</span> You are here</b><br>Total Distance: ${(
            totalDistance / 1000
          ).toFixed(2)} km`
          // , ${(
          //   totalTime / 60
          // ).toFixed(2)} minutes`
        )
        .addTo(map);

      // .openOn(map);
      // } else {
      const popups = [];
      for (let d in wp) {
        console.log("dddd", d);

        if (+d != 0) {
          for (let n in navigationData) {
            // if (
            //   sessionStorage.getItem(navigationData[n].timestamp) !=
            //   navigationData[n].timestamp
            // ) {
            // DROP-OFF
            if (
              wp[d].lat == navigationData[n].dropoff_coordinates_lat &&
              wp[d].lng == navigationData[n].dropoff_coordinates_lng
            ) {
              let controlWp = [];

              // Origin of driver
              controlWp.push(L.latLng(lat, lng)); // Current location
              controlWp.push(L.latLng(wp[d].lat, wp[d].lng)); // User's Dropoff point

              let dropControl = L.Routing.control({
                waypoints: controlWp,
                routeWhileDragging: true, // Keeps the ability to drag waypoints
                fitSelectedRoutes: false, // Prevents auto-zoom to the route
                showAlternatives: false, // Disables alternative routes
                createMarker: function () {
                  return null; // Hides the markers
                },
                lineOptions: {
                  // styles: [{ color: "transparent", weight: 0 }], // Makes the route line invisible
                },
              }).addTo(map);

              dropControl.on("routesfound", function (e) {
                const r = e.routes;
                const td = r[0].summary.totalDistance; // Distance in meters
                console.log(`Invididual Total Distance: ${td / 1000} meters`);
                console.log(`Invididual Curr Points ${lat}, ${lng}`);
                console.log(
                  `Invididual Dest Points ${wp[d].lat}, ${wp[d].lng}`
                );

                // Arrived
                if (td / 1000 < arrivedDistance) {
                  let sanitized2 = sanitizeText(
                    "activity/booking/" +
                      getCurrentDate("ymd-") +
                      "/drivers/" +
                      sessionStorage.getItem("userUID") +
                      "/" +
                      navigationData[n].timestamp +
                      "/" +
                      navigationData[n].customerID
                  );

                  const updates1 = {};
                  // updates1[`${sanitized}/id`] = sessionStorage.getItem("userUID");
                  // updates1[`${sanitized}/isScheduled`] = false;
                  // updates1[
                  //   `${sanitized}/message`
                  // ] = `Hi ${navigationData[n].customerName}, \nYour Van has arrived. (This is an automated messaged)`;
                  // updates1[`${sanitized}/user_type`] = "driver";

                  if (!sessionStorage.getItem(navigationData[n].timestamp)) {
                    iziToast.info({
                      timeout: false,
                      close: false,
                      overlay: true,
                      displayMode: "once",
                      // id: "question",
                      zindex: 10999,
                      title: "Arriving",
                      message: `You have arrived at ${navigationData[n].customerName}'s drop-off point, please click ARRIVED button to confirm arrival.`,
                      position: "center",
                      buttons: [
                        [
                          "<button><b>ARRIVED</b></button>",
                          function (instance, toast) {
                            instance.hide(
                              { transitionOut: "fadeOut" },
                              toast,
                              "button"
                            );

                            // updates1[`${sanitized2}/arrived`] = true;
                            updates1[`${sanitized2}/status`] = "arrived";
                            update(ref(database), updates1);
                            sessionStorage.setItem(
                              navigationData[n].timestamp,
                              "done"
                            );
                            sessionStorage.setItem(
                              "done",
                              sessionStorage.getItem("done") +
                                ";" +
                                navigationData[n].customerName
                            );
                          },
                          true,
                        ],
                        // [
                        //   "<button>NO</button>",
                        //   function (instance, toast) {
                        //     instance.hide(
                        //       { transitionOut: "fadeOut" },
                        //       toast,
                        //       "button"
                        //     );
                        //   },
                        // ],
                      ],
                      onClosing: function (instance, toast, closedBy) {
                        console.info("Closing | closedBy: " + closedBy);
                      },
                      onClosed: function (instance, toast, closedBy) {
                        console.info("Closed | closedBy: " + closedBy);
                      },
                    });
                  }

                  update(ref(database), updates1);
                }
              });

              console.log(
                "sessionStorage.getItem(done)",
                sessionStorage.getItem("done")
              );

              let done = sessionStorage?.getItem("done") ?? "";

              if (!done.includes(navigationData[n].customerName)) {
                let latlng = L.latLng(wp[d].lat, wp[d].lng);
                const popup = L.popup()
                  .setLatLng(latlng) // Display near the starting point
                  .setContent(
                    `<b>Drop-off:</b> ${navigationData[n].customerName}`
                  )
                  .addTo(map);
              }

              // Nearby in destination
              if (totalDistance / 1000 < distanceThreshold) {
                //   console.log("driver is nearby", driverUID);

                let sanitized = sanitizeText(
                  "activity/booking/" +
                    getCurrentDate("ymd-") +
                    "/drivers/" +
                    sessionStorage.getItem("userUID") +
                    "/" +
                    navigationData[n].timestamp +
                    "/" +
                    navigationData[n].customerID +
                    "/nearby"
                );

                const updates1 = {};
                updates1[sanitized] = (totalDistance / 1000).toFixed(2);

                update(ref(database), updates1);
              }

              console.log("arrivedDistance: ", totalDistance / 1000);
            }
            // PICKUP
            else if (
              wp[d].lat == navigationData[n].pickup_coordinates_lat &&
              wp[d].lng == navigationData[n].pickup_coordinates_lng
            ) {
              let done = sessionStorage?.getItem("done") ?? "";

              if (!done.includes(navigationData[n].customerName)) {
                let latlng = L.latLng(wp[d].lat, wp[d].lng);
                const popup = L.popup()
                  .setLatLng(latlng) // Display near the starting point
                  .setContent(
                    `<b>Pickup:</b> ${navigationData[n].customerName}`
                    // , ${(
                    //   totalTime / 60
                    // ).toFixed(2)} minutes`
                  )
                  .addTo(map);
              }

              // Nearby in Pickup
              if (totalDistance / 1000 < distanceThreshold) {
                //   console.log("driver is nearby", driverUID);

                let sanitized = sanitizeText(
                  "chats/users/" +
                    navigationData[n].customerID +
                    "/" +
                    sessionStorage.getItem("userUID") +
                    "/messages/" +
                    Date.now()
                );

                let sanitized2 = sanitizeText(
                  "chats/users/" +
                    navigationData[n].customerID +
                    "/" +
                    sessionStorage.getItem("userUID")
                );

                const updates1 = {};
                updates1[`${sanitized}/id`] = sessionStorage.getItem("userUID");
                updates1[`${sanitized}/isScheduled`] = false;
                updates1[
                  `${sanitized}/message`
                ] = `Hi ${navigationData[n].customerName}, \nYour driver is coming right up at the pickup point, please be ready.\nThank you! (This is an automated messaged)`;
                updates1[`${sanitized}/user_type`] = "driver";
                updates1[`${sanitized2}/nearby`] = true;

                update(ref(database), updates1);
              }

              if (totalDistance / 1000 < arrivedDistance) {
                let sanitized = sanitizeText(
                  "chats/users/" +
                    navigationData[n].customerID +
                    "/" +
                    sessionStorage.getItem("userUID") +
                    "/messages/" +
                    Date.now()
                );

                let sanitized2 = sanitizeText(
                  "chats/users/" +
                    navigationData[n].customerID +
                    "/" +
                    sessionStorage.getItem("userUID")
                );

                const updates1 = {};
                updates1[`${sanitized}/id`] = sessionStorage.getItem("userUID");
                updates1[`${sanitized}/isScheduled`] = false;
                updates1[
                  `${sanitized}/message`
                ] = `Hi ${navigationData[n].customerName}, \nYour Van has arrived. (This is an automated messaged)`;
                updates1[`${sanitized}/user_type`] = "driver";
                updates1[`${sanitized2}/arrived`] = true;

                update(ref(database), updates1);
              }
            }
            // }
          }
          // .openOn(map);
        }
      }
      // popups.push(popup); // Keep track of all popups

      // }
    });

    // const routes = e.routes;
    // const totalDistance = routes[0].summary.totalDistance; // Distance in meters
    // console.log(`Total Distance: ${totalDistance} meters`);

    // console.log(`Route ${index + 1}:`);
    // console.log(`- Distance: ${(totalDistance / 1000).toFixed(2)} km`);
    // console.log(`- Time: ${(totalTime / 60).toFixed(2)} minutes`);

    // // $("#distance").text(`Total Distance: ${totalDistance} meters`);
    // // sessionStorage.setItem("totalDistance", (totalDistance / 1000).toFixed(2));

    // // Optionally, display the distance on the map or in a popup
    // L.popup()
    //   .setLatLng(routes[0].waypoints[0].latLng) // Display near the starting point
    //   .setContent(`Total Distance: ${(totalDistance / 1000).toFixed(2)} km`)
    //   .openOn(map);
  });
}

function clearMarkers() {}

// Update coordinates function
function updateCoordinates() {
  if (allowReadingCoordinates) {
    var center = map.getCenter();
    console.log(
      "Lat: " + center.lat.toFixed(5) + ", Lng: " + center.lng.toFixed(5)
    );

    locationDetails["coordinates"].lat = center.lat;
    locationDetails["coordinates"].lng = center.lng;

    // Check location if within Antique
    var viewboxBounds = L.latLngBounds(
      // 121.781,10.361,123.225,12.004 left bottom right top
      L.latLng(12.004, 123.225), // North-East corner
      L.latLng(10.361, 121.781) // South-West corner
    );

    console.log(viewboxBounds, map.getBounds());
    // if (!map.getBounds().intersects(viewboxBounds)) {
    if (!viewboxBounds.contains(map.getBounds())) {
      console.log("Alert: Map has moved outside the viewbox!");
      iziToast.destroy();

      showHailingOverlay();
      iziToast.warning({
        title: "Map Outside",
        message: `Location selection is beyond the scope route of service, please try again`,
        icon: "fa fa-check",
        position: "topRight",
        timeout: 3000,
      });

      $("#input-pickup-location").val("");
      $("#input-dropoff-location").val("");
    }

    // var rectangle = L.rectangle(viewboxBounds, {
    //   color: "#ff7800", // Rectangle border color
    //   weight: 2, // Border thickness
    //   fillOpacity: 0.2, // Fill opacity
    // }).addTo(map);
  }
}
