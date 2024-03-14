/* global L Papa */

/*
 * Script to display two tables from Google Sheets as point and geometry layers using Leaflet
 * The Sheets are then imported using PapaParse and overwrite the initially laded layers
 */


// the first is the geometry layer and the second the points
let geomURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQUXmfjpHl4sM-cUN-fiqrTEkf7JUYBiDqQasOLJVI2fnwiUZWxETnZZlXTva-1B4MYq53JTrkTdYiu/pub?output=csv";

// let pointsURL =
//   "https://docs.google.com/spreadsheets/d/e/2PACX-1vSau6Ahj2C_c206-YM5Wp_faUseKzmM3uoxdmXGjUv_cGpWabeee5kyZaIxzxqAEtRNKbhIsYh4BJMJ/pub?output=csv";

window.addEventListener("DOMContentLoaded", init);

let map;
// let sidebar;
// let panelID = "my-info-panel";

/*
 * init() is called when the page has loaded
 */
function init() {

  // Create Map, Center on Santa Cruz
  var mapOptions = {
    center: [37.06896802407835, -121.79781540900152],
    zoom: 10,
    zoomControl: false
  }
 map = L.map('map', mapOptions);

  // add Zoom Control
  L.control.zoom({
    position: 'bottomright'
  }).addTo(map);

  // add Basemap (Carto Positron)
  L.tileLayer(
    "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png",
    {
      attribution:
        "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> &copy; <a href='http://cartodb.com/attributions'>CartoDB</a>",
      subdomains: "abcd",
      maxZoom: 16,
    }
  ).addTo(map);




// // add Basemap (Carto Positron)
// L.tileLayer(
//     "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png",
//     {
//         subdomains: "abcd",
//         maxZoom: 16,
//     }
// ).addTo(map);

// // Add attribution control
// L.control.attribution({
//     position: 'bottomright',
//     prefix: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> &copy; <a href='http://cartodb.com/attributions'>CartoDB</a>"
// }).addTo(map);

  // sidebar = L.control
  //   .sidebar({
  //     container: "sidebar",
  //     closeButton: false,
  //     position: "left",
  //   })
  //   .addTo(map);

  // let panelContent = {
  //   id: panelID,
  //   tab: "<i class='fa fa-bars active'></i>",
  //   pane: "<p id='sidebar-content'></p>",
  //   title: "<h2 id='sidebar-title'>Nothing selected</h2>",
  // };
  // sidebar.addPanel(panelContent);

  // map.on("click", function () {
  //   sidebar.close(panelID);
  // });
  map.on("click", function () {
    map.closePopup();
  });

// Use PapaParse to load data from Google Sheets and call the respective functions to add those to the map.

  Papa.parse(geomURL, {
    download: true,
    header: true,
    complete: addGeoms,
  });


  // Uncomment for adding point geometries.
  // Papa.parse(pointsURL, {
  //   download: true,
  //   header: true,
  //   complete: addPoints,
  // });

}


/*
 * Load Geometry Column - WORKING 
 */

function addGeoms(data) {
  data = data.data;
  // Need to convert the PapaParse JSON into a GeoJSON
  // Start with an empty GeoJSON of type FeatureCollection
  // All the rows will be inserted into a single GeoJSON
  let fc = {
    type: "FeatureCollection",
    features: [],
  };

  for (let row in data) {
    // The Sheets data has a column 'include' that specifies if that row should be mapped
    if (data[row].include == "y") {
      let features = parseGeom(JSON.parse(data[row].geometry));
      features.forEach((el) => {
        el.properties = {
          name: data[row].name,
          description: data[row].description,
          // Inclusionary Zoning [IZ]
          IZscore: data[row].IZscore,
          IZOrequired: data[row].IZOrequired,
          IZOsystem: data[row].IZOsystem,
          IZOenhanced: data[row].IZOenhanced,
          IZOaffordable: data[row].IZOaffordable,
          IZRrequired: data[row].IZRrequired,
          IZRsystem: data[row].IZRsystem,
          IZRenhanced: data[row].IZRenhanced,
          IZRaffordable: data[row].IZRaffordable,
          IZcolor: data[row].IZcolor,
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
          // Rent Stablization [RS]
          RSscore: data[row].RSscore,
          RSexists: data[row].RSexists,
          RSyearcap: data[row].RSyearcap,
          RSexempt: data[row].RSexempt,
          RScondo: data[row].RScondo,
          RSjustcause: data[row].RSjustcause,
          RScolor: data[row].RScolor,
        };

      fc.features.push(el);
      });
    }
  }
  

/*
 * Load Geojson File - NOT WORKING 
 */

// var file_data_list = [];
// // Use Promise.all to wait for all fetch requests to complete
// Promise.all(data.map((row, index) => {
//         let filePath = row.filePaths;
//         return fetch(filePath, {
//                 method: 'GET',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 }
//             })
//             .then(response => response.json())
//             .then(geoJSON => {
//                 // Store the features in file_data_list at the correct index
//                 file_data_list[index] = parseGeom(geoJSON);
//             });
// }))
// .then(() => {
//     // After all fetch requests are completed
//     for (let row in data) {
//         if (data[row].include == "y") {
//             let features = file_data_list[row] || []; // Access features at the correct index
//             features.forEach((el) => {
//                 el.properties = {
//                     name: data[row].name,
//                     description: data[row].description,
//                     score: data[row].score,
//                     exists: data[row].exists,
//                     yearcap: data[row].yearcap,
//                     exempt: data[row].exempt,
//                     condo: data[row].condo,
//                     justcause: data[row].justcause,
//                     color: data[row].color,
//                 };
//                 fc.features.push(el);
//             });
//         }
//     }
// })
// .catch(error => {
//     console.error('Error fetching JSON:', error);
// });

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

function geomStyleIZ(feature) {
  let fillColor = feature.properties.IZcolor || "##000000";
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
  });
  rsGeojsonLayer;
  
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
jceGeojsonLayer;

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
cltGeojsonLayer;

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
opaGeojsonLayer;

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
ccGeojsonLayer;

