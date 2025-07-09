import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import MapComponent from './components/MapComponent';
import SpatialTable from './components/SpatialTable';
import * as api from './services/api';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [spatials, setSpatials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSpatials = async () => {
    try {
      setLoading(true);
      const response = await api.getSpatials();
      setSpatials(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data || 'Failed to fetch spatial data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpatials();
  }, []);

  const handleMapClick = (coords) => {
    const lon = coords[0];
    const lat = coords[1];
    const defaultName = `Point at ${lon.toFixed(2)}, ${lat.toFixed(2)}`;
    const wkt = `POINT(${lon} ${lat})`;
    
    if (window.confirm(`Add new point at ${lon.toFixed(2)}, ${lat.toFixed(2)}?`)) {
      const name = prompt('Enter name for this point:', defaultName);
      if (name) {
        api.addSpatial(name, wkt)
          .then(() => fetchSpatials())
          .catch(err => setError(err.response?.data || 'Failed to add spatial'));
      }
    }
  };

  if (loading) {
    return <Container>Loading...</Container>;
  }

  return (
    <Container fluid className="mt-3">
      {error && <div className="alert alert-danger">{error}</div>}
      <Row>
        <Col md={8}>
          <h2>Spatial Data Map</h2>
          <MapComponent 
            spatials={spatials} 
            onMapClick={handleMapClick} 
          />
        </Col>
        <Col md={4}>
          <h2>Spatial Data Table</h2>
          <SpatialTable 
            spatials={spatials} 
            refreshData={fetchSpatials} 
          />
        </Col>
      </Row>
    </Container>
  );
}

export default App;