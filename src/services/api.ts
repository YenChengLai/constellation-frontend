// src/services/api.ts

import axios from "axios";

// 1. 建立一個 Axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. 設定請求攔截器 (Request Interceptor)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. 定義 API 函式

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
}

export interface SignupResponse {
  user_id: string;
  email: string;
}

/**
 * 使用者登入
 * @param credentials - 包含 email 和 password 的物件
 * @returns Promise，包含 access_token 和 refresh_token
 */
export const login = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>("/login", credentials);
    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

/**
 * 使用者註冊
 * @param credentials - 包含 email 和 password 的物件
 * @returns Promise，包含新建立的使用者資訊
 */
export const signup = async (
  credentials: SignupCredentials
): Promise<SignupResponse> => {
  try {
    const response = await apiClient.post<SignupResponse>(
      "/signup",
      credentials
    );
    return response.data;
  } catch (error) {
    console.error("Signup failed:", error);
    throw error;
  }
};

/**
 * 使用者登出
 * @param refreshToken - 要使其失效的 refresh token
 */
export const logout = async (refreshToken: string): Promise<void> => {
  try {
    await apiClient.post("/logout", { refresh_token: refreshToken });
  } catch (error) {
    // It's okay if this fails (e.g., token already expired).
    // The main goal is to clear the client-side state.
    console.error("Logout API call failed:", error);
  }
};

// 4. (可選) 匯出 apiClient instance
export default apiClient;
