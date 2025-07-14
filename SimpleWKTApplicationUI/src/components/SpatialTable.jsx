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
    Typography,
    TablePagination,
    Box,
    Tooltip
} from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';
import * as api from '../services/api';

const SpatialTable = ({ spatials = [], selectedSpatial, onSelectSpatial, onRefresh }) => {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [currentSpatial, setCurrentSpatial] = useState(null);
    const [editData, setEditData] = useState({ name: '', wkt: '' });
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const safeSpatials = Array.isArray(spatials) ? spatials : [];

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

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
        <Paper elevation={3} sx={{
            p: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden' }}>
            {error && (
                <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

           
            <TableContainer sx={{
                flex: 1,
                overflow: 'auto',
                maxHeight: 'calc(5 * 53px + 56px)'
            }}> 
                {safeSpatials.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body1" color="text.secondary">
                            No spatial data available
                        </Typography>
                    </Box>
                ) : (
                    <>
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
                                {safeSpatials
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((spatial) => (
                                        <TableRow
                                            key={`spatial-${spatial.id}`}
                                            hover
                                            selected={selectedSpatial?.id === spatial.id}
                                            onClick={() => onSelectSpatial(spatial)}
                                            sx={{ cursor: 'pointer' }}
                                        >
                                            <TableCell>{spatial.id || 'N/A'}</TableCell>
                                            <TableCell>{spatial.name || 'Unnamed'}</TableCell>
                                            <TableCell sx={{ maxWidth: 200 }}>
                                                <Typography noWrap>
                                                    {spatial.wkt ? `${spatial.wkt.substring(0, 30)}${spatial.wkt.length > 30 ? '...' : ''}` : 'N/A'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title="View on map">
                                                    <IconButton
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onSelectSpatial(spatial);
                                                        }}
                                                        disabled={!spatial.id}
                                                    >
                                                        <Visibility />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit">
                                                    <IconButton
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditClick(spatial);
                                                        }}
                                                        disabled={!spatial.id}
                                                    >
                                                        <Edit />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (spatial.id) handleDelete(spatial.id);
                                                        }}
                                                        disabled={!spatial.id}
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={safeSpatials.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </>
                )}
            </TableContainer>

            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Edit Spatial Data</DialogTitle>
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
                        helperText="Enter valid WKT format (e.g., POINT(30 10), POLYGON((30 10, 40 40, 20 40, 10 20, 30 10)))"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpdate} color="primary" variant="contained">
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default SpatialTable;