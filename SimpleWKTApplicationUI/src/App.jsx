import React, { useState, useEffect } from 'react';
import { Container, Box, CircularProgress, Alert, Snackbar, Paper } from '@mui/material';
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
            setError(err.message || 'Failed to load spatial data');
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
            setError(err.message || 'Failed to add feature');
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
            setSelectedSpatial(null);
        } catch (err) {
            setError(err.message || 'Failed to delete feature');
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
            setError(err.message || 'Failed to update feature');
            setSnackbarOpen(true);
        }
    };

    return (
        <Container maxWidth="xl" sx={{
            py: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 3
        }}>
            
            <Box sx={{
                height: '70vh',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: 3,
                position: 'relative'
            }}>
                <MapComponent
                    spatials={spatials}
                    selectedSpatial={selectedSpatial}
                    onFeatureAdded={handleFeatureAdded}
                    onFeatureSelected={setSelectedSpatial}
                    onDeleteSpatial={handleDeleteSpatial}
                    onUpdateSpatial={handleUpdateSpatial}
                />
            </Box>

            
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 3,
                minHeight: '30vh',
                height: { xs: 'auto', md: '30vh' }
            }}>
                <Paper elevation={3} sx={{
                    flex: { xs: 'none', md: 0.4 }, 
                    width: { xs: '100%', md: 'auto' }, 
                    p: 3,
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <WKTInputForm onAdd={fetchSpatials} />
                </Paper>

                <Paper elevation={3} sx={{
                    flex: { xs: 'none', md: 0.6 }, 
                    width: { xs: '100%', md: 'auto' }, 
                    p: 2,
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    {loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                            <CircularProgress />
                        </Box>
                    ) : (
                        <SpatialTable
                            spatials={spatials}
                            selectedSpatial={selectedSpatial}
                            onSelectSpatial={setSelectedSpatial}
                            onRefresh={fetchSpatials}
                        />
                    )}
                </Paper>
            </Box>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={error ? "error" : "success"} sx={{ width: '100%' }}>
                    {error || successMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default App;