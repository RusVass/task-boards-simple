import axios from 'axios';
import { httpConfig } from './http.config';

export const http = axios.create(httpConfig);
