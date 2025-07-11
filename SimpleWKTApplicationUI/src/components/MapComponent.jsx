import React, { useEffect, useRef, useState, useCallback } from 'react';
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
import Overlay from 'ol/Overlay';
import 'ol/ol.css';
import './MapComponent.css';

const MapComponent = ({
    spatials,
    selectedSpatial,
    onFeatureAdded,
    onFeatureSelected,
    onDeleteSpatial,
    onUpdateSpatial
}) => {
    const mapRef = useRef();
    const popupRef = useRef();
    const [map, setMap] = useState(null);
    const [vectorSource] = useState(new VectorSource());
    const [drawInteraction, setDrawInteraction] = useState(null);
    const [drawingActive, setDrawingActive] = useState(false);
    const [drawType, setDrawType] = useState(null);
    const [selectedFeature, setSelectedFeature] = useState(null);
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

    const drawingStyle = new Style({
        fill: new Fill({ color: 'rgba(255, 0, 0, 0.2)' }),
        stroke: new Stroke({ color: 'red', width: 2 }),
        image: new Circle({ radius: 7, fill: new Fill({ color: 'red' }) })
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
            view: new View({ center: fromLonLat([0, 0]), zoom: 2 }),
            overlays: [
                new Overlay({
                    element: popupRef.current,
                    autoPan: true,
                    autoPanAnimation: { duration: 250 },
                    positioning: 'bottom-center'
                })
            ]
        });

        initialMap.addInteraction(new Modify({ source: vectorSource }));
        initialMap.addInteraction(new Snap({ source: vectorSource }));
        setMap(initialMap);

        return () => initialMap.setTarget(undefined);
    }, []);

    
    const handleMapClick = useCallback((e) => {
        const feature = map.forEachFeatureAtPixel(e.pixel, (f) => f);
        if (feature) {
            const spatial = spatials.find(s => s.id === feature.getId());
            if (spatial) {
                setSelectedFeature(spatial);
                onFeatureSelected(spatial);

                
                const popup = map.getOverlays().getArray()[0];
                popup.setPosition(e.coordinate);
            }
        }
    }, [map, spatials, onFeatureSelected]);

    useEffect(() => {
        if (!map) return;

        map.on('click', handleMapClick);
        return () => map.un('click', handleMapClick);
    }, [map, handleMapClick]);

    
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

   
    const cancelDrawing = () => {
        if (drawInteraction) {
            map.removeInteraction(drawInteraction);
            setDrawInteraction(null);
            setDrawingActive(false);
            setDrawType(null);
        }
    };

    
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && drawingActive) {
                cancelDrawing();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [drawingActive]);

    const startDrawing = (type) => {
        if (!map) return;
        if (drawInteraction) cancelDrawing();

        const newDraw = new Draw({
            source: vectorSource,
            type: type,
            style: drawingStyle
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
                cancelDrawing();
            }
        });

        newDraw.on('drawstart', () => {
            setDrawingActive(true);
            setDrawType(type);
        });

        map.addInteraction(newDraw);
        setDrawInteraction(newDraw);
    };

    
    const handleDelete = async (id) => {
        try {
            await onDeleteSpatial(id);
            setSelectedFeature(null);
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const handleUpdate = (spatial) => {
        onUpdateSpatial(spatial);
        setSelectedFeature(null);
    };

    return (
        <div ref={mapRef} className="map-container">
            <div className="map-controls">
                <button
                    onClick={() => startDrawing('Point')}
                    className={drawType === 'Point' ? 'drawing-active' : ''}
                    disabled={drawingActive && drawType !== 'Point'}
                >
                    Add Point
                </button>
                <button
                    onClick={() => startDrawing('LineString')}
                    className={drawType === 'LineString' ? 'drawing-active' : ''}
                    disabled={drawingActive && drawType !== 'LineString'}
                >
                    Add Line
                </button>
                <button
                    onClick={() => startDrawing('Polygon')}
                    className={drawType === 'Polygon' ? 'drawing-active' : ''}
                    disabled={drawingActive && drawType !== 'Polygon'}
                >
                    Add Polygon
                </button>
                {drawingActive && (
                    <button
                        onClick={cancelDrawing}
                        className="cancel-drawing-btn"
                    >
                        Cancel Drawing (ESC)
                    </button>
                )}
            </div>

            <div ref={popupRef} className="ol-popup">
                {selectedFeature && (
                    <div className="popup-content">
                        <h3>{selectedFeature.name || 'Unnamed Feature'}</h3>
                        <div className="popup-details">
                            <p><strong>ID:</strong> {selectedFeature.id}</p>
                            <p><strong>Type:</strong> {selectedFeature.wkt.split('(')[0]}</p>
                            <p><strong>Coordinates:</strong> {selectedFeature.wkt.match(/\(([^)]+)\)/)[1]}</p>
                        </div>
                        <div className="popup-actions">
                            <button
                                onClick={() => handleUpdate(selectedFeature)}
                                className="popup-btn edit-btn"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(selectedFeature.id)}
                                className="popup-btn delete-btn"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapComponent;