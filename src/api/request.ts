import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';
import { API_CONFIG } from './config';
import type { ApiResponse } from '../types/connection';

// 创建 Axios 实例
const request: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 可以在这里添加 token 等认证信息
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => {
    const { data } = response;
    
    // 检查业务状态码
    if (data.code !== 0 && data.code !== 200) {
      toast.error(data.message || '请求失败');
      return Promise.reject(new Error(data.message));
    }
    
    return response;
  },
  (error) => {
    // 处理 HTTP 错误
    let message = '网络错误';
    
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          message = data?.message || '请求参数错误';
          break;
        case 401:
          message = '未授权，请重新登录';
          break;
        case 403:
          message = '拒绝访问';
          break;
        case 404:
          message = data?.message || '资源不存在';
          break;
        case 500:
          message = '服务器内部错误';
          break;
        case 502:
          message = '网关错误';
          break;
        case 503:
          message = '服务不可用';
          break;
        default:
          message = data?.message || `请求失败 (${status})`;
      }
    } else if (error.code === 'ECONNABORTED') {
      message = '请求超时';
    } else if (!navigator.onLine) {
      message = '网络连接已断开';
    }
    
    toast.error(message);
    console.error('Response error:', error);
    return Promise.reject(error);
  }
);

// 封装 GET 请求
export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  const response = await request.get<ApiResponse<T>>(url, config);
  return response.data;
}

// 封装 POST 请求
export async function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  const response = await request.post<ApiResponse<T>>(url, data, config);
  return response.data;
}

// 封装 PUT 请求
export async function put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  const response = await request.put<ApiResponse<T>>(url, data, config);
  return response.data;
}

// 封装 DELETE 请求
export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  const response = await request.delete<ApiResponse<T>>(url, config);
  return response.data;
}

export default request;
