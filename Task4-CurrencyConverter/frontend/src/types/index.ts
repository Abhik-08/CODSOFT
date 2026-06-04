export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag?: string;
  flagUrl?: string;
}

export interface ExchangeRate {
  base: string;
  rates: Record<string, number>;
  date?: string;
}

export interface ConversionRequest {
  from: string;
  to: string;
  amount: number;
}

export interface ConversionResponse {
  from: string;
  to: string;
  amount: number;
  rate: number;
  result: number;
  timestamp: string;
}

export interface HistoricalRate {
  date: string;
  rate: number;
}

export interface ConversionHistoryItem {
  id: string;
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
  timestamp: string;
}

export interface APIError {
  message: string;
  status?: number;
}
