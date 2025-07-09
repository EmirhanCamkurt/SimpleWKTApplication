import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Point } from 'ol/geom';
import Feature from 'ol/Feature';
import { Style, Icon } from 'ol/style';
import { toStringXY } from 'ol/coordinate';
import Overlay from 'ol/Overlay';

const MapComponent = ({ spatials, onMapClick }) => {
  const mapRef = useRef();
  const [map, setMap] = useState(null);
  const [features, setFeatures] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState(null);

  useEffect(() => {
    // Initialize map
    const initialMap = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2,
      }),
    });

    setMap(initialMap);

    return () => {
      initialMap.setTarget(undefined);
    };
  }, []);

  useEffect(() => {
    if (!map) return;

    // Clear existing vector layer
    map.getLayers().forEach(layer => {
      if (layer instanceof VectorLayer) {
        map.removeLayer(layer);
      }
    });

    // Create features from spatials
    const newFeatures = spatials.map(spatial => {
        const coords = spatial.WKT?.coordinates || [0, 0];;
      const point = new Point(fromLonLat(coords));
      const feature = new Feature({
        geometry: point,
        id: spatial.Id,
        name: spatial.Name,
      });

      feature.setStyle(
        new Style({
          image: new Icon({
            src: 'https://cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@master/en/v6.5.0/build/ol/logo.png',
            scale: 0.05,
          }),
        })
      );

      return feature;
    });

    setFeatures(newFeatures);

    // Add vector layer with new features
    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: newFeatures,
      }),
    });

    map.addLayer(vectorLayer);

    // Fit view to all features
    if (newFeatures.length > 0) {
      const extent = vectorLayer.getSource().getExtent();
      map.getView().fit(extent, { padding: [50, 50, 50, 50] });
    }

    // Add click handler
    const clickHandler = map.on('click', (evt) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
      if (feature) {
        setSelectedFeature(feature);
        const coords = feature.getGeometry().getCoordinates();
        const coord3857 = toStringXY(coords, 2);
        alert(`Selected: ${feature.get('name')}\nCoordinates: ${coord3857}`);
      } else if (onMapClick) {
        const coords = evt.coordinate;
        const lonLat = map.getCoordinateFromPixel(evt.pixel);
        onMapClick(lonLat);
      }
    });

    return () => {
      if (clickHandler) {
        map.un('click', clickHandler);
      }
    };
  }, [map, spatials, onMapClick]);

  return <div ref={mapRef} style={{ width: '100%', height: '400px' }} />;
};

export default MapComponent;