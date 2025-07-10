import axios from 'axios';

const API_URL = 'https://localhost:7138';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Convert backend WKT object to WKT string
const formatWkt = (wktObj) => {
    if (!wktObj) return '';
    switch (wktObj.type) {
        case 'Point':
            return `POINT(${wktObj.coordinates.join(' ')})`;
        case 'LineString':
            return `LINESTRING(${wktObj.coordinates.map(coord => coord.join(' ')).join(', ')})`;
        case 'Polygon':
            return `POLYGON((${wktObj.coordinates[0].map(coord => coord.join(' ')).join(', ')}))`;
        default:
            return '';
    }
};

// Update transformSpatial to handle both object and string WKT
const transformSpatial = (spatial) => {
    // Handle case where WKT might already be a string
    const wkt = typeof spatial.WKT === 'string'
        ? spatial.WKT
        : formatWkt(spatial.WKT);

    return {
        id: spatial.Id,
        name: spatial.Name,
        wkt: wkt
    };
};

export const getSpatials = async () => {
    try {
        // Remove the interceptor temporarily for debugging
        const response = await axios.get(`${API_URL}/Spatial`);
        console.log('Full response:', response); // Log entire response

        if (!response.data) {
            throw new Error('No data received from API');
        }

        const transformed = response.data.map(transformSpatial);
        console.log('Transformed data:', transformed);
        return transformed;
    } catch (error) {
        console.error('API Error:', error);
        throw error; // Re-throw to be caught in the component
    }
};

export const getSpatialById = async (id) => {
    const response = await api.get(`/Spatial/${id}`);
    return transformSpatial(response.data);
};

export const createSpatial = async (data) => {
    const response = await api.post('/Spatial', {
        Name: data.name,
        WKT: data.wkt // Backend should handle string WKT
    });
    return transformSpatial(response.data);
};

export const updateSpatial = async (id, data) => {
    const response = await api.put(`/Spatial/${id}`, {
        Name: data.name,
        WKT: data.wkt
    });
    return transformSpatial(response.data);
};

export const deleteSpatial = async (id) => {
    await api.delete(`/Spatial/${id}`);
};

api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        let message = 'An unexpected error occurred';
        if (error.response) {
            message = error.response.data?.message || error.response.data || error.response.statusText;
        } else if (error.request) {
            message = 'No response received from server';
        } else {
            message = error.message;
        }
        return Promise.reject(new Error(message));
    }
);

export default api;