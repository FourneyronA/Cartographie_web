// création de la carte web de base 

var map = L.map('map');
var osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib = 'Map data © OpenStreetMap Contributeur';
var osm = new L.TileLayer(osmUrl, {attribution: osmAttrib}).addTo(map);
var CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 19
});
var GeoportailFrance_orthos = L.tileLayer('https://wxs.ign.fr/{apikey}/geoportail/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&STYLE={style}&TILEMATRIXSET=PM&FORMAT={format}&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}', {
  attribution: '<a target="_blank" href="https://www.geoportail.gouv.fr/">Geoportail France</a>',
  bounds: [[-75, -180], [81, 180]],
  minZoom: 2,
  maxZoom: 19,
  apikey: 'choisirgeoportail',
  format: 'image/jpeg',
  style: 'normal'
});

map.setView([45.72,4.88],12); // définir les paramètre de visualisation de la carte

//------------------------------------ AJOUT DES DONNEES ------------------------------------

// Stations auto-partage
function setStyleStation(feature) {
  return {
    fillColor: '#2A6172',
    radius: feature.properties.nbemplacem*1.5, // *1.5 permet d'avoir des points plus gros, plus visibles
      weight: 1,
      fillOpacity: 1,
      color: 'white'
  };
}

var station_autopartage = L.geoJSON(station, {    
    pointToLayer: function(feature,latlng){
      return L.circleMarker(latlng, setStyleStation(feature))
    },
    onEachFeature: overStation
}).addTo(map);

 // Taux de chômage par IRIS
 var choropleth=L.choropleth(iris, {
    valueProperty: 'tchom',
    scale: ['white', 'red'],
    steps: 8, // Nombre de classes
    mode: 'q',
    style: {
      color: '#fff',
      weight: 2,
      fillOpacity: 0.8
  },
  onEachFeature: onEachFeature
}).bindPopup(function(layer){
  return('<b>' + layer.feature.properties.libiris + '</b> : ' + layer.feature.properties.tchom + '%');
 })

// Au survol d'une IRIS, celle-ci se sélectionne (bordures grisées), sous la carte le taux de chomage et le nom de l'IRIS apparaissent
// + zoom lorsque l'on clique et pop up avec taux de chomage
function highlightFeature(e) {

  e.target.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        e.target.bringToFront();
    }

    var text = '<b>' + e.target.feature.properties.libiris + '</b> : ' + e.target.feature.properties.tchom + '%';
    L.DomUtil.get('info').innerHTML = text
} 

function resetHighlight(e) {
    choropleth.resetStyle(e.target);
}

/*function onclickcom(e) {
  map.fitBounds(e.target.getBounds());
  var text = '<b>' + e.target.feature.properties.libiris + '</b> : ' + e.target.feature.properties.tchom + '%';
  document.getElementById('informations').innerHTML = text
}*/

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        //click: onclickcom
    });
}

// Ajouter une légende -- NE FONCTIONNE PAS COMME VOULUE DANS AFFICHAGE COULEUR LEGENDE
/*function legend_for_choropleth_layer(layer, name, units, id) {
    var limits = layer.options.limits;
    var colors = layer.options.colors;
    var labels = [];

    // Start with just the name that you want displayed in the layer selector
    var HTML = name

    // For each limit value, create a string of the form 'X-Y'
    limits.forEach(function (limit, index) {
        if (index === 0) {
            var to = parseFloat(limits[index]).toFixed(0);
            var range_str = "< " + to;
        }
        else {
            var from = parseFloat(limits[index - 1]).toFixed(0);
            var to = parseFloat(limits[index]).toFixed(0);
            var range_str = from + "-" + to;
        }

        // Put together a <li> element with the relevant classes, and the right colour and text
        labels.push('<li class="sublegend-item"><div class="sublegend-color" style="background-color: ' +
            colors[index] + '"> </div> ' + range_str + '</li>');
    })

    // Put all the <li> elements together in a <ul> element
    HTML += '<ul id="' + id + '" class="sublegend">' + labels.join('') + '</ul>';

    return HTML;
};*/

// Afficher la légende et les informations lors du survol uniquement lorsque la couche choropleth est cochée
choropleth.on('add', function () {
    setTimeout(function () {
        //$('#legend_IRIS').show();
        $('#info').show();
    });
});

choropleth.on('remove', function () {
    setTimeout(function () {
        //$('#legend_IRIS').hide();
        $('#info').hide();
    });
});

