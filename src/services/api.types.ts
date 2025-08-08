// src/services/api.types.ts

// Auth Types
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

// Category Types
export interface Category {
  id: string;
  name: string;
  type: "expense" | "income";
  icon?: string;
  color?: string;
  user_id: string;
}
export interface CategoryCreatePayload {
  name: string;
  type: "expense" | "income";
  icon?: string;
  color?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  icon?: string;
  color?: string;
}

// Transaction Types
export interface TransactionCreatePayload {
  type: "expense" | "income";
  amount: number;
  transaction_date: string; // ISO 8601 string
  description?: string;
  category_id: string;
  group_id?: string;
  payer_id: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  group_id?: string;
  type: "expense" | "income";
  amount: number;
  transaction_date: string;
  description?: string;
  category: {
    id: string;
    name: string;
    icon?: string;
  };
  created_at: string;
  updated_at: string;
  payer_id: string;
}

export interface UpdateTransactionPayload {
  type?: "expense" | "income";
  amount?: number;
  transaction_date?: string;
  description?: string;
  category_id?: string;
  group_id?: string;
  payer_id: string;
}

export interface TransactionSummaryData {
  income: number;
  expense: number;
}

export interface TransactionSummaryResponse {
  current_month: TransactionSummaryData;
  previous_month: TransactionSummaryData;
}

// --- Group Types ---

// 代表群組中的一個成員 (從後端 UserInGroup 模型映射)
export interface GroupMember {
  id: string;
  email: string;
}

// 代表一個完整的群組物件 (從後端 GroupPublic 模型映射)
export interface Group {
  id: string;
  name: string;
  owner_id: string;
  members: GroupMember[];
  created_at: string;
}
