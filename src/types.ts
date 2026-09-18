export type GoldPurity = '24K' | '22K' | '21K' | '18K';

export type NisabMethod = 'silver' | 'gold';

export interface AssetInputs {
  cashSavings: number; // PKR
  goldGrams: number;
  goldPurity: GoldPurity;
  goldRatePerGram: number; // PKR per gram for 24K gold
  silverGrams: number;
  silverRatePerGram: number; // PKR per gram
  businessValue: number; // PKR
  liabilities: number; // PKR short-term debts
}

export interface ZakatSettings {
  nisabMethod: NisabMethod;
  defaultGoldRate: number;
  defaultSilverRate: number;
}

export interface CalculationResult {
  cashValue: number;
  goldValue: number;
  goldPureGrams: number;
  silverValue: number;
  businessValue: number;
  totalAssets: number;
  liabilities: number;
  netWealth: number;
  nisabMethod: NisabMethod;
  nisabGrams: number;
  nisabThresholdPKR: number;
  isEligible: boolean;
  shortfall: number;
  zakatDue: number;
  calculatedAt: string;
}

export type ScreenTab = 'input' | 'result' | 'chat' | 'settings';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isError?: boolean;
}
