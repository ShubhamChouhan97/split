export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Group {
  id: string;
  name: string;
  members: User[];
  totalExpenses: number;
  createdAt: string;
}

export interface Split {
  userId: string;
  amount: number;
}

export interface Expense {
  id: string;
  groupId: string;
  paidBy: string;
  amount: number;
  description: string;
  splits: Split[];
  createdAt: string;
}

export interface Settlement {
  id: string;
  groupId: string;
  payerId: string;
  receiverId: string;
  amount: number;
  createdAt: string;
}

export interface Balance {
  userId: string;
  amount: number;
}

export const currentUser: User = {
  id: "1",
  name: "Alex Johnson",
  email: "alex@example.com",
};

export const users: User[] = [
  currentUser,
  { id: "2", name: "Sarah Miller", email: "sarah@example.com" },
  { id: "3", name: "Mike Chen", email: "mike@example.com" },
  { id: "4", name: "Emily Davis", email: "emily@example.com" },
  { id: "5", name: "James Wilson", email: "james@example.com" },
];

export const groups: Group[] = [
  {
    id: "g1",
    name: "Apartment Rent",
    members: [users[0], users[1], users[2]],
    totalExpenses: 2450,
    createdAt: "2024-01-15",
  },
  {
    id: "g2",
    name: "Weekend Trip",
    members: [users[0], users[1], users[3], users[4]],
    totalExpenses: 890,
    createdAt: "2024-02-20",
  },
  {
    id: "g3",
    name: "Office Lunch",
    members: [users[0], users[2], users[4]],
    totalExpenses: 345,
    createdAt: "2024-03-01",
  },
  {
    id: "g4",
    name: "Birthday Party",
    members: [users[0], users[1], users[2], users[3]],
    totalExpenses: 520,
    createdAt: "2024-03-10",
  },
];

export const expenses: Expense[] = [
  {
    id: "e1",
    groupId: "g1",
    paidBy: "1",
    amount: 1200,
    description: "March Rent",
    splits: [
      { userId: "1", amount: 400 },
      { userId: "2", amount: 400 },
      { userId: "3", amount: 400 },
    ],
    createdAt: "2024-03-01",
  },
  {
    id: "e2",
    groupId: "g1",
    paidBy: "2",
    amount: 150,
    description: "Electricity Bill",
    splits: [
      { userId: "1", amount: 50 },
      { userId: "2", amount: 50 },
      { userId: "3", amount: 50 },
    ],
    createdAt: "2024-03-05",
  },
  {
    id: "e3",
    groupId: "g2",
    paidBy: "1",
    amount: 320,
    description: "Hotel Booking",
    splits: [
      { userId: "1", amount: 80 },
      { userId: "2", amount: 80 },
      { userId: "4", amount: 80 },
      { userId: "5", amount: 80 },
    ],
    createdAt: "2024-02-22",
  },
  {
    id: "e4",
    groupId: "g2",
    paidBy: "4",
    amount: 180,
    description: "Dinner",
    splits: [
      { userId: "1", amount: 45 },
      { userId: "2", amount: 45 },
      { userId: "4", amount: 45 },
      { userId: "5", amount: 45 },
    ],
    createdAt: "2024-02-23",
  },
  {
    id: "e5",
    groupId: "g3",
    paidBy: "3",
    amount: 85,
    description: "Team Lunch",
    splits: [
      { userId: "1", amount: 28.33 },
      { userId: "3", amount: 28.33 },
      { userId: "5", amount: 28.34 },
    ],
    createdAt: "2024-03-12",
  },
];

export const settlements: Settlement[] = [
  {
    id: "s1",
    groupId: "g1",
    payerId: "3",
    receiverId: "1",
    amount: 200,
    createdAt: "2024-03-10",
  },
];

export const getGroupById = (id: string): Group | undefined => {
  return groups.find((g) => g.id === id);
};

export const getExpensesByGroupId = (groupId: string): Expense[] => {
  return expenses.filter((e) => e.groupId === groupId);
};

export const getUserById = (id: string): User | undefined => {
  return users.find((u) => u.id === id);
};

export const calculateBalances = (groupId: string): Balance[] => {
  const groupExpenses = getExpensesByGroupId(groupId);
  const balanceMap = new Map<string, number>();

  groupExpenses.forEach((expense) => {
    const payer = expense.paidBy;
    balanceMap.set(payer, (balanceMap.get(payer) || 0) + expense.amount);
    
    expense.splits.forEach((split) => {
      balanceMap.set(split.userId, (balanceMap.get(split.userId) || 0) - split.amount);
    });
  });

  return Array.from(balanceMap.entries()).map(([userId, amount]) => ({
    userId,
    amount: Math.round(amount * 100) / 100,
  }));
};

export const getTotalBalance = (): { owed: number; owes: number } => {
  let owed = 0;
  let owes = 0;

  groups.forEach((group) => {
    const balances = calculateBalances(group.id);
    const userBalance = balances.find((b) => b.userId === currentUser.id);
    if (userBalance) {
      if (userBalance.amount > 0) {
        owed += userBalance.amount;
      } else {
        owes += Math.abs(userBalance.amount);
      }
    }
  });

  return {
    owed: Math.round(owed * 100) / 100,
    owes: Math.round(owes * 100) / 100,
  };
};

export const recentActivity = [
  { id: "a1", type: "expense", description: "Alex added 'March Rent' in Apartment Rent", time: "2 hours ago" },
  { id: "a2", type: "settle", description: "Mike settled up $200 with Alex", time: "1 day ago" },
  { id: "a3", type: "expense", description: "Emily added 'Dinner' in Weekend Trip", time: "2 days ago" },
  { id: "a4", type: "group", description: "You created 'Birthday Party'", time: "5 days ago" },
];
