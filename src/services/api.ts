

import axios from 'axios';

const api = axios.create({
  // endereço da API backend
  baseURL: 'https://localhost:7018/api' 
});

export default api;