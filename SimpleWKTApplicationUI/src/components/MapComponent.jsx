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
import { Button, IconButton, Tooltip, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { AddLocation, Polyline, CropSquare, Close, Edit, Delete } from '@mui/icons-material';

const MapComponent = ({
    spatials,
    selectedSpatial,
    onFeatureAdded,
    onFeatureSelected,
    onDeleteSpatial,
    onUpdateSpatial
}) => {
    const mapRef = useRef(null);
    const popupRef = useRef(null);
    const [map, setMap] = useState(null);
    const [vectorSource] = useState(new VectorSource());
    const [drawInteraction, setDrawInteraction] = useState(null);
    const [drawingActive, setDrawingActive] = useState(false);
    const [drawType, setDrawType] = useState(null);
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editData, setEditData] = useState({ name: '', wkt: '' });
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
        if (!mapRef.current) return;

        const initialMap = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({ source: new OSM() }),
                new VectorLayer({
                    source: vectorSource,
                    style: (feature) => feature.get('selected') ? selectedStyle : featureStyle
                })
            ],
            view: new View({
                center: fromLonLat([0, 0]),
                zoom: 2,
                constrainResolution: true
            })
        });

        const popupOverlay = new Overlay({
            element: popupRef.current,
            autoPan: true,
            autoPanAnimation: { duration: 250 }
        });
        initialMap.addOverlay(popupOverlay);

        initialMap.addInteraction(new Modify({ source: vectorSource }));
        initialMap.addInteraction(new Snap({ source: vectorSource }));

        setTimeout(() => initialMap.updateSize(), 100);

        setMap(initialMap);

        return () => initialMap.setTarget(undefined);
    }, []);

    const handleMapClick = useCallback((e) => {
        if (!map) return;

        const feature = map.forEachFeatureAtPixel(e.pixel, (f) => f, { hitTolerance: 10 });
        if (feature) {
            const spatial = spatials.find(s => s.id === feature.getId());
            if (spatial) {
                setSelectedFeature(spatial);
                onFeatureSelected(spatial);
                const popup = map.getOverlays().getArray().find(o => o.getElement() === popupRef.current);
                if (popup) {
                    popup.setPosition(e.coordinate);
                    popupRef.current.style.display = 'block';
                }
            }
        } else {
            popupRef.current.style.display = 'none';
            setSelectedFeature(null);
            onFeatureSelected(null);
        }
    }, [map, spatials, onFeatureSelected]);

    useEffect(() => {
        if (!map) return;
        map.on('click', handleMapClick);
        return () => map.un('click', handleMapClick);
    }, [map, handleMapClick]);

    useEffect(() => {
        if (!map || !mapRef.current) return;
        const resizeObserver = new ResizeObserver(() => map.updateSize());
        resizeObserver.observe(mapRef.current);
        return () => resizeObserver.disconnect();
    }, [map]);

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
            if (e.key === 'Escape' && drawingActive) cancelDrawing();
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
            popupRef.current.style.display = 'none';
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const handleEditClick = (spatial) => {
        setEditData({
            name: spatial.name || '',
            wkt: spatial.wkt || ''
        });
        setEditDialogOpen(true);
    };

    const handleUpdate = async () => {
        try {
            await onUpdateSpatial({
                ...selectedFeature,
                name: editData.name,
                wkt: editData.wkt
            });
            setEditDialogOpen(false);
            popupRef.current.style.display = 'none';
        } catch (error) {
            console.error('Update failed:', error);
        }
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#f5f5f5' }}>
            <div ref={mapRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />

            <div style={{
                position: 'absolute',
                top: 16,
                left: 16,
                zIndex: 1000,
                display: 'flex',
                gap: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: '8px 12px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
            }}>
                <Tooltip title="Add Point">
                    <IconButton
                        onClick={() => startDrawing('Point')}
                        style={{ backgroundColor: drawType === 'Point' ? '#ffeb3b' : 'inherit' }}
                        disabled={drawingActive && drawType !== 'Point'}
                    >
                        <AddLocation />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Add Line">
                    <IconButton
                        onClick={() => startDrawing('LineString')}
                        style={{ backgroundColor: drawType === 'LineString' ? '#ffeb3b' : 'inherit' }}
                        disabled={drawingActive && drawType !== 'LineString'}
                    >
                        <Polyline />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Add Polygon">
                    <IconButton
                        onClick={() => startDrawing('Polygon')}
                        style={{ backgroundColor: drawType === 'Polygon' ? '#ffeb3b' : 'inherit' }}
                        disabled={drawingActive && drawType !== 'Polygon'}
                    >
                        <CropSquare />
                    </IconButton>
                </Tooltip>
                {drawingActive && (
                    <Tooltip title="Cancel Drawing">
                        <IconButton onClick={cancelDrawing} style={{ backgroundColor: '#f44336', color: 'white' }}>
                            <Close />
                        </IconButton>
                    </Tooltip>
                )}
            </div>

            <div ref={popupRef} style={{
                position: 'absolute',
                backgroundColor: 'white',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                padding: '15px',
                borderRadius: '10px',
                border: '1px solid #ccc',
                minWidth: '250px',
                display: 'none',
                zIndex: 1000
            }}>
                {selectedFeature && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <h3 style={{ margin: 0 }}>{selectedFeature.name || 'Unnamed Feature'}</h3>
                        <div style={{ margin: '8px 0' }}>
                            <p style={{ margin: '4px 0', fontSize: '14px' }}>
                                <strong>ID:</strong> {selectedFeature.id}
                            </p>
                            <p style={{ margin: '4px 0', fontSize: '14px' }}>
                                <strong>Type:</strong> {selectedFeature.wkt.split('(')[0]}
                            </p>
                            <p style={{ margin: '4px 0', fontSize: '14px', wordBreak: 'break-all' }}>
                                <strong>Coordinates:</strong> {selectedFeature.wkt.match(/\(([^)]+)\)/)[1]}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                            <Button
                                onClick={() => handleEditClick(selectedFeature)}
                                variant="contained"
                                color="warning"
                                startIcon={<Edit />}
                            >
                                Edit
                            </Button>
                            <Button
                                onClick={() => handleDelete(selectedFeature.id)}
                                variant="contained"
                                color="error"
                                startIcon={<Delete />}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
                <DialogTitle>Edit Feature</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Name"
                        fullWidth
                        margin="normal"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    />
                    <TextField
                        label="WKT"
                        fullWidth
                        margin="normal"
                        multiline
                        rows={4}
                        value={editData.wkt}
                        onChange={(e) => setEditData({ ...editData, wkt: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpdate} color="primary" variant="contained">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default MapComponent;