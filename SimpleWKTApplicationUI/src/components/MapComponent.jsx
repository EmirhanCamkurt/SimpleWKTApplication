import React, { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { fromLonLat } from 'ol/proj';
import WKT from 'ol/format/WKT';
import { Style, Fill, Stroke, Circle } from 'ol/style';
import { Draw, Modify, Snap } from 'ol/interaction';
import 'ol/ol.css';
import './MapComponent.css';

const MapComponent = ({ spatials, selectedSpatial, onFeatureAdded }) => {
    const mapRef = useRef();
    const [map, setMap] = useState(null);
    const [vectorSource] = useState(new VectorSource());
    const [drawInteraction, setDrawInteraction] = useState(null);
    const wktFormat = new WKT();

    const featureStyle = new Style({
        fill: new Fill({ color: 'rgba(75, 123, 236, 0.2)' }),
        stroke: new Stroke({ color: '#4B7BEC', width: 2 }),
        image: new Circle({ radius: 7, fill: new Fill({ color: '#4B7BEC' }) })
    });

    const selectedStyle = new Style({
        fill: new Fill({ color: 'rgba(255, 87, 34, 0.2)' }),
        stroke: new Stroke({ color: '#ff5722', width: 3 }),
        image: new Circle({ radius: 8, fill: new Fill({ color: '#ff5722' }) })
    });

    useEffect(() => {
        const initialMap = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({ source: new OSM() }),
                new VectorLayer({
                    source: vectorSource,
                    style: (feature) => feature.get('selected') ? selectedStyle : featureStyle
                })
            ],
            view: new View({ center: fromLonLat([0, 0]), zoom: 2 })
        });

        initialMap.addInteraction(new Modify({ source: vectorSource }));
        initialMap.addInteraction(new Snap({ source: vectorSource }));
        setMap(initialMap);

        return () => initialMap.setTarget(undefined);
    }, []);

    useEffect(() => {
        if (!map) return;

        vectorSource.clear();

        spatials.forEach(spatial => {
            try {
                if (spatial?.wkt) {
                    const feature = wktFormat.readFeature(spatial.wkt, {
                        dataProjection: 'EPSG:4326',
                        featureProjection: 'EPSG:3857'
                    });

                    if (feature) {
                        feature.setId(spatial.id);
                        feature.set('name', spatial.name || 'Unnamed');
                        feature.set('selected', selectedSpatial?.id === spatial.id);
                        vectorSource.addFeature(feature);
                    }
                }
            } catch (e) {
                console.error('Error parsing WKT:', e);
            }
        });

        if (selectedSpatial?.id) {
            const feature = vectorSource.getFeatureById(selectedSpatial.id);
            if (feature?.getGeometry()) {
                map.getView().fit(feature.getGeometry(), {
                    padding: [50, 50, 50, 50],
                    maxZoom: 15,
                    duration: 500
                });
            }
        }
    }, [spatials, selectedSpatial, map]);

    const startDrawing = (type) => {
        if (!map) return;
        if (drawInteraction) map.removeInteraction(drawInteraction);

        const newDraw = new Draw({
            source: vectorSource,
            type: type,
            style: new Style({
                fill: new Fill({ color: 'rgba(255, 0, 0, 0.2)' }),
                stroke: new Stroke({ color: 'red', width: 2 }),
                image: new Circle({ radius: 7, fill: new Fill({ color: 'red' }) })
            })
        });

        newDraw.on('drawend', (event) => {
            try {
                const wkt = wktFormat.writeFeature(event.feature, {
                    dataProjection: 'EPSG:4326',
                    featureProjection: 'EPSG:3857'
                });
                if (wkt && typeof onFeatureAdded === 'function') {
                    onFeatureAdded(wkt);
                }
            } catch (e) {
                console.error('Error converting feature to WKT:', e);
            } finally {
                map.removeInteraction(newDraw);
                setDrawInteraction(null);
            }
        });

        map.addInteraction(newDraw);
        setDrawInteraction(newDraw);
    };

    return (
        <div ref={mapRef} className="map-container">
            <div className="map-controls">
                <button onClick={() => startDrawing('Point')}>Add Point</button>
                <button onClick={() => startDrawing('LineString')}>Add Line</button>
                <button onClick={() => startDrawing('Polygon')}>Add Polygon</button>
            </div>
        </div>
    );
};

export default MapComponent;