import axios from 'axios'
export const BASE_URL = 'http://localhost:3000'
export const API_CLIENT = axios.create({
    baseURL:BASE_URL,
    headers:{
        'Content-Type': 'multipart/form-data',
    }
})

