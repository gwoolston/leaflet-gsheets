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
                IZOpreference: data[row].IZOpreference,
                IZOcolor: data[row].IZOcolor,

                // Inclusionary Zoning - Renter [IZR]
                IZRscore: data[row].IZRscore,
                IZRrequired: data[row].IZRrequired,
                IZRsystem: data[row].IZRsystem,
                IZRenhanced: data[row].IZRenhanced,
                IZRaffordable: data[row].IZRaffordable,
                IZRpreference: data[row].IZRpreference,
                IZRcolor: data[row].IZRcolor,

                // Condo Conversion [CC]
                CCscore: data[row].CCscore,
                CCexists: data[row].CCexists,
                CCnew: data[row].CCnew,
                CClimit: data[row].CClimit,
                CCfees: data[row].CCfees,
                CCreplacement: data[row].CCreplacement,
                CCrelocation: data[row].CCrelocation,
                CCnotice: data[row].CCnotice,
                CCvulnerable: data[row].CCvulnerable,
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
                JCEretalitory: data[row].JCEretalitory,
                JCEstabilization: data[row].JCEstabilization,
                JCElegal: data[row].JCElegal,
                JCEcolor: data[row].JCEcolor,

                // Housing Impact [HI]
                HIscore: data[row].HIscore,
                HIrexists: data[row].HIrexists,
                HInrexists: data[row].HInrexists,
                HIcolor: data[row].HIcolor,

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
    weight: 0.6,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.8
  };
}

function geomStyleJCE(feature) {
  let fillColor = feature.properties.JCEcolor || "#000000";
  return {
    fillColor: fillColor,
    weight: 0.6,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.8
  };
}

function geomStyleCLT(feature) {
  let fillColor = feature.properties.CLTcolor || "#000000";
  return {
    fillColor: fillColor,
    weight: 0.6,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.8
  };
}

function geomStyleOPA(feature) {
  let fillColor = feature.properties.OPAcolor || "##000000";
  return {
    fillColor: fillColor,
    weight: 0.6,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.8
  };
}

function geomStyleCC(feature) {
  let fillColor = feature.properties.CCcolor || "##000000";
  return {
    fillColor: fillColor,
    weight: 0.6,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.8
  };
}

function geomStyleIZO(feature) {
  let fillColor = feature.properties.IZOcolor || "##000000";
  return {
    fillColor: fillColor,
    weight: 0.6,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.8
  };
}

function geomStyleIZR(feature) {
  let fillColor = feature.properties.IZRcolor || "##000000";
  return {
    fillColor: fillColor,
    weight: 0.6,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.8
  };
}

