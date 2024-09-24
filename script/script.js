let isListeningForLocation = false;

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
    // zoom: 19,
    // rotate: true,
  });

  var streetsLayer = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
    }
  );

  var control = L.Routing.control({
    waypoints: waypoints,
    routeWhileDragging: false,
  }).addTo(map);

  // Initialize geocoder control
  var geocoder = L.Control.geocoder({
    defaultMarkGeocode: false,
  })
    .on("markgeocode", function (e) {
      var latlng = e.geocode.center;
      console.log("Test Here", e);
      control.setWaypoints([
        // L.latLng(51.5, -0.09),  // Starting point
        waypoints[0],
        latlng, // End point from geocoder
      ]);

      let w = [
        waypoints[0],
        latlng,
        // L.latLng(11.6794671, 122.3640332),
      ];
      // w[0]["lat"] = waypoints[0];
      // w[0]["lng"] = latlng;
      // console.log(w);
      // console.log(waypoints[0], latlng, w[0]);

      // map.setView(latlng, 13);
      // map.options.minZoom = 8;
      // map.options.maxBounds = boundPoint(waypoints);

      fitWaypointsOnSearch(w);
      // console.log(w);
    })
    .addTo(map);

  control.on("routesfound", function (e) {
    const routes = e.routes;
    const totalDistance = routes[0].summary.totalDistance; // Distance in meters
    // console.log(`Total Distance: ${totalDistance} meters`);
    $("#distance").text(`Total Distance: ${totalDistance} meters`);

    // Optionally, display the distance on the map or in a popup
    L.popup()
      .setLatLng(routes[0].waypoints[0].latLng) // Display near the starting point
      .setContent(`Total Distance: ${(totalDistance / 1000).toFixed(2)} km`)
      .openOn(map);
  });

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
        style="outline-style: none; background-image: url(/assets/images/location.svg)"
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
}

function fitWaypointsNewValue(wp) {
  var bounds = L.latLngBounds([wp], [wp]);
  // map.fitBounds(bounds, { padding: [50, 50] }); // Adjust padding as needed
  // map.fitBounds(bounds); // Adjust padding as needed
  map.fitBounds(bounds, {
    // padding: [50, 50],       // Optional padding
    animate: true,           // Enable animation
    duration: 1.5            // Duration of the animation in seconds (default is 0.25)
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
  if (marker) {
    marker.setLatLng([latitude, longitude]);
  } else {
    marker = L.marker(
      [latitude, longitude] // { icon: customIcon }
    )
      .addTo(map)
      .bindPopup("Starting <b>Point</b>")
      .openPopup();
  }
}

// receiveLocation(14.370958441729798, 120.93901384235421);
// receiveLocation(11.380985878331284, 122.06387884559439);
// receiveLocation2(11.6837159, 122.3571831, true);
// initializeMap();

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

$("#test").on("click", () => {
  console.log("Test");
  fitWaypoints();
});

window.Test = (w) => {
  // map.setMaxBounds(boundPoint(w));
  map.panBy([1, 1]);
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
