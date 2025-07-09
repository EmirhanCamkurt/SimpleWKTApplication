import axios from 'axios';

const API_URL = 'https://localhost:7138/Spatial';

export const getSpatials = async () => {
  return await axios.get(API_URL);
};

export const getSpatialById = async (id) => {
  return await axios.get(`${API_URL}/${id}`);
};

export const addSpatial = async (name, wkt) => {
  return await axios.post(API_URL, null, { params: { name, wkt } });
};

export const addSpatials = async (spatials) => {
  return await axios.post(`${API_URL}/range`, spatials);
};

export const updateSpatial = async (id, name, wkt) => {
  return await axios.put(`${API_URL}/${id}`, null, { params: { name, wkt } });
};

export const deleteSpatial = async (id) => {
  return await axios.delete(`${API_URL}/${id}`);
};

export const getSpatialsBetweenIds = async (startId, endId) => {
  return await axios.get(`${API_URL}/${startId}/${endId}`);
};