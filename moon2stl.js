//Strongly based on https://developers.google.com/maps/documentation/javascript/examples/maptype-image

function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 0, lng: 0},
    zoom: 1,
    streetViewControl: false,
    mapTypeControlOptions: {
      mapTypeIds: ['moon']
    }
  });

  var moonMapType = new google.maps.ImageMapType({
    getTileUrl: function(coord, zoom) {
        var normalizedCoord = getNormalizedCoord(coord, zoom);
        if (!normalizedCoord) {
          return null;
        }
        var bound = Math.pow(2, zoom);
        return '//mw1.google.com/mw-planetary/lunar/lunarmaps_v1/clem_bw' +
            '/' + zoom + '/' + normalizedCoord.x + '/' +
            (bound - normalizedCoord.y - 1) + '.jpg';
    },
    tileSize: new google.maps.Size(256, 256),
    maxZoom: 6,
    minZoom: 2,
    radius: 1738000,
    name: 'Moon'
  });



  map.mapTypes.set('moon', moonMapType);
  map.setMapTypeId('moon');

  var rectCoords = [
    {lat: -5, lng: 5},
    {lat: -5, lng: -5},
    {lat: 5, lng: -5},
    {lat: 5, lng: 5}
  ];

  rectangle = new google.maps.Polygon({
    strokeColor: '#FF0000',
    path: rectCoords,
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#FF0000',
    fillOpacity: 0.35,
    map: map,
    geodesic: true
  });
  rectangle.setDraggable(true);

  google.maps.event.addListener(rectangle, 'dragend', function() {
    console.log('Drag ended');
    console.log(rectangle.getPath().getAt(1).lat());
  });
}

// Normalizes the coords that tiles repeat across the x axis (horizontally)
// like the standard Google map tiles.
function getNormalizedCoord(coord, zoom) {
  var y = coord.y;
  var x = coord.x;

  // tile range in one direction range is dependent on zoom level
  // 0 = 1 tile, 1 = 2 tiles, 2 = 4 tiles, 3 = 8 tiles, etc
  var tileRange = 1 << zoom;

  // don't repeat across y-axis (vertically)
  if (y < 0 || y >= tileRange) {
    return null;
  }

  // repeat across x-axis
  if (x < 0 || x >= tileRange) {
    x = (x % tileRange + tileRange) % tileRange;
  }

  return {x: x, y: y};
}
