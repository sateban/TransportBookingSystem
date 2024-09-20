var map; // Declare the map variable globally
var marker; // Declare the marker variable globally

let waypoints = [
  L.latLng(11.6837159, 122.3571831),
  // L.latLng(11.6794671, 122.3640332),
];

function initializeMap() {
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
    maxBounds: bounds,
    minZoom: 8, // zoom out -> the small the greater the zoom out, default useing 15
    maxZoom: 18,
    center: [0, 0],
    trackResize: 5,
    maxBoundsViscosity: 1.0,  // Optional: Makes the bounds more restrictive (0 to 1)
    zoomControl:true, 
    maxNativeZoom:28, 
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
    routeWhileDragging: true
  }).addTo(map);

    // Initialize geocoder control
    var geocoder = L.Control.geocoder({
      defaultMarkGeocode: false,
    })
      .on("markgeocode", function (e) {
        var latlng = e.geocode.center;
        console.log("Test Here", { latlng });
        control.setWaypoints([
          // L.latLng(51.5, -0.09),  // Starting point
          waypoints[0],
          latlng, // End point from geocoder
        ]);
        let w = [
          waypoints[0],
          latlng
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


  // Set the map bounds

  // Ensure the map stays within bounds when panning
  // map.on("drag", function () {
  //   var center = map.getCenter();
  //   console.log(center);
  //   var newBounds = L.latLngBounds(center, center);
  //   map.setMaxBounds(newBounds);
  // });

  // map.setMaxBounds(map.getBounds());

  // Initialize drawing tools
  // var drawnItems = new L.FeatureGroup();
  // map.addLayer(drawnItems);

  // var drawControl = new L.Control.Draw({
  //   edit: {
  //     featureGroup: drawnItems,
  //   },
  // });
  // map.addControl(drawControl);

  // // Handle drawing events
  // map.on(L.Draw.Event.CREATED, function (e) {
  //   var layer = e.layer;
  //   drawnItems.addLayer(layer);
  // });

  // Add toolbar functionality
  // document.getElementById("zoomIn").addEventListener("click", function () {
  //   map.zoomIn();
  // });

  // document.getElementById("zoomOut").addEventListener("click", function () {
  //   map.zoomOut();
  // });

  // var streetsLayer =
  // L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}{r}?access_token=pk.eyJ1IjoibGllZG1hbiIsImEiOiJjazIweGloNHAxOWZkM2NxZ3YyaHhtNXJ6In0._Hw--m4ilmGxw0YR39vmYA', {
  // 		attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>"
  // 	});

  // Add a click event listener to the map
  map.on("click", function (e) {
    // Get latitude and longitude
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    // Print latitude and longitude to the console
    console.log(`Latitude: ${lat}, Longitude: ${lng}`);
  });

  // Load and display GeoJSON data
  // fetch("Antique.geojson")
  // fetch("test.geojson")
  //   .then((response) => response.json())
  //   .then((data) => {
  //     L.geoJSON(data, {
  //       style: function (feature) {
  //         return {
  //           color: feature.properties.color || "blue",
  //           weight: 5,
  //           opacity: 0.7,
  //         };
  //       },
  //       onEachFeature: function (feature, layer) {
  //         layer.bindPopup(feature.properties.name || "No name");
  //         // console.log(feature.properties.name);
  //       },
  //     }).addTo(map);
  //   })
  //   .catch((error) => console.error("Error loading GeoJSON:", error));

  streetsLayer.addTo(map);

  fitWaypoints();
}

function receiveLocation2(latitude, longitude, inBrowserCall = false) {
  // document.getElementById("location").innerHTML =
  //   "Latitude: " +
  //   latitude +
  //   ", Longitude: " +
  //   longitude +
  //   " Random:" +
  //   Math.random();
  sessionStorage.setItem("lat", latitude);
  sessionStorage.setItem("lon", longitude);

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
  map.setView([latitude, longitude], 3);

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
      routeWhileDragging: true,
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

  // var latitude = 14.370958441729798;
  // var longitude = 120.93901384235421; // Replace with your longitude

  // var map = L.map("map").setView([latitude, longitude], 13);

  // var latitude = +latitude; //14.370958441729798;
  // var longitude = +longitude; //120.93901384235421; // Replace with your longitude

  // map.on('load', function() {
  //   map.invalidateSize();
  // });

  // var streetsLayer = L.tileLayer(
  //   "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  //   {
  //     // attribution:
  //     //   '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  //     maxZoom: 19,
  //   }
  // );

  // Initialize the map and set its view to the specified geographical coordinates and zoom level
  // Initialize the map and set its view to the specified geographical coordinates and zoom level
  //  var map = L.map('map').setView([51.505, -0.09], 13);

  // Add a tile layer to the map (OpenStreetMap)
  //  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  // 	 // attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  //  }).addTo(map);

  // var streetsLayer = L.vectorGrid.protobuf(" http://127.0.0.1:8000/tiles/{z}/{x}/{y}.pbf", {
  //   vectorTileLayerStyles: {
  //       myLayerName: {
  //           weight: 2,
  //           color: '#ff0000',
  //           fillColor: '#ffff00',
  //           fillOpacity: 0.5
  //       }
  //   },
  //   attribution: 'Map data &copy; contributors'
  // }).addTo(map);

  // var satelliteLayer = L.tileLayer(
  //   "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
  //   {
  //     // attribution: '&copy; <a href="https://maps.google.com">Google Maps</a>',
  //     maxZoom: 20,
  //   }
  // );

  // var terrainLayer = L.tileLayer(
  //   "https://{s}.tile.stamen.com/terrain/{z}/{x}/{y}.png",
  //   {
  //     attribution: '&copy; <a href="http://maps.stamen.com">Stamen Design</a>',
  //     maxZoom: 18,
  //   }
  // );

  // var trafficLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/traffic-day-v2/tiles/{z}/{x}/{y}?access_token=YOUR_MAPBOX_ACCESS_TOKEN', {
  // 	attribution: '&copy; <a href="https://www.mapbox.com/">Mapbox</a> contributors',
  // 	maxZoom: 19
  // });

  // var baseLayer =L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  // 	maxZoom: 19,
  // 	attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>'
  // }).addTo(map);

  // var terrain = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  // 	maxZoom: 20,
  // 	subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
  //   }).addTo(map);

  // Add a base layer group with options
  // var baseLayers = {
  //   Streets: streetsLayer,
  //   Satellite: satelliteLayer,
  // //   Terrain: terrain,
  // };

  // Add the default layer
  // streetsLayer.addTo(map);

  // Add layer control
  // L.control.layers(baseLayers).addTo(map);

  // Add a marker to the map
  // L.marker([latitude, longitude])
  //   .addTo(map)
  //   //  .bindPopup('This is a test')
  //   .bindPopup("A pretty CSS3 popup.<br> Easily customizable.")
  //   .openPopup();

  // receiveLocation(14.359, 120.9048901);

  // function receiveLocation(latitude, longitude) {
  //   document.getElementById('location').innerHTML = 'Latitude: ' + latitude + ', Longitude: ' + longitude + Math.random();
  //   sessionStorage.setItem("lat", latitude);
  //   sessionStorage.setItem("lon", longitude);
  // //receiveLocation(100, 100);

  // var latitude = +latitude; //14.370958441729798;
  // var longitude = +longitude; //120.93901384235421; // Replace with your longitude

  // // Initialize the map and set its view to the specified geographical coordinates and zoom level
  // var map = L.map("map").setView([latitude, longitude], 13);
  // map.invalidateSize();
  // document.getElementById('location').innerHTML += " Map Invalidate";
  // // Initialize the map and set its view to the specified geographical coordinates and zoom level
  // //  var map = L.map('map').setView([51.505, -0.09], 13);

  // // Add a tile layer to the map (OpenStreetMap)
  // //  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  // // 	 // attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  // //  }).addTo(map);

  // var streetsLayer =
  // L.tileLayer(
  // "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  // {
  // // attribution:
  // //   '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  // maxZoom: 19,
  // }
  // );

  // // var satelliteLayer = L.tileLayer(
  // //   "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
  // //   {
  // //     // attribution: '&copy; <a href="https://maps.google.com">Google Maps</a>',
  // //     maxZoom: 20,
  // //   }
  // // );

  // // var terrainLayer = L.tileLayer(
  // //   "https://{s}.tile.stamen.com/terrain/{z}/{x}/{y}.png",
  // //   {
  // //     attribution: '&copy; <a href="http://maps.stamen.com">Stamen Design</a>',
  // //     maxZoom: 18,
  // //   }
  // // );

  // // var trafficLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/traffic-day-v2/tiles/{z}/{x}/{y}?access_token=YOUR_MAPBOX_ACCESS_TOKEN', {
  // // 	attribution: '&copy; <a href="https://www.mapbox.com/">Mapbox</a> contributors',
  // // 	maxZoom: 19
  // // });

  // // var baseLayer =L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  // // 	maxZoom: 19,
  // // 	attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>'
  // // }).addTo(map);

  // // var terrain = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  // // 	maxZoom: 20,
  // // 	subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
  // //   }).addTo(map);

  // // Add a base layer group with options
  // // var baseLayers = {
  // //   Streets: streetsLayer,
  // //   Satellite: satelliteLayer,
  // // //   Terrain: terrain,
  // // };

  // // Add the default layer
  // //L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  // //    maxZoom: 19,
  // //}).addTo(map);
  // streetsLayer.addTo(map);
  // //terrain.addTo(map);
  // // Add layer control
  // // L.control.layers(baseLayers).addTo(map);

  // // Add a marker to the map
  // L.marker([latitude, longitude])
  // .addTo(map)
  // //  .bindPopup('This is a test')
  // .bindPopup("A pretty CSS3 popup.<br> Easily customizable.")
  // .openPopup();
}

// receiveLocation(14.370958441729798, 120.93901384235421);
// receiveLocation(11.380985878331284, 122.06387884559439);
receiveLocation2(11.6837159, 122.3571831, true);

function fitWaypoints() {
  var bounds = L.latLngBounds(waypoints);
  // map.fitBounds(bounds, { padding: [50, 50] }); // Adjust padding as needed
  map.fitBounds(bounds); // Adjust padding as needed

  // Optionally, set a maximum zoom level to prevent excessive zoom out
  //  var zoom = map.getBoundsZoom(bounds, true); // Calculate the zoom level for the bounds
  //  console.log(zoom);
  //  if (zoom > 15) { // Set your desired max zoom level
  map.setZoom(map.getZoom() - 2); // Ensure zoom doesn't go beyond 15
  //  }
  // L.map("map", {
  //   drawControl: false,
  //   minZoom: 1,
  //   maxZoom: 3,
  //   center: [0, 0],
  //   zoom: 4,
  //   rotate: true,
  // });
}

function fitWaypointsOnSearch(w) {
  var bounds = L.latLngBounds(w);
  // map.options.maxBounds = boundPoint(w);
  
  map.fitBounds(bounds); // Adjust padding as needed
  // Use fitBounds with padding to ensure the map fits correctly
  map.setZoom(map.getZoom() - 5); // Ensure zoom doesn't go beyond 15
  
  // map.fitBounds(bounds, {
  //   padding: [50, -50], // Adjust this padding (in pixels) as needed to avoid clipping
  // });
  // map.setMaxBounds(boundPoint(w));
  // var paddedBounds = bounds.pad(-0.5); // Slightly expand the bounds by 5%
  // map.setMaxBounds(paddedBounds);



}

function boundPoint(waypoints){
  let boundPoint = waypoints.map((point) => {
    let newLat = point.lat;
    let newLng = point.lng;
    return L.latLng(newLat, newLng);
  });

  return boundPoint;
}

$("#test").on("click", () => {
  console.log("Test");
  fitWaypoints();
});

var jsonData = {
  key1: "value1",
  key2: "value2",
  // Add more key-value pairs as needed
};

window.Test = (w) => {
  map.setMaxBounds(boundPoint(w));
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
