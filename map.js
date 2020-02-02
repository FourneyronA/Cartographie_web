var map = L.map('map');

var osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

var osmAttrib = 'Map data © OpenStreetMap Contributeur';

var osm = new L.TileLayer(osmUrl, {attribution: osmAttrib}).addTo(map);

// définir les paramètre de visualisation de la carte
map.setView([45.72,4.88],12);



// icone personnaliser 
var Icone_formation = L.icon({
    iconUrl: 'images/BGTIMIDE2.png',
    iconSize: [48, 48],
    iconAnchor: [24, 24]
});

// ajouter une la ligne du tram à partir des différents points de ligne du tram
// partie de ligne de tram du T2
var ligne_tram = [[4.91556, 45.7221],[4.91735, 45.71945],[4.92218, 45.72033],[4.92518, 45.7184]];
// création d'un objet polyligne
var tram_trace = L.polyline([], {
    "color": "black", 
    "weight": 2
})
// ajout de coordonnée dans l'objet polyligne à partir des points du tableau
for(var i=0; i < ligne_tram.length; i++){
    // reverse permet d'inverser les coordonnée
    tram_trace.addLatLng(ligne_tram[i].reverse());
}


//créer un maler avec déplacement  speed : 64 meters/seconds
var tram = L.GlAnimatedMarker(tram_trace.getLatLngs(), { icon: Icone_formation, speed: 128 });

//called when mouse clicked
tram.on("click", function () {
    console.log("Voici les différentes informations du tram");
});

//add marker to leaflet map
map.addLayer(tram);

