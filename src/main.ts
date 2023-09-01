import { Deck, MapView, type DeckProps } from "@deck.gl/core/typed";
import { TileLayer } from "@deck.gl/geo-layers/typed";
import { BitmapLayer, PathLayer } from "@deck.gl/layers/typed";

/* global window */
const devicePixelRatio =
  (typeof window !== "undefined" && window.devicePixelRatio) || 1;

type getTooltipFn = NonNullable<DeckProps["getTooltip"]>;

const getTooltip: getTooltipFn = (info) => {
  // @ts-expect-error
  const { tile, coordinate } = info;
  if (tile && coordinate) {
    const { x, y, z } = tile.index;
    return `tile: x: ${x}, y: ${y}, z: ${z}
coordinate: ${coordinate[0]}, ${coordinate[1]}`;
  }
  return null;
};

const osmLayer = new TileLayer({
  // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_servers
  data: [
    "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
    "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
    "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
  ],

  // Since these OSM tiles support HTTP/2, we can make many concurrent requests
  // and we aren't limited by the browser to a certain number per domain.
  maxRequests: 20,

  pickable: true,
  highlightColor: [60, 60, 60, 40],
  // https://wiki.openstreetmap.org/wiki/Zoom_levels
  minZoom: 0,
  maxZoom: 19,
  tileSize: 256,
  zoomOffset: devicePixelRatio === 1 ? -1 : 0,
  renderSubLayers: (props) => {
    const [[west, south], [east, north]] = props.tile.boundingBox;

    return [
      new BitmapLayer(props, {
        // @ts-expect-error
        data: null,
        image: props.data,
        bounds: [west, south, east, north],
      }),

      new PathLayer({
        id: `${props.id}-border`,
        data: [
          [
            [west, north],
            [west, south],
            [east, south],
            [east, north],
            [west, north],
          ],
        ],
        getPath: (d) => d,
        getColor: [255, 0, 0],
        widthMinPixels: 4,
      }),
    ];
  },
});

const deck = new Deck({
  id: "map",
  initialViewState: {
    longitude: 132.6016,
    latitude: 34.2321,
    zoom: 13,
  },
  views: new MapView({ repeat: true }),
  controller: true,
  getTooltip: getTooltip,
  layers: [osmLayer],
});

console.log(import.meta.env.VITE_EXPOLIS_API_TOKEN);