function geomStyleHI(feature) {
  let fillColor = feature.properties.HIcolor || "##000000";
  return {
    fillColor: fillColor,
    weight: 0.6,
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
        click: function (e) {
          // Create the popup content with table formatting
          var popupContent = `
              <table class="popup-table">
                  <tr>
                      <td><strong>Name:</strong></td>
                      <td>${e.target.feature.properties.name}</td>
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
      click: function (e) {
        // Create the popup content with table formatting
        var popupContent = `
            <table class="popup-table">
                <tr>
                    <td><strong>Name:</strong></td>
                    <td>${e.target.feature.properties.name}</td>
                </tr>
                <tr>
                    <td><strong>Score:</strong></td>
                    <td>${e.target.feature.properties.JCEscore}</td>
                </tr>
                <tr>
                    <td><strong>Exists:</strong></td>
                    <td>${e.target.feature.properties.JCEexists}</td>
                </tr>
                <tr>
                    <td><strong>Months:</strong></td>
                    <td>${e.target.feature.properties.JCEmonths}</td>
                </tr>
                <tr>
                    <td><strong>Exempt:</strong></td>
                    <td>${e.target.feature.properties.JCEexempt}</td>
                </tr>
                <tr>
                    <td><strong>Monitoring:</strong></td>
                    <td>${e.target.feature.properties.JCEmonitoring}</td>
                </tr>
                <tr>
                    <td><strong>Penalties:</strong></td>
                    <td>${e.target.feature.properties.JCEpenalties}</td>
                </tr>
                <tr>
                    <td><strong>Relocation:</strong></td>
                    <td>${e.target.feature.properties.JCErelocation}</td>
                </tr>
                <tr>
                    <td><strong>Notice:</strong></td>
                    <td>${e.target.feature.properties.JCEnotice}</td>
                </tr>
                <tr>
                    <td><strong>Retalitory:</strong></td>
                    <td>${e.target.feature.properties.JCEretalitory}</td>
                </tr>
                <tr>
                    <td><strong>Rent Stabilization:</strong></td>
                    <td>${e.target.feature.properties.JCEstabilization}</td>
                </tr>
                <tr>
                    <td><strong>Legal Counseling:</strong></td>
                    <td>${e.target.feature.properties.JCElegal}</td>
                </tr>
            </table>
        `;
    
        // Bind the formatted popup content to the target feature and open the popup
        e.target.bindPopup(popupContent).openPopup();
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
      click: function (e) {
        // Create the popup content with table formatting
        var popupContent = `
            <table class="popup-table">
                <tr>
                    <td><strong>Name:</strong></td>
                    <td>${e.target.feature.properties.name}</td>
                </tr>
                <tr>
                    <td><strong>Score:</strong></td>
                    <td>${e.target.feature.properties.CLTscore}</td>
                </tr>
                <tr>
                    <td><strong>Exists:</strong></td>
                    <td>${e.target.feature.properties.CLTexists}</td>
                </tr>
                <tr>
                    <td><strong>Portfolio:</strong></td>
                    <td>${e.target.feature.properties.CLTportfolio}</td>
                </tr>
                <tr>
                    <td><strong>IZ:</strong></td>
                    <td>${e.target.feature.properties.CLTiz}</td>
                </tr>
                <tr>
                    <td><strong>Municipal:</strong></td>
                    <td>${e.target.feature.properties.CLTmunicipal}</td>
                </tr>
                <tr>
                    <td><strong>Element:</strong></td>
                    <td>${e.target.feature.properties.CLTelement}</td>
                </tr>
                <tr>
                    <td><strong>Funding:</strong></td>
                    <td>${e.target.feature.properties.CLTfunding}</td>
                </tr>
            </table>
        `;
    
        // Bind the formatted popup content to the target feature and open the popup
        e.target.bindPopup(popupContent).openPopup();
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
        // Create the popup content with table formatting
        var popupContent = `
            <table class="popup-table">
                <tr>
                    <td><strong>Name:</strong></td>
                    <td>${e.target.feature.properties.name}</td>
                </tr>
                <tr>
                    <td><strong>Score:</strong></td>
                    <td>${e.target.feature.properties.OPAscore}</td>
                </tr>
                <tr>
                    <td><strong>COPA Exists:</strong></td>
                    <td>${e.target.feature.properties.COPAexists}</td>
                </tr>
                <tr>
                    <td><strong>COPA All / Aff:</strong></td>
                    <td>${e.target.feature.properties.COPAallaff}</td>
                </tr>
                <tr>
                    <td><strong>COPA Funding:</strong></td>
                    <td>${e.target.feature.properties.COPAfunding}</td>
                </tr>
                <tr>
                    <td><strong>TOPA Exists:</strong></td>
                    <td>${e.target.feature.properties.TOPAexists}</td>
                </tr>
                <tr>
                    <td><strong>TOPA All / Aff:</strong></td>
                    <td>${e.target.feature.properties.TOPAallaff}</td>
                </tr>
                <tr>
                    <td><strong>TOPA Funding:</strong></td>
                    <td>${e.target.feature.properties.TOPAfunding}</td>
                </tr>
            </table>
        `;
    
        // Bind the formatted popup content to the target feature and open the popup
        e.target.bindPopup(popupContent).openPopup();
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
        // Create the popup content with table formatting
        var popupContent = `
            <table class="popup-table">
                <tr>
                    <td><strong>Name:</strong></td>
                    <td>${e.target.feature.properties.name}</td>
                </tr>
                <tr>
                    <td><strong>Score:</strong></td>
                    <td>${e.target.feature.properties.CCscore}</td>
                </tr>
                <tr>
                    <td><strong>Exists:</strong></td>
                    <td>${e.target.feature.properties.CCexists}</td>
                </tr>
                <tr>
                    <td><strong>New:</strong></td>
                    <td>${e.target.feature.properties.CCnew}</td>
                </tr>
                <tr>
                    <td><strong>Limit:</strong></td>
                    <td>${e.target.feature.properties.CClimit}</td>
                </tr>
                <tr>
                    <td><strong>Fees:</strong></td>
                    <td>${e.target.feature.properties.CCfees}</td>
                </tr>
                <tr>
                    <td><strong>Replacement:</strong></td>
                    <td>${e.target.feature.properties.CCreplacement}</td>
                </tr>
                <tr>
                    <td><strong>Relocation:</strong></td>
                    <td>${e.target.feature.properties.CCrelocation}</td>
                </tr>
                <tr>
                    <td><strong>Special Notice:</strong></td>
                    <td>${e.target.feature.properties.CCnotice}</td>
                </tr>
                <tr>
                    <td><strong>No Displacing Vulnerable:</strong></td>
                    <td>${e.target.feature.properties.CCvulnerable}</td>
                </tr>
            </table>
        `;
    
        // Bind the formatted popup content to the target feature and open the popup
        e.target.bindPopup(popupContent).openPopup();
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
      click: function (e) {
        // Create the popup content with table formatting
        var popupContent = `
            <table class="popup-table">
                <tr>
                    <td><strong>Name:</strong></td>
                    <td>${e.target.feature.properties.name}</td>
                </tr>
                <tr>
                    <td><strong>IZO Score:</strong></td>
                    <td>${e.target.feature.properties.IZOscore}</td>
                </tr>
                <tr>
                    <td><strong>IZO Required:</strong></td>
                    <td>${e.target.feature.properties.IZOrequired}</td>
                </tr>
                <tr>
                    <td><strong>IZO System:</strong></td>
                    <td>${e.target.feature.properties.IZOsystem}</td>
                </tr>
                <tr>
                    <td><strong>IZO Enhanced:</strong></td>
                    <td>${e.target.feature.properties.IZOenhanced}</td>
                </tr>
                <tr>
                    <td><strong>IZO Preference:</strong></td>
                    <td>${e.target.feature.properties.IZOpreference}</td>
                </tr>
                <tr>
                    <td><strong>IZO Affordable:</strong></td>
                    <td>${e.target.feature.properties.IZOaffordable}</td>
                </tr>
            </table>
        `;
    
        // Bind the formatted popup content to the target feature and open the popup
        e.target.bindPopup(popupContent).openPopup();
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
      click: function (e) {
        // Create the popup content with table formatting
        var popupContent = `
            <table class="popup-table">
                <tr>
                    <td><strong>Name:</strong></td>
                    <td>${e.target.feature.properties.name}</td>
                </tr>
                <tr>
                    <td><strong>IZR Score:</strong></td>
                    <td>${e.target.feature.properties.IZRscore}</td>
                </tr>
                <tr>
                    <td><strong>IZR Required:</strong></td>
                    <td>${e.target.feature.properties.IZRrequired}</td>
                </tr>
                <tr>
                    <td><strong>IZR System:</strong></td>
                    <td>${e.target.feature.properties.IZRsystem}</td>
                </tr>
                <tr>
                    <td><strong>IZR Enhanced:</strong></td>
                    <td>${e.target.feature.properties.IZRenhanced}</td>
                </tr>
                <tr>
                    <td><strong>IZR Preference:</strong></td>
                    <td>${e.target.feature.properties.IZRpreference}</td>
                </tr>
                <tr>
                    <td><strong>IZR Affordable:</strong></td>
                    <td>${e.target.feature.properties.IZRaffordable}</td>
                </tr>
            </table>
        `;
    
        // Bind the formatted popup content to the target feature and open the popup
        e.target.bindPopup(popupContent).openPopup();
        L.DomEvent.stopPropagation(e);
       },
    });
  },
  style: geomStyleIZR,
});

// Inclusionary Zoning - Renter
let hiGeojsonLayer = L.geoJSON(fc, {
  onEachFeature: function (feature, layer) {
    layer.on({
      mouseout: function (e) {
           e.target.setStyle(geomStyleHI);
      },
      click: function (e) {
        // Create the popup content with table formatting
        var popupContent = `
            <table class="popup-table">
                <tr>
                    <td><strong>Name:</strong></td>
                    <td>${e.target.feature.properties.name}</td>
                </tr>
                <tr>
                    <td><strong>HI Score:</strong></td>
                    <td>${e.target.feature.properties.HIscore}</td>
                </tr>
                <tr>
                    <td><strong>Residential:</strong></td>
                    <td>${e.target.feature.properties.HIrexists}</td>
                </tr>
                <tr>
                    <td><strong>Non-Residential:</strong></td>
                    <td>${e.target.feature.properties.HInrexists}</td>
                </tr>
            </table>
        `;
    
        // Bind the formatted popup content to the target feature and open the popup
        e.target.bindPopup(popupContent).openPopup();
        L.DomEvent.stopPropagation(e);
       },
    });
  },
  style: geomStyleHI,
});

var protectionLayers = {
  "Rent Stabilization": rsGeojsonLayer,
  "Just Cause Eviction": jceGeojsonLayer
};

var productionLayers = {
  "Inclusionary Zoning - Owner": izoGeojsonLayer,
  "Inclusionary Zoning - Renter": izrGeojsonLayer,
  "Housing Impact / Linkage Fees": hiGeojsonLayer
};

var preservationLayers = {
  "Condo Conversion": ccGeojsonLayer,
  "Community Land Trusts": cltGeojsonLayer,
  "TOPA / COPA": opaGeojsonLayer
};

var baseMaps = {};
var currentLayer = rsGeojsonLayer; // Set the initial layer
map.addLayer(currentLayer); // Add the initial layer to the map

var control = L.control.layers(baseMaps, null, { collapsed: false, position: 'topleft' });
control.addTo(map);

var htmlObject = control.getContainer();
var sidebar = document.getElementById('sidebar');

function addRadioButtons(layers, headingText, defaultLayer) {
  var heading = document.createElement('h4');
  heading.innerHTML = headingText;
  sidebar.appendChild(heading);

  for (var key in layers) {
      var input = document.createElement('input');
      input.type = 'radio';
      input.name = 'layerGroup';
      input.checked = layers[key] === defaultLayer; // Check if it's the default layer
      input.onchange = (function(layer) {
          return function() {
              if (currentLayer) {
                  map.removeLayer(currentLayer);
              }
              map.addLayer(layer);
              currentLayer = layer;
          };
      })(layers[key]);

      var label = document.createElement('label');
      label.appendChild(input);
      label.appendChild(document.createTextNode(key));
      sidebar.appendChild(label);
      sidebar.appendChild(document.createElement('br'));
  }
}

addRadioButtons(protectionLayers, "Protection:", rsGeojsonLayer);
addRadioButtons(productionLayers, "Production:", null);
addRadioButtons(preservationLayers, "Preservation:", null);




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
