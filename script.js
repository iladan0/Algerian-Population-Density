/* global L */

//var map = L.map('map').setView([28.2156279,2.9081565], 5.5);
var map = L.map("map", {
  center: [28.2156279, 2.9081565],
  zoomSnap: 0.25,
  zoom: 5.35
});

L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
  {
    maxZoom: 18,
    attribution: "Powered By &copy; LG Ltd",
    id: "mapbox/light-v9",
    tileSize: 512,
    zoomOffset: -1
  }
).addTo(map);

var btn1 = L.easyButton("fa-home", function() {
  map.setView([28.2156279, 2.9081565], 5.35, { animate: true, duration: 0.5 });
}).addTo(map);

// control that shows state info on hover
var info = L.control();

info.onAdd = function(map) {
  this._div = L.DomUtil.create("div", "info");
  this.update();
  return this._div;
};

info.update = function(props) {
  this._div.innerHTML =
    "<h4>DZ Population Density</h4>" +
    (props
      ? "<b>" +
        props.name +
        " " +
        props.city_code +
        "</b><br />" +
        "<b>" +
        props.name_ar +
        "</b><br />" +
        "<b>" +
        props.name_ber +
        "</b><br />" +
        props.density +
        " people / km<sup>2</sup>"
      : "Hover over a Wilaya");
};

info.addTo(map);

fetch(
  "https://cdn.glitch.com/a5b929f5-fe5d-426d-a329-766e45b8c268%2FgeoData.geojson?v=1583341026527"
)
  .then(function(response) {
    return response.json();
  })
  .then(function(json) {
    // this is where we do things with data
    doThingsWithData(json);
  });

// get color depending on population density value
function getColor(d) {
  return d > 1000
    ? "#800026"
    : d > 500
    ? "#BD0026"
    : d > 200
    ? "#E31A1C"
    : d > 100
    ? "#FC4E2A"
    : d > 50
    ? "#FD8D3C"
    : d > 20
    ? "#FEB24C"
    : d > 10
    ? "#FED976"
    : "#FFEDA0";
}

function style(feature) {
  return {
    weight: 2,
    opacity: 1,
    color: "white",
    dashArray: "3",
    fillOpacity: 0.7,
    fillColor: getColor(feature.properties.density)
  };
}

function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 4,
    color: "#666",
    dashArray: "",
    fillOpacity: 0.7
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }

  info.update(layer.feature.properties);
}

var geojson;

function resetHighlight(e) {
  geojson.resetStyle(e.target);
  info.update();
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature
  });
}
function doThingsWithData(json) {
  geojson = L.geoJson(json, {
    style: style,
    onEachFeature: onEachFeature
  }).addTo(map);
}

var legend = L.control({ position: "bottomright" });

legend.onAdd = function(map) {
  var div = L.DomUtil.create("div", "info legend"),
    grades = [0, 10, 20, 50, 100, 200, 500, 1000],
    labels = [],
    from,
    to;

  for (var i = 0; i < grades.length; i++) {
    from = grades[i];
    to = grades[i + 1];

    labels.push(
      '<i style="background:' +
        getColor(from + 1) +
        '"></i> ' +
        from +
        (to ? "&ndash;" + to : "+")
    );
  }

  div.innerHTML = labels.join("<br>");
  return div;
};

legend.addTo(map);
