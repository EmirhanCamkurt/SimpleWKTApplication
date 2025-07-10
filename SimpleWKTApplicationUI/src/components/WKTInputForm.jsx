import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Alert } from '@mui/material';
import * as api from '../services/api';

const WKTInputForm = ({ onAdd }) => {
    const [name, setName] = useState('');
    const [wkt, setWkt] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await api.createSpatial({ name, wkt });
            onAdd();
            setName('');
            setWkt('');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Paper style={{ padding: '20px', marginBottom: '20px' }}>
            <Typography variant="h6" gutterBottom>
                Add New Spatial Data
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Name"
                    fullWidth
                    margin="normal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <TextField
                    label="WKT (Well-Known Text)"
                    fullWidth
                    margin="normal"
                    multiline
                    rows={4}
                    value={wkt}
                    onChange={(e) => setWkt(e.target.value)}
                    required
                    placeholder="Example: POINT(30 10) or POLYGON((30 10, 40 40, 20 40, 10 20, 30 10))"
                />
                <Button type="submit" variant="contained" color="primary" style={{ marginTop: '10px' }}>
                    Add Spatial Data
                </Button>
            </form>
        </Paper>
    );
};

export default WKTInputForm;