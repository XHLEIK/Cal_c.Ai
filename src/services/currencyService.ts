// Currency service to fetch and manage exchange rates

// Free currency API endpoint
const API_URL = 'https://open.er-api.com/v6/latest/USD';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface ExchangeRates {
  rates: Record<string, number>;
  lastUpdated: Date;
  base: string;
}

// List of currencies with their symbols and names
export const currencies: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'COP', name: 'Colombian Peso', symbol: '$' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei' },
];

// Default exchange rates (fallback if API fails)
const defaultRates: Record<string, number> = {
  USD: 1,
  EUR: 0.91,
  GBP: 0.78,
  JPY: 141.86,
  AUD: 1.49,
  CAD: 1.32,
  CHF: 0.87,
  CNY: 7.14,
  HKD: 7.81,
  NZD: 1.62,
  SEK: 10.26,
  KRW: 1275.63,
  SGD: 1.34,
  NOK: 10.16,
  MXN: 16.76,
  INR: 82.14,
  RUB: 90.33,
  ZAR: 17.96,
  TRY: 27.01,
  BRL: 4.78,
  TWD: 31.40,
  DKK: 6.77,
  PLN: 4.01,
  THB: 34.38,
  IDR: 15105.27,
  HUF: 347.14,
  CZK: 21.76,
  ILS: 3.66,
  CLP: 852.26,
  PHP: 54.97,
  AED: 3.67,
  COP: 3956.83,
  SAR: 3.75,
  MYR: 4.56,
  RON: 4.50,
};

// Cache for exchange rates
let cachedRates: ExchangeRates | null = null;

/**
 * Fetch the latest exchange rates from the API
 */
export const fetchExchangeRates = async (): Promise<ExchangeRates> => {
  try {
    // If we have cached rates that are less than 1 hour old, use them
    if (cachedRates && (new Date().getTime() - cachedRates.lastUpdated.getTime() < 3600000)) {
      return cachedRates;
    }

    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();
    
    // Create the exchange rates object
    const exchangeRates: ExchangeRates = {
      rates: data.rates,
      lastUpdated: new Date(data.time_last_update_utc),
      base: data.base_code,
    };

    // Cache the rates
    cachedRates = exchangeRates;
    
    return exchangeRates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    
    // Return default rates if API fails
    return {
      rates: defaultRates,
      lastUpdated: new Date(),
      base: 'USD',
    };
  }
};

/**
 * Convert an amount from one currency to another
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>
): number => {
  // If the currencies are the same, return the amount
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Get the exchange rates
  const fromRate = rates[fromCurrency];
  const toRate = rates[toCurrency];

  if (!fromRate || !toRate) {
    throw new Error(`Exchange rate not available for ${fromCurrency} or ${toCurrency}`);
  }

  // Convert to USD first (base currency), then to target currency
  const amountInUSD = amount / fromRate;
  return amountInUSD * toRate;
};

/**
 * Format a currency amount with the appropriate symbol
 */
export const formatCurrency = (
  amount: number,
  currencyCode: string,
  currencies: Currency[]
): string => {
  const currency = currencies.find(c => c.code === currencyCode);
  
  if (!currency) {
    return amount.toFixed(2);
  }

  // Format based on currency
  if (currencyCode === 'JPY' || currencyCode === 'KRW' || currencyCode === 'IDR') {
    // These currencies typically don't use decimal places
    return `${currency.symbol}${Math.round(amount).toLocaleString()}`;
  }

  return `${currency.symbol}${amount.toFixed(2)}`;
};
