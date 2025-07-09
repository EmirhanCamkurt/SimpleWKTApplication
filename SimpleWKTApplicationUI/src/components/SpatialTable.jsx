import React, { useState } from 'react';
import * as api from '../services/api';
import './SpatialTable.css';

const SpatialTable = ({ spatials, refreshData }) => {
    const [currentSpatial, setCurrentSpatial] = useState(null);
    const [name, setName] = useState('');
    const [wkt, setWkt] = useState('');
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const handleEdit = (spatial) => {
        setCurrentSpatial(spatial);
        setName(spatial.Name);
        const coords = spatial.WKT?.coordinates ||
            (spatial.WKT?.type === 'Point' ? spatial.WKT.coordinates : [0, 0]);
        setWkt(`POINT(${coords[0]} ${coords[1]})`);
    };

    const handleDelete = async (id) => {
        try {
            await api.deleteSpatial(id);
            refreshData();
        } catch (err) {
            setError(err.response?.data || 'Failed to delete spatial');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (currentSpatial) {
                await api.updateSpatial(currentSpatial.Id, name, wkt);
            } else {
                await api.addSpatial(name, wkt);
            }
            // Reset form after submission
            setCurrentSpatial(null);
            setName('');
            setWkt('');
            refreshData();
        } catch (err) {
            setError(err.response?.data || 'Failed to save spatial data');
        }
    };

    const handleCancelEdit = () => {
        setCurrentSpatial(null);
        setName('');
        setWkt('');
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = spatials.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(spatials.length / itemsPerPage);

    return (
        <div className="spatial-table-container">
            {error && <div className="error-message">{error}</div>}

            {/* Always-visible form section */}
            <div className="spatial-form">
                <h3>{currentSpatial ? 'Edit Spatial' : 'Add New Spatial'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>WKT (Well-Known Text)</label>
                        <textarea
                            value={wkt}
                            onChange={(e) => setWkt(e.target.value)}
                            required
                            placeholder="Example: POINT(30 10)"
                            rows={3}
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn save-btn">
                            {currentSpatial ? 'Update' : 'Add'} Spatial
                        </button>
                        {currentSpatial && (
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="btn cancel-btn"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <table className="spatial-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Coordinates</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map((spatial) => {
                        const coords = spatial.WKT?.coordinates || [null, null];
                        return (
                            <tr key={spatial.Id}>
                                <td>{spatial.Id}</td>
                                <td>{spatial.Name}</td>
                                <td>
                                    {coords[0]}, {coords[1]}
                                </td>
                                <td className="actions-cell">
                                    <button
                                        onClick={() => handleEdit(spatial)}
                                        className="btn edit-btn"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(spatial.Id)}
                                        className="btn delete-btn"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className="pagination">
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i + 1}
                        className={`page-btn ${i + 1 === currentPage ? 'active' : ''}`}
                        onClick={() => setCurrentPage(i + 1)}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SpatialTable;