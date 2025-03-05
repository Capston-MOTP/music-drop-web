interface PermissionRequest {
  type: "PERMISSION_REQUEST";
}

interface PermissionResponse {
  type: "PERMISSION_RESPONSE";
  granted: boolean;
}

type RequestMessage = PermissionRequest;

// 앱에 메시지 전송
export const postMessage = (message: RequestMessage) => {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
  } else {
    console.warn("ReactNativeWebView is not available");
  }
};

// 위치 권한 요청 함수
export const requestPermission = () => {
  return new Promise<Omit<PermissionResponse, "type">>((resolve, reject) => {
    const timer = setTimeout(() => {
      document.removeEventListener("PERMISSION_RESPONSE", listener);
      reject("timeout");
    }, 5000); // 5초 타임아웃

    const listener = ((event: CustomEvent) => {
      clearTimeout(timer);
      document.removeEventListener("PERMISSION_RESPONSE", listener);
      resolve(event.detail);
    }) as EventListener;

    document.addEventListener("PERMISSION_RESPONSE", listener);
    console.log("requestPermission");
    postMessage({
      type: "PERMISSION_REQUEST",
    });
  });
};

// window 타입 확장
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage(message: string): void;
    };
  }
}
