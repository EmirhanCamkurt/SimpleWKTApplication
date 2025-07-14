import axios from 'axios';

const API_URL = 'https://localhost:7138';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

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

const transformSpatial = (spatial) => {
    let wkt = '';

    if (typeof spatial.wkt === 'string') {
        wkt = spatial.wkt;
    }
    else if (spatial.wkt && spatial.wkt.type) {
        wkt = formatWkt(spatial.wkt);
    }
    else if (spatial.WKT) {
        wkt = typeof spatial.WKT === 'string' ? spatial.WKT : formatWkt(spatial.WKT);
    } else if (spatial.geometry) {
        wkt = formatWkt(spatial.geometry);
    }

    return {
        id: spatial.id || spatial.Id,
        name: spatial.name || spatial.Name,
        wkt: wkt 
    };
};

export const getSpatials = async () => {
    try {
        
        const response = await axios.get(`${API_URL}/Spatial`);
        console.log('Full response:', response); 

        if (!response.data) {
            throw new Error('No data received from API');
        }

        const transformed = response.data.map(transformSpatial);
        console.log('Transformed data:', transformed);
        return transformed;
    } catch (error) {
        console.error('API Error:', error);
        throw error; 
    }
};



export const updateSpatial = async (id, data) => {
    const response = await axios.put(`${API_URL}/Spatial/${id}`, data);
    return response.data;
};

export const createSpatial = async (data) => {
    const response = await axios.post(`${API_URL}/Spatial`, data);
    return response.data;
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