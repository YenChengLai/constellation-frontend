import axios from "axios";
import type {
  LoginCredentials,
  AuthResponse,
  SignupCredentials,
  SignupResponse,
  Category,
  CategoryCreatePayload,
  Transaction,
  TransactionCreatePayload,
  UpdateTransactionPayload,
} from "./api.types";

// ✨ 1. 建立一個工廠函式來產生 API Client
// 這樣我們就不需要重複撰寫攔截器的邏輯
const createApiClient = (baseURL: string) => {
  const client = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // 每個 client 共用相同的請求攔截器
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    // 對於成功的請求 (狀態碼 2xx)，直接回傳回應
    (response) => response,
    // 對於失敗的請求，進行判斷
    (error) => {
      // 檢查錯誤是否由後端 API 回應，且狀態碼為 401 Unauthorized
      if (error.response && error.response.status === 401) {
        // 清除本地儲存的 tokens
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        // 將使用者導向到登入頁面，並重新整理頁面以確保所有狀態被重設
        window.location.href = "/login";
      }
      // 對於其他錯誤，正常地將其拋出
      return Promise.reject(error);
    }
  );

  return client;
};

// ✨ 2. 為每個微服務建立獨立的 client 實體
const authApiClient = createApiClient(import.meta.env.VITE_AUTH_API_URL);
const expenseApiClient = createApiClient(import.meta.env.VITE_EXPENSE_API_URL);

// --- Auth API ---
export const login = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  const response = await authApiClient.post<AuthResponse>(
    "/login",
    credentials
  );
  return response.data;
};

export const logout = async (refreshToken: string): Promise<void> => {
  await authApiClient.post("/logout", { refresh_token: refreshToken });
};

export const signup = async (
  credentials: SignupCredentials
): Promise<SignupResponse> => {
  const response = await authApiClient.post<SignupResponse>(
    "/signup",
    credentials
  );
  return response.data;
};

// --- Category API ---
export const getCategories = async (
  type?: "expense" | "income"
): Promise<Category[]> => {
  const response = await expenseApiClient.get("/categories", {
    params: { category_type: type },
  });
  return response.data;
};

export const createCategory = async (
  categoryData: CategoryCreatePayload
): Promise<Category> => {
  const response = await expenseApiClient.post("/categories", categoryData);
  return response.data;
};

// --- Transaction API ---
export const createTransaction = async (
  transactionData: TransactionCreatePayload
): Promise<Transaction> => {
  const response = await expenseApiClient.post(
    "/transactions",
    transactionData
  );
  return response.data;
};

/**
 * 獲取目前使用者的所有交易紀錄
 */
export const getTransactions = async (
  year: number,
  month: number
): Promise<Transaction[]> => {
  try {
    const response = await expenseApiClient.get("/transactions", {
      params: { year, month },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    throw error;
  }
};

/**
 * 更新一筆指定的交易
 * @param id - 交易的 ID
 * @param payload - 要更新的資料
 */
export const updateTransaction = async (
  id: string,
  payload: UpdateTransactionPayload
): Promise<Transaction> => {
  try {
    const response = await expenseApiClient.patch(
      `/transactions/${id}`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to update transaction ${id}:`, error);
    throw error;
  }
};

/**
 * 刪除一筆指定的交易
 * @param id - 交易的 ID
 */
export const deleteTransaction = async (id: string): Promise<void> => {
  try {
    await expenseApiClient.delete(`/transactions/${id}`);
  } catch (error) {
    console.error(`Failed to delete transaction ${id}:`, error);
    throw error;
  }
};
