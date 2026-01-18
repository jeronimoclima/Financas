

import axios from 'axios';

const api = axios.create({
  // Troque localhost por 127.0.0.1
  baseURL: 'https://localhost:7018/api' 
});

export default api;