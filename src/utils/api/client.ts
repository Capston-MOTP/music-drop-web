import axios, { AxiosError } from "axios";

const authApiClient = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
});

export const nonAuthApiClient = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
});

authApiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

authApiClient.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error: AxiosError) => {
    if (!error.response) return Promise.reject(error);
    const {
      response: { status },
    } = error;
    if (!status) {
      throw new Error("Unknown Error");
    }

    return Promise.reject(error.response.data);
  }
);

export default authApiClient;
