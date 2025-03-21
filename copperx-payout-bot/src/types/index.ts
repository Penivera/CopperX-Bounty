import { Context, SessionStore,Telegraf } from 'telegraf';

export interface SessionData {
  authToken?: string;
  email?: string;
  organizationId?: string;
  userId?: string;
  tempData?: {
    recipientEmail?: string;
    recipientWallet?: string;
    amount?: number; 
    walletAddress?: string;
    bankDetails?: {
      accountNumber?: string;
      routingNumber?: string;
      accountName?: string;
    };
    otp?: string;
    transactionType?: 'email' | 'wallet' | 'bank';
  };
}

export interface CopperXContext extends Context {
  session: SessionData;
}

export type Bot = Telegraf<CopperXContext>;

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
}

export interface Wallet {
  id: string;
  network: string;
  address: string;
  isDefault: boolean;
  walletAddress:string;
}

export interface Balance {
  network: string;
  balance: number;
}

export interface Transfer {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  type: string;
  recipient?: string;
  recipientWallet?: string;
}

export interface KYCStatus {
  status: string;
  level: number;
}

export interface APIError {
  statusCode: number;
  message: string;
  error?: string;
}

export interface AuthResponse {
  accessToken: string;
  organizationId: string;
  userId: string;
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum Currency {
  USD = "USD",
  INR = "INR",
  AED = "AED",
  IDR = "IDR",
  PKR = "PKR",
  SGD = "SGD",
  EUR = "EUR",
  MYR = "MYR",
  CAD = "CAD",
  KYO = "KYO",
  LBP = "LBP",
  TRY = "TRY",
  XCD = "XCD",
  VND = "VND",
  THB = "THB",
  HKD = "HKD",
  BDT = "BDT",
  PHP = "PHP",
  KHR = "KHR",
  AUD = "AUD",
  GBP = "GBP",
  NPR = "NPR",
  LKR = "LKR",
  XOF = "XOF",
  XAF = "XAF",
  GHS = "GHS",
  KES = "KES",
  MZN = "MZN",
  TZS = "TZS",
  UGX = "UGX",
  NZD = "NZD",
  KMW = "KMW",
  MMK = "MMK",
  JPY = "JPY",
  BRL = "BRL",
  CNY = "CNY",
  USDC = "USDC",
  USDT = "USDT",
  DAI = "DAI",
  ETH = "ETH",
  USDCE = "USDCE",
  STRK = "STRK"
}


export enum PurposeCode {
  SELF = "self",
  SALARY = "salary",
  GIFT = "gift",
  INCOME = "income",
  SAVING = "saving",
  EDUCATION_SUPPORT = "education_support",
  FAMILY = "family",
  HOME_IMPROVEMENT = "home_improvement",
  REIMBURSEMENT = "reimbursement"
}