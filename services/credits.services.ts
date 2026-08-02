import { api } from "./api";

export interface CreditPack {
  code: "small" | "medium" | "bulk";
  name: string;
  credits: number;
  priceKobo: number;
}

export interface CreditTransaction {
  id: string;
  type: "grant" | "purchase" | "spend" | "refund" | "adjustment";
  amount: number;
  balanceAfter: number;
  reference: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface CreditsWallet {
  balance: number;
  monthlyAllowance: number;
  lastMonthlyGrantAt: string;
  packs: CreditPack[];
  recentTransactions: CreditTransaction[];
}

interface Envelope<T> {
  error: boolean;
  message: string;
  data: T;
}

export const creditsService = {
  async getWallet() {
    const { data } = await api.get<Envelope<CreditsWallet>>("/credits");
    return data.data;
  },

  async getPacks() {
    const { data } = await api.get<Envelope<{ packs: CreditPack[] }>>(
      "/credits/packs"
    );
    return data.data.packs;
  },

  async getTransactions(page = 1, limit = 20) {
    const { data } = await api.get
      <Envelope<{ items: CreditTransaction[]; pagination: unknown }>
    >(`/credits/transactions?page=${page}&limit=${limit}`);
    return data.data;
  },

  async startPurchase(packCode: CreditPack["code"], callbackUrl?: string) {
    const { data } = await api.post
      <Envelope<{
        authorizationUrl: string;
        reference: string;
        accessCode: string;
        pack: CreditPack;
      }>
    >("/credits/purchase", {
      packCode,
      ...(callbackUrl ? { callbackUrl } : {}),
    });
    return data.data;
  },

  async verifyPurchase(reference: string) {
    const { data } = await api.get<Envelope<CreditsWallet>>(
      `/credits/verify?reference=${encodeURIComponent(reference)}`
    );
    return data.data;
  },
};