// ----------------------------------- OPTIONS -----------------------------------
//Option 1 -- Ajouter un marqueur animé le long des lignes de métro.

// Assignation symbologie aux polylignes représenant les métros
function styleLigne(metro) {
  switch(metro) {
    case 'A': 
      return '#FF0010';
    case 'B':
      return '#00AAE3';
    case 'C':
      return '#F8961D';
    case 'D':
      return '#00A63F';
  }
}

function editMetro(feature) {
  ligne_metro = feature.properties.ligne;
  return {
      color: styleLigne(ligne_metro)
  };
}
//Création d'un nouveau groupe d'entité pour les marqueurs animés
var animation = new L.FeatureGroup;

// Affichage des données ligne de métro, avec symbologie définie précédemment et ajout d'une pop-up qui indique le nom et la direction de la ligne
var affichage_metro = L.geoJSON(data_geojson, {
  style: editMetro,
  onEachFeature: addMarker
}).bindPopup(function(layer) {
  return ("<b>Métro " + layer.feature.properties.ligne + "</b><br >" + "<b> Direction : "+layer.feature.properties.libelle +"</b>")
}).addTo(map);

// Fonction marqueur animé 
  //Récupération des coorodonnées des lignes de métros
function addMarker(feature, layer) {
  var coordinates = [];
  for (var i=0; i < feature.geometry.coordinates[0].length; i++) {
    coordinates.push(feature.geometry.coordinates[0][i].reverse())
  }
  var polyligne = L.polyline(coordinates);
  // Ajout d'une icône personnalisée pour chaque ligne (concaténation selon le nom de la ligne), avec réglage de taille, animation en continu avec l'option loop
  var animatedMarker = L.Marker.movingMarker(polyligne.getLatLngs(), 10000, {
    autostart: true,
    loop: true,
    icon: L.icon({
      iconUrl: layer.feature.properties.ligne+'.png',
      iconSize : [58,28]
      })
  }).addTo(animation);
}
  animation.addTo(map);

// Option 2 -- Ajouter une zone tampon de 300m visible au survol des stations auto-partage + mise en valeur de la station

var buffer;

function highlightStation(e) {
  var layer = e.target;
  layer.setStyle({
        radius: layer.feature.properties.nbemplacem*1.5,
        weight: 2,
        color: '#666',
        fillOpacity: 0.7
    });
    buffer = L.circle(layer.getLatLng(), {radius: 300}).addTo(map);
}

function resetStation(e) {
  var layer = e.target;
    layer.setStyle(setStyleStation(layer.feature));
    map.removeLayer(buffer);
}

function overStation(feature, layer) {
    layer.on({
        mouseover: highlightStation,
        mouseout: resetStation
    });
}

// Option 3 -- Proposer une fonction de dessin de ligne

// Initialisation du GeatureGroup
var editableLayers = new L.FeatureGroup();
map.addLayer(editableLayers);


var options = {
  position: 'topleft',
  draw: {
    polyline: {
      shapeOptions: {
        color: '#f357a1',
        weight: 10
          }
    },
    // Choix des fonctionnalités visibles : dans notre cas = polyline
    polyline: true,
    circle: false,
    polygon: false,
    marker: false,
    rectangle: false,
  },
  edit: {
    featureGroup: editableLayers, //OBLIGATOIRE
    remove: true
  }
};
// Initialisé le draw control, permettre son édition dans le FeatureGroup
var drawControl = new L.Control.Draw(options);
map.addControl(drawControl);

map.on('draw:created', function(e) {
  var type = e.layerType,
    layer = e.layer;

  if (type === 'polyline') {
    layer.bindPopup('Ligne créée');
  } 

  editableLayers.addLayer(layer);
}); 

// ------------------------------- Affichage des couches  -------------------------------
//Fond de plan : OSM
var baseLayers = {
  "OpenStreetMap": osm,
  "Fond CartoDB": CartoDB_Positron,
  "Photo aérienne": GeoportailFrance_orthos
};

// Overlays : Couches qui viennent se superposer au fond de plan 
var overlays = {
  "Sations Auto partage": station_autopartage,
  "Lignes de métro": affichage_metro,
  "Logo métro": animation,
  "IRIS": choropleth
  //[legend_for_choropleth_layer(choropleth, 'IRIS', '', 'legend_IRIS')]: choropleth

};
L.control.layers(baseLayers, overlays).addTo(map);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

