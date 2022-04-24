/*eslint-disable*/

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiYWtoaWwyMDIwIiwiYSI6ImNsMjV2YTRuYzA1N3IzYnIyZHNpd2FoZ2gifQ.wyfWrooJ5UNLSHE06aNS9w';

  var map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/akhil2020/cl260jpga00hc14mqayqmtqym', // style URL
    scrollZoom: false,
    //   center: [83.02638, 25.37441], // starting position [lng, lat]
    //   zoom: 4, // starting zoom
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    //Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    //Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    //Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day} : ${loc.description}</p>`)
      .addTo(map);
    //Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 270,
      bottom: 270,
      left: 100,
      right: 100,
    },
  });
};
