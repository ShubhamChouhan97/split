import { User } from "@/lib/api";

export interface Balance {
  user: User;
  amount: number; // positive if they owe you, negative if you owe them
}
