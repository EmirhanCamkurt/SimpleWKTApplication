import React, { useState, useEffect } from 'react';
import { Container, Grid, CircularProgress, Alert, Snackbar } from '@mui/material';
import MapComponent from './components/MapComponent';
import SpatialTable from './components/SpatialTable';
import WKTInputForm from './components/WKTInputForm';
import * as api from './services/api';
import './App.css';

function App() {
    const [spatials, setSpatials] = useState([]);
    const [selectedSpatial, setSelectedSpatial] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const fetchSpatials = async () => {
        try {
            setLoading(true);
            const data = await api.getSpatials();
            setSpatials(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            setSnackbarOpen(true);
            setSpatials([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSpatials();
    }, []);

    const handleFeatureAdded = async (wkt) => {
        try {
            const name = prompt('Enter a name for this feature:');
            if (name) {
                await api.createSpatial({ name, wkt });
                await fetchSpatials();
                setSuccessMessage('Feature added successfully!');
                setSnackbarOpen(true);
                setError(null);
            }
        } catch (err) {
            setError(err.message);
            setSnackbarOpen(true);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
        setError(null);
        setSuccessMessage(null);
    };

    const handleDeleteSpatial = async (id) => {
        try {
            await api.deleteSpatial(id);
            await fetchSpatials();
            setSuccessMessage('Feature deleted successfully!');
            setSnackbarOpen(true);
            setError(null);
        } catch (err) {
            setError(err.message);
            setSnackbarOpen(true);
        }
    };

    const handleUpdateSpatial = async (updatedSpatial) => {
        try {
            await api.updateSpatial(updatedSpatial.id, {
                name: updatedSpatial.name,
                wkt: updatedSpatial.wkt
            });
            await fetchSpatials();
            setSuccessMessage('Feature updated successfully!');
            setSnackbarOpen(true);
            setError(null);
        } catch (err) {
            setError(err.message);
            setSnackbarOpen(true);
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <WKTInputForm onAdd={fetchSpatials} />
                    <MapComponent
                        spatials={spatials}
                        selectedSpatial={selectedSpatial}
                        onFeatureAdded={handleFeatureAdded}
                        onDeleteSpatial={handleDeleteSpatial}
                        onFeatureSelected={setSelectedSpatial}
                        onUpdateSpatial={handleUpdateSpatial}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    {loading ? (
                        <CircularProgress />
                    ) : (
                        <SpatialTable
                            spatials={spatials}
                            selectedSpatial={selectedSpatial}
                            onSelectSpatial={setSelectedSpatial}
                            onRefresh={fetchSpatials}
                        />
                    )}
                </Grid>
            </Grid>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={error ? "error" : "success"}
                    sx={{ width: '100%' }}
                >
                    {error || successMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default App;