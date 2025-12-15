const API_URL = import.meta.env.VITE_BACKEND_URL;

// Types matching backend response
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Group {
  _id: string;   
  id: string;              //  backend Mongo ID
  name: string;
  members: User[]; //backend may return IDs or populated users
  totalExpenses?: number;
  balances?: Balance[];
  debts?: Debt[];
  createdAt?: string;
}

export interface Debt {
  from: string;
  to: string;
  amount: number;
}

export interface Split {
  userId: string;
  userName: string;
  amount: number;
}

export interface Expense {
  _id?: string;
  id: string;
  groupId: string;
  paidBy: string;
  paidByName: string;
  amount: number;
  description: string;
  splits: Split[];
  createdAt: string;
}

export interface Balance {
  userId: string;
  amount: number;
}

export interface Settlement {
  id: string;
  groupId: string;
  payerId: string;
  receiverId: string;
  amount: number;
  createdAt: string;
}

// Helper function for API calls
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Groups API
export const groupsApi = {
  getAll: async () => {
    const groups = await apiRequest<Group[]>("/api/groups");
    return groups.map((g) => ({
      ...g,
      id: g.id || g._id,
      members: g.members || [],
      totalExpenses: Number(g.totalExpenses ?? 0),
    }));
  },
  
  getById: async (groupId: string) => {
    const group = await apiRequest<Group>(`/api/groups/${groupId}`);
    return {
      ...group,
      members: group.members || [],
      totalExpenses: Number(group.totalExpenses ?? 0),
      balances: (group.balances || []).map((b) => ({ ...b, amount: Number(b.amount ?? 0) })),
      debts: (group.debts || []).map((d) => ({ ...d, amount: Number(d.amount ?? 0) })),
    };
  },
  
  create: (data: { name: string; members: string[] }) =>
    apiRequest<Group>("/api/groups", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Expenses API
export const expensesApi = {
  getByGroupId: async (groupId: string) => {
    const expenses = await apiRequest<Expense[]>(`/api/expenses/group/${groupId}`);
    return expenses.map((e) => ({
      ...e,
      id: e.id || e._id || "",
      amount: Number(e.amount ?? 0),
      splits: (e.splits || []).map((s) => ({ ...s, amount: Number(s.amount ?? 0) })),
    }));
  },
  
  create: async (data: {
    groupId: string;
    description: string;
    amount: number;
    paidBy: string;
    splits: { userId: string; amount: number }[];
  }) => {
    const expense = await apiRequest<Expense>("/api/expenses", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return {
      ...expense,
      id: expense.id || expense._id || "",
      amount: Number(expense.amount ?? 0),
      splits: (expense.splits || []).map((s) => ({ ...s, amount: Number(s.amount ?? 0) })),
    };
  },
};

// Settlements API
export const settlementsApi = {
  getBalances: async (groupId: string) => {
    const balances = await apiRequest<Balance[]>(`/api/settlements/group/${groupId}`);
    return balances.map((b) => ({ ...b, amount: Number(b.amount ?? 0) }));
  },
  
  create: (data: {
    groupId: string;
    payerId: string;
    receiverId: string;
    amount: number;
  }) =>
    apiRequest<Settlement>("/api/settlements", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// User API (using auth endpoint for current user)
export const userApi = {
  getMe: () => apiRequest<User>("/api/auth/me"),
};

// Activity API
export const activityApi = {
  getRecent: () => apiRequest<any[]>("/api/activity"),
};
