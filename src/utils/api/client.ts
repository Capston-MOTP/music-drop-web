import axios, { AxiosError } from "axios";

const apiClient = axios.create({
  baseURL: "/",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// 헤더 에이전트를 window.navigator.userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36";
apiClient.interceptors.request.use(
  (config) => {
    console.log("Request:", config.url); // 디버깅용
    return config;
  },
  (error) => {
    console.error("Request Error:", error); // 디버깅용
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log("Response:", response); // 디버깅용
    return response;
  },
  async (error: AxiosError) => {
    console.error("Response Error:", error); // 디버깅용
    if (!error.response) {
      console.error("Network Error:", error.message);
      return Promise.reject(error);
    }

    const { status } = error.response;
    if (!status) {
      throw new Error("Unknown Error");
    }

    return Promise.reject(error.response.data);
  }
);

export default apiClient;