// Inclusionary Zoning
let izGeojsonLayer = L.geoJSON(fc, {
  onEachFeature: function (feature, layer) {
    layer.on({
      mouseout: function (e) {
           e.target.setStyle(geomStyleIZ);
      },
      // mouseover: function (e) {
      //      e.target.setStyle(geomHoverStyle);
      // },
      click: function (e) {
        e.target.bindPopup(
            "<p>Name: " + e.target.feature.properties.name + "</p>" +
            "<p>Description: " + e.target.feature.properties.description + "</p>" +
            "<p>Score: " + e.target.feature.properties.IZscore + "</p>" +
            "<p>IZO Required: " + e.target.feature.properties.IZOrequired + "</p>" +
            "<p>IZO System: " + e.target.feature.properties.IZOsystem + "</p>" +
            "<p>IZO Enhanced: " + e.target.feature.properties.IZOenhanced + "</p>" +
            "<p>IZO Affordable: " + e.target.feature.properties.IZOaffordable + "</p>" +
            "<p>IZR Required: " + e.target.feature.properties.IZRrequired + "</p>" +
            "<p>IZR System: " + e.target.feature.properties.IZRsystem + "</p>" +
            "<p>IZR Enhanced: " + e.target.feature.properties.IZRenhanced + "</p>" +
            "<p>IZR Affordable: " + e.target.feature.properties.IZRaffordable + "</p>"
        ).openPopup();
        L.DomEvent.stopPropagation(e);
       },
    });
  },
  style: geomStyleIZ,
});
izGeojsonLayer.addTo(map);


// Add Layers to the map
  let baseLayers = {
    "Inclusionary Zoning": izGeojsonLayer, 
    "Condo Conversion": ccGeojsonLayer, 
    "Opportunity to Purchase Act": opaGeojsonLayer, 
    "Community Land Trusts": cltGeojsonLayer, 
    "Just Cause Eviction": jceGeojsonLayer,
    "Rent Stablization": rsGeojsonLayer
  };


// Create the control and add it to the map;
var control = L.control.layers(baseLayers, null, { collapsed: false, position: 'topleft' });
control.addTo(map);

// Call the getContainer routine.
var htmlObject = control.getContainer();
 
// Get the desired parent node.
var sidebar = document.getElementById('sidebar');

// Finally append the control container to the sidebar.
sidebar.appendChild(htmlObject);




//  // Finally append that node to the new parent, recursively searching out and re-parenting nodes.
//  function setParent(el, newParent)
//  {
//     newParent.appendChild(el);
//  }
//  setParent(htmlObject, a);

}

  //   for (let row in data) {
  //     // The Sheets data has a column 'include' that specifies if that row should be mapped
  //      if (data[row].include == "y") {
  //     let filePath = data[row].filePaths; 

  //       fetch(filePath, {
  //         method: 'GET',
  //         headers: {
  //           'Content-Type': 'application/json'
  //           // You can add more headers if needed
  //           // 'Authorization': 'Bearer your-token',
  //         }
  //       })
  //       .then(response => {
  //         if (!response.ok) {
  //           throw new Error('Network response was not ok');
  //         }
  //         return response.json();
  //       })
  //       .then(geoJSON => {
  //         let features = parseGeom(geoJSON);
  //         // Continue processing the JSON data
  //       })
  //       .catch(error => {
  //         console.error('Error fetching JSON:', error);
  //         // Handle the error gracefully
  //       });

// old: make content appear in a Sidebar
        // click: function (e) {
        //   // This zooms the map to the clicked geometry
        //   // Uncomment to enable
        //   // map.fitBounds(e.target.getBounds());

        //   // if this isn't added, then map.click is also fired!
        //   L.DomEvent.stopPropagation(e);

          

        //   document.getElementById("sidebar-title").innerHTML =
        //     e.target.feature.properties.name;
        //   document.getElementById("sidebar-content").innerHTML =
        //   "<p>Description: " + e.target.feature.properties.description + "</p>" +
        //   "<p>Score: " + e.target.feature.properties.score + "</p>" +
        //   "<p>Exists: " + e.target.feature.properties.exists + "</p>" +
        //   "<p>Year Cap: " + e.target.feature.properties.yearcap + "</p>" +
        //   "<p>Exempt: " + e.target.feature.properties.exempt + "</p>" +
        //   "<p>Condo: " + e.target.feature.properties.condo + "</p>" +
        //   "<p>Just Cause: " + e.target.feature.properties.justcause + "</p>";
        //   sidebar.open(panelID);
        // },


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

// marker.bindPopup(data[row].name);

    // COMMENT THE NEXT GROUP OF LINES TO DISABLE SIDEBAR FOR THE MARKERS
    // marker.feature = {
    //   properties: {
    //     name: data[row].name,
    //     description: data[row].description,
    //   },
    // };
    // marker.on({
    //   click: function (e) {
    //     L.DomEvent.stopPropagation(e);
    //     document.getElementById("sidebar-title").innerHTML =
    //       e.target.feature.properties.name;
    //     document.getElementById("sidebar-content").innerHTML =
    //       e.target.feature.properties.description;
    //     sidebar.open(panelID);
    //   },
    // });
    // COMMENT UNTIL HERE TO DISABLE SIDEBAR FOR THE MARKERS

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
