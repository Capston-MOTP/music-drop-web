import axios, { AxiosError } from "axios";

const apiClient = axios.create({
  baseURL: "",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 헤더 에이전트를 window.navigator.userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36";
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
