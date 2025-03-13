import axios, { AxiosError } from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response; // 데이터만 반환
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

export default apiClient;
