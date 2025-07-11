import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    TextField,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Alert,
    Typography
} from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';
import * as api from '../services/api';

const SpatialTable = ({ spatials = [], selectedSpatial, onSelectSpatial, onRefresh }) => {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [currentSpatial, setCurrentSpatial] = useState(null);
    const [editData, setEditData] = useState({ name: '', wkt: '' });
    const [error, setError] = useState(null);

    
    const safeSpatials = Array.isArray(spatials) ? spatials : [];

    const handleEditClick = (spatial) => {
        if (!spatial?.id) {
            setError('Invalid spatial data: missing ID');
            return;
        }
        setCurrentSpatial(spatial);
        setEditData({
            name: spatial.name || '',
            wkt: spatial.wkt || ''
        });
        setEditDialogOpen(true);
    };

    const handleDelete = async (id) => {
        if (!id) {
            setError('Cannot delete: missing ID');
            return;
        }
        try {
            await api.deleteSpatial(id);
            onRefresh();
        } catch (error) {
            setError(`Delete failed: ${error.message || error}`);
        }
    };

   
const handleUpdate = async () => {
    if (!currentSpatial?.id) {
        setError('Cannot update: missing ID');
        return;
    }
    try {
        await api.updateSpatial(currentSpatial.id, {
            name: editData.name,
            wkt: editData.wkt
        });
        setEditDialogOpen(false);
        onRefresh(); 
        setError(null);
    } catch (error) {
        setError(`Update failed: ${error.message || error}`);
    }
};

    return (
        <>
            {error && (
                <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper}>
                {safeSpatials.length === 0 ? (
                    <Typography variant="body1" sx={{ p: 2 }}>
                        No spatial data available
                    </Typography>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>WKT Preview</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {safeSpatials.map((spatial) => (
                                <TableRow
                                    key={`spatial-${spatial.id}`}
                                    hover
                                    selected={selectedSpatial?.id === spatial.id}
                                    onClick={() => onSelectSpatial(spatial)}
                                    sx={{ cursor: 'pointer' }}
                                >
                                    <TableCell>{spatial.id || 'N/A'}</TableCell>
                                    <TableCell>{spatial.name || 'Unnamed'}</TableCell>
                                    <TableCell>
                                        {spatial.wkt ? `${spatial.wkt.substring(0, 30)}${spatial.wkt.length > 30 ? '...' : ''}` : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelectSpatial(spatial);
                                            }}
                                            disabled={!spatial.id}
                                        >
                                            <Visibility />
                                        </IconButton>
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditClick(spatial);
                                            }}
                                            disabled={!spatial.id}
                                        >
                                            <Edit />
                                        </IconButton>
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (spatial.id) handleDelete(spatial.id);
                                            }}
                                            disabled={!spatial.id}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </TableContainer>

            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Edit Spatial</DialogTitle>
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
                        rows={10}
                        value={editData.wkt}
                        onChange={(e) => setEditData({ ...editData, wkt: e.target.value })}
                        helperText="Enter valid WKT format"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpdate} color="primary">Update</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SpatialTable;