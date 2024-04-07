/* global L Papa */

/*
 * Script to display two tables from Google Sheets as point and geometry layers using Leaflet
 * The Sheets are then imported using PapaParse and overwrite the initially laded layers
 */

// the first is the geometry layer and the second the points
let geomURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQUXmfjpHl4sM-cUN-fiqrTEkf7JUYBiDqQasOLJVI2fnwiUZWxETnZZlXTva-1B4MYq53JTrkTdYiu/pub?output=csv";

window.addEventListener("DOMContentLoaded", init);

let map;

/*
 * init() is called when the page has loaded
 */

function init() {

  // Create Map, Center on Santa Cruz
  var mapOptions = {
    center: [37.03441286956093, -121.8925558355639],
    zoom: 10,
    zoomControl: false
  }
 map = L.map('map', mapOptions);

  // add Zoom Control
  L.control.zoom({
    position: 'bottomright'
  }).addTo(map);

  // add Basemap (Carto Positron)
  var geographyBasemap = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map);

  var labelsBasemap = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 16
}).addTo(map);

  map.on("click", function () {
    map.closePopup();
  });

  Papa.parse(geomURL, {
    download: true,
    header: true,
    complete: addGeoms,
  });

}


/*
 * Load Geometry Column
 */

function addGeoms(data) {
  data = data.data;

  let fc = {
    type: "FeatureCollection",
    features: [],
  };

  let promises = [];

  for (let row in data) {
    if (data[row].include == "y") {
      let geojsonUrl = data[row].geometry;
      let promise = fetch(geojsonUrl)
        .then(response => response.json())
        .then(geojsonData => {
          if (geojsonData.features && Array.isArray(geojsonData.features)) {
            geojsonData.features.forEach((feature) => {
              let properties = {
                name: data[row].name,
                description: data[row].description,

                // Rent Stablization [RS]
                RSscore: data[row].RSscore,
                RSexists: data[row].RSexists,
                RSyearcap: data[row].RSyearcap,
                RSexempt: data[row].RSexempt,
                RScondo: data[row].RScondo,
                RSjustcause: data[row].RSjustcause,
                RScolor: data[row].RScolor,

                // Inclusionary Zoning - Owner [IZO]
                IZOscore: data[row].IZOscore,
                IZOrequired: data[row].IZOrequired,
                IZOsystem: data[row].IZOsystem,
                IZOenhanced: data[row].IZOenhanced,
                IZOaffordable: data[row].IZOaffordable,
                IZOcolor: data[row].IZOcolor,

                // Inclusionary Zoning - Renter [IZR]
                IZRscore: data[row].IZRscore,
                IZRrequired: data[row].IZRrequired,
                IZRsystem: data[row].IZRsystem,
                IZRenhanced: data[row].IZRenhanced,
                IZRaffordable: data[row].IZRaffordable,
                IZRcolor: data[row].IZRcolor,

                // Condo Conversion [CC]
                CCscore: data[row].CCscore,
                CCexists: data[row].CCexists,
                CCnew: data[row].CCnew,
                CClimit: data[row].CClimit,
                CCfees: data[row].CCfees,
                CCreplacement: data[row].CCreplacement,
                CCrelocation: data[row].CCrelocation,
                CCcolor: data[row].CCcolor,

                // Opportunity to Purchase Act [OPA]
                OPAscore: data[row].OPAscore,
                COPAexists: data[row].COPAexists,
                COPAallaff: data[row].COPAallaff,
                COPAfunding: data[row].COPAfunding,
                TOPAexists: data[row].TOPAexists,
                TOPAallaff: data[row].TOPAallaff,
                TOPAfunding: data[row].TOPAfunding,
                OPAcolor: data[row].OPAcolor,

                // Community Land Trust [CLT]
                CLTscore: data[row].CLTscore,
                CLTexists: data[row].CLTexists,
                CLTportfolio: data[row].CLTportfolio,
                CLTiz: data[row].CLTiz,
                CLTmunicipal: data[row].CLTmunicipal,
                CLTelement: data[row].CLTelement,
                CLTfunding: data[row].CLTfunding,
                CLTcolor: data[row].CLTcolor,

                // Just Cause Eviction [JCE]
                JCEscore: data[row].JCEscore,
                JCEexists: data[row].JCEexists,
                JCEmonths: data[row].JCEmonths,
                JCEexempt: data[row].JCEcover,
                JCEmonitoring: data[row].JCEmonitoring,
                JCEpenalties: data[row].JCEpenalties,
                JCErelocation: data[row].JCErelocation,
                JCEnotice: data[row].JCEnotice,
                JCEcolor: data[row].JCEcolor,

              };

              let newFeature = {
                type: "Feature",
                geometry: feature.geometry,
                properties: properties,
              };
              fc.features.push(newFeature);
            });
          } else {
            console.error("Features array is missing or invalid in GeoJSON data fetched from the external URL.");
          }
        });

      promises.push(promise);
    }
  }

  Promise.all(promises).then(() => {
    console.log(fc);

    
    
/*
* Styling
*/

function geomStyleRS(feature) {
  let fillColor = feature.properties.RScolor || "#000000";
  return {
    fillColor: fillColor,
    weight: 0,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.8
  };
}

function geomStyleJCE(feature) {
  let fillColor = feature.properties.JCEcolor || "#000000";
  return {
    fillColor: fillColor,
    weight: 0,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.8
  };
}

function geomStyleCLT(feature) {
  let fillColor = feature.properties.CLTcolor || "#000000";
  return {
    fillColor: fillColor,
    weight: 0,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.8
  };
}

function geomStyleOPA(feature) {
  let fillColor = feature.properties.OPAcolor || "##000000";
  return {
    fillColor: fillColor,
    weight: 0,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.8
  };
}

function geomStyleCC(feature) {
  let fillColor = feature.properties.CCcolor || "##000000";
  return {
    fillColor: fillColor,
    weight: 0,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.8
  };
}

function geomStyleIZO(feature) {
  let fillColor = feature.properties.IZOcolor || "##000000";
  return {
    fillColor: fillColor,
    weight: 0,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.8
  };
}

function geomStyleIZR(feature) {
  let fillColor = feature.properties.IZRcolor || "##000000";
  return {
    fillColor: fillColor,
    weight: 0,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.8
  };
}

  let geomHoverStyle = { color: "black", weight: 0 };



/*
* Layers
*/

  // Rent Stabalization
  let rsGeojsonLayer = L.geoJSON(fc, {
    onEachFeature: function (feature, layer) {
      layer.on({
        mouseout: function (e) {
             e.target.setStyle(geomStyleRS);
        },
        // mouseover: function (e) {
        //      e.target.setStyle(geomHoverStyle);
        // },
        click: function (e) {
          // Create the popup content with table formatting
          var popupContent = `
              <table class="popup-table">
                  <tr>
                      <td><strong>Name:</strong></td>
                      <td>${e.target.feature.properties.name}</td>
                  </tr>
                  <tr>
                      <td><strong>Description:</strong></td>
                      <td>${e.target.feature.properties.description}</td>
                  </tr>
                  <tr>
                      <td><strong>Score:</strong></td>
                      <td>${e.target.feature.properties.RSscore}</td>
                  </tr>
                  <tr>
                      <td><strong>Exists:</strong></td>
                      <td>${e.target.feature.properties.RSexists}</td>
                  </tr>
                  <tr>
                      <td><strong>Year Cap:</strong></td>
                      <td>${e.target.feature.properties.RSyearcap}</td>
                  </tr>
                  <tr>
                      <td><strong>Exempt:</strong></td>
                      <td>${e.target.feature.properties.RSexempt}</td>
                  </tr>
                  <tr>
                      <td><strong>Condo:</strong></td>
                      <td>${e.target.feature.properties.RScondo}</td>
                  </tr>
                  <tr>
                      <td><strong>Just Cause:</strong></td>
                      <td>${e.target.feature.properties.RSjustcause}</td>
                  </tr>
              </table>
          `;
      
          // Bind the formatted popup content to the target feature and open the popup
          e.target.bindPopup(popupContent).openPopup();
      
          // Prevent propagation of the click event
          L.DomEvent.stopPropagation(e);
      },
      });
    },
    style: geomStyleRS,
  });rsGeojsonLayer.addTo(map);

  // Just Cause Eviction
let jceGeojsonLayer = L.geoJSON(fc, {
  onEachFeature: function (feature, layer) {
    layer.on({
      mouseout: function (e) {
           e.target.setStyle(geomStyleJCE);
      },
      // mouseover: function (e) {
      //      e.target.setStyle(geomHoverStyle);
      // },
      click: function (e) {
        e.target.bindPopup(
            "<p>Name: " + e.target.feature.properties.name + "</p>" +
            "<p>Description: " + e.target.feature.properties.description + "</p>" +
            "<p>Score: " + e.target.feature.properties.JCEscore + "</p>" +
            "<p>Exists: " + e.target.feature.properties.JCEexists + "</p>" +
            "<p>Months: " + e.target.feature.properties.JCEmonths + "</p>" +
            "<p>Exempt: " + e.target.feature.properties.JCEexempt + "</p>" +
            "<p>Monitoring: " + e.target.feature.properties.JCEmonitoring + "</p>" +
            "<p>Penalties: " + e.target.feature.properties.JCEpenalties + "</p>" +
            "<p>Relocation: " + e.target.feature.properties.JCErelocation + "</p>" +
            "<p>Notice: " + e.target.feature.properties.JCEnotice + "</p>" 
        ).openPopup();
        L.DomEvent.stopPropagation(e);
       },
    });
  },
  style: geomStyleJCE,
});

// Community Land Trust
let cltGeojsonLayer = L.geoJSON(fc, {
  onEachFeature: function (feature, layer) {
    layer.on({
      mouseout: function (e) {
           e.target.setStyle(geomStyleCLT);
      },
      // mouseover: function (e) {
      //      e.target.setStyle(geomHoverStyle);
      // },
      click: function (e) {
        e.target.bindPopup(
            "<p>Name: " + e.target.feature.properties.name + "</p>" +
            "<p>Description: " + e.target.feature.properties.description + "</p>" +
            "<p>Score: " + e.target.feature.properties.CLTscore + "</p>" +
            "<p>Exists: " + e.target.feature.properties.CLTexists + "</p>" +
            "<p>Portfolio: " + e.target.feature.properties.CLTportfolio + "</p>" +
            "<p>IZ: " + e.target.feature.properties.CLTiz + "</p>" +
            "<p>Municipal: " + e.target.feature.properties.CLTmunicipal + "</p>" +
            "<p>Element: " + e.target.feature.properties.CLTelement + "</p>" +
            "<p>Funding: " + e.target.feature.properties.CLTfunding + "</p>"
        ).openPopup();
        L.DomEvent.stopPropagation(e);
       },
    });
  },
  style: geomStyleCLT,
});

// Opportunity to Purchase Act
let opaGeojsonLayer = L.geoJSON(fc, {
  onEachFeature: function (feature, layer) {
    layer.on({
      mouseout: function (e) {
           e.target.setStyle(geomStyleOPA);
      },
      // mouseover: function (e) {
      //      e.target.setStyle(geomHoverStyle);
      // },
      click: function (e) {
        e.target.bindPopup(
            "<p>Name: " + e.target.feature.properties.name + "</p>" +
            "<p>Description: " + e.target.feature.properties.description + "</p>" +
            "<p>Score: " + e.target.feature.properties.OPAscore + "</p>" +
            "<p>COPA Exists: " + e.target.feature.properties.COPAexists + "</p>" +
            "<p>COPA All / Aff: " + e.target.feature.properties.COPAallaff + "</p>" +
            "<p>COPA Funding: " + e.target.feature.properties.COPAfunding + "</p>" +
            "<p>TOPA Exists: " + e.target.feature.properties.TOPAexists + "</p>" +
            "<p>TOPA All / Aff: " + e.target.feature.properties.TOPAallaff + "</p>" +
            "<p>TOPA Funding: " + e.target.feature.properties.TOPAfunding + "</p>"
        ).openPopup();
        L.DomEvent.stopPropagation(e);
       },
    });
  },
  style: geomStyleOPA,
});

// Condo Conversion
let ccGeojsonLayer = L.geoJSON(fc, {
  onEachFeature: function (feature, layer) {
    layer.on({
      mouseout: function (e) {
           e.target.setStyle(geomStyleCC);
      },
      // mouseover: function (e) {
      //      e.target.setStyle(geomHoverStyle);
      // },
      click: function (e) {
        e.target.bindPopup(
            "<p>Name: " + e.target.feature.properties.name + "</p>" +
            "<p>Description: " + e.target.feature.properties.description + "</p>" +
            "<p>Score: " + e.target.feature.properties.CCscore + "</p>" +
            "<p>Exists: " + e.target.feature.properties.CCexists + "</p>" +
            "<p>New: " + e.target.feature.properties.CCnew + "</p>" +
            "<p>Limit: " + e.target.feature.properties.CClimit + "</p>" +
            "<p>Fees: " + e.target.feature.properties.CCfees + "</p>" +
            "<p>Replacement: " + e.target.feature.properties.CCreplacement + "</p>" +
            "<p>Relocation: " + e.target.feature.properties.CCrelocation + "</p>"
        ).openPopup();
        L.DomEvent.stopPropagation(e);
       },
    });
  },
  style: geomStyleCC,
});

// Inclusionary Zoning - Owner
let izoGeojsonLayer = L.geoJSON(fc, {
  onEachFeature: function (feature, layer) {
    layer.on({
      mouseout: function (e) {
           e.target.setStyle(geomStyleIZO);
      },
      // mouseover: function (e) {
      //      e.target.setStyle(geomHoverStyle);
      // },
      click: function (e) {
        e.target.bindPopup(
            "<p>Name: " + e.target.feature.properties.name + "</p>" +
            "<p>Description: " + e.target.feature.properties.description + "</p>" +
            "<p>IZO Score: " + e.target.feature.properties.IZOscore + "</p>" +
            "<p>IZO Required: " + e.target.feature.properties.IZOrequired + "</p>" +
            "<p>IZO System: " + e.target.feature.properties.IZOsystem + "</p>" +
            "<p>IZO Enhanced: " + e.target.feature.properties.IZOenhanced + "</p>" +
            "<p>IZO Affordable: " + e.target.feature.properties.IZOaffordable + "</p>"
        ).openPopup();
        L.DomEvent.stopPropagation(e);
       },
    });
  },
  style: geomStyleIZO,
});

// Inclusionary Zoning - Renter
let izrGeojsonLayer = L.geoJSON(fc, {
  onEachFeature: function (feature, layer) {
    layer.on({
      mouseout: function (e) {
           e.target.setStyle(geomStyleIZR);
      },
      // mouseover: function (e) {
      //      e.target.setStyle(geomHoverStyle);
      // },
      click: function (e) {
        e.target.bindPopup(
            "<p>Name: " + e.target.feature.properties.name + "</p>" +
            "<p>Description: " + e.target.feature.properties.description + "</p>" +
            "<p>IZR Score: " + e.target.feature.properties.IZRscore + "</p>" +
            "<p>IZR Required: " + e.target.feature.properties.IZRrequired + "</p>" +
            "<p>IZR System: " + e.target.feature.properties.IZRsystem + "</p>" +
            "<p>IZR Enhanced: " + e.target.feature.properties.IZRenhanced + "</p>" +
            "<p>IZR Affordable: " + e.target.feature.properties.IZRaffordable + "</p>"
        ).openPopup();
        L.DomEvent.stopPropagation(e);
       },
    });
  },
  style: geomStyleIZR,
});

var baseMaps = {
    "Rent Stablization": rsGeojsonLayer,
    "Inclusionary Zoning - Owner": izoGeojsonLayer, 
    "Inclusionary Zoning - Renter": izrGeojsonLayer, 
    "Condo Conversion": ccGeojsonLayer, 
    "Opportunity to Purchase Act": opaGeojsonLayer, 
    "Community Land Trusts": cltGeojsonLayer, 
    "Just Cause Eviction": jceGeojsonLayer
  };

// Create the control and add it to the map;
var control = L.control.layers(baseMaps, null, { collapsed: false, position: 'topleft' });
control.addTo(map);

// Call the getContainer routine.
var htmlObject = control.getContainer();
 
// Get the desired parent node.
var sidebar = document.getElementById('sidebar');

// Finally append the control container to the sidebar.
sidebar.appendChild(htmlObject);

})
}


/*
 * addPoints is a bit simpler, as no GeoJSON is needed for the points
 */
function addPoints(data) {
  data = data.data;
  let pointGroupLayer = L.layerGroup().addTo(map);

  // Choose marker type. Options are:
  // (these are case-sensitive, defaults to marker!)
  // marker: standard point with an icon
  // circleMarker: a circle with a radius set in pixels
  // circle: a circle with a radius set in meters
  let markerType = "marker";

  // Marker radius
  // Wil be in pixels for circleMarker, metres for circle
  // Ignore for point
  let markerRadius = 100;

  for (let row = 0; row < data.length; row++) {
    let marker;
    if (markerType == "circleMarker") {
      marker = L.circleMarker([data[row].lat, data[row].lon], {
        radius: markerRadius,
      });
    } else if (markerType == "circle") {
      marker = L.circle([data[row].lat, data[row].lon], {
        radius: markerRadius,
      });
    } else {
      marker = L.marker([data[row].lat, data[row].lon]);
    }
    marker.addTo(pointGroupLayer);

    // AwesomeMarkers is used to create fancier icons
    let icon = L.AwesomeMarkers.icon({
      icon: "info-circle",
      iconColor: "white",
      markerColor: data[row].color,
      prefix: "fa",
      extraClasses: "fa-rotate-0",
    });
    if (!markerType.includes("circle")) {
      marker.setIcon(icon);
    }
  }
}

/*
 * Accepts any GeoJSON-ish object and returns an Array of
 * GeoJSON Features. Attempts to guess the geometry type
 * when a bare coordinates Array is supplied.
 */
function parseGeom(gj) {
  // FeatureCollection
  if (gj.type == "FeatureCollection") {
    return gj.features;
  }

  // Feature
  else if (gj.type == "Feature") {
    return [gj];
  }

  // Geometry
  else if ("type" in gj) {
    return [{ type: "Feature", geometry: gj }];
  }

  // Coordinates
  else {
    let type;
    if (typeof gj[0] == "number") {
      type = "Point";
    } else if (typeof gj[0][0] == "number") {
      type = "LineString";
    } else if (typeof gj[0][0][0] == "number") {
      type = "Polygon";
    } else {
      type = "MultiPolygon";
    }
    return [{ type: "Feature", geometry: { type: type, coordinates: gj } }];
  }
}
