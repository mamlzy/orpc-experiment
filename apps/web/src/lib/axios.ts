import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

interface AxiosConfig extends AxiosRequestConfig {
  baseURL: string | undefined;
  withCredentials: boolean;
}

const axiosConfig: AxiosConfig = {
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`,
  withCredentials: true,
};

const client: AxiosInstance = axios.create(axiosConfig);

const setToken = (token: string) => {
  client.defaults.headers.common.Authorization = `Bearer ${token}`;
};

const handleFailedRequest = (error: any): Promise<never> => {
  if (error === 'Invalid or expired token') {
    window.location.replace('/sign-in');
  }
  return Promise.reject(error);
};

const request = async (options: AxiosRequestConfig) => {
  try {
    const response = await client(options);
    return response.data;
  } catch (err: any) {
    return handleFailedRequest(err.response?.data?.message);
  }
};

export { request, setToken };
