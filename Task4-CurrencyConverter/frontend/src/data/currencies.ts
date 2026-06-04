import type { Currency } from '../types';

// Country codes for generating flags (ISO 3166-1 alpha-2)
const currencyToCountry: Record<string, string> = {
  USD: 'US', EUR: 'EU', GBP: 'GB', JPY: 'JP', CAD: 'CA', AUD: 'AU', CHF: 'CH', CNY: 'CN', INR: 'IN',
  NZD: 'NZ', BRL: 'BR', ZAR: 'ZA', MXN: 'MX', SGD: 'SG', HKD: 'HK', SEK: 'SE', NOK: 'NO', KRW: 'KR',
  TRY: 'TR', RUB: 'RU', AED: 'AE', AFN: 'AF', ALL: 'AL', AMD: 'AM', ANG: 'CW', AOA: 'AO', ARS: 'AR',
  AWG: 'AW', AZN: 'AZ', BAM: 'BA', BBD: 'BB', BDT: 'BD', BGN: 'BG', BHD: 'BH', BIF: 'BI', BMD: 'BM',
  BND: 'BN', BOB: 'BO', BSD: 'BS', BTN: 'BT', BWP: 'BW', BYN: 'BY', BZD: 'BZ', CDF: 'CD', CLP: 'CL',
  COP: 'CO', CRC: 'CR', CUP: 'CU', CVE: 'CV', CZK: 'CZ', DJF: 'DJ', DKK: 'DK', DOP: 'DO', DZD: 'DZ',
  EGP: 'EG', ERN: 'ER', ETB: 'ET', FJD: 'FJ', FKP: 'FK', GEL: 'GE', GHS: 'GH', GIP: 'GI', GMD: 'GM',
  GNF: 'GN', GTQ: 'GT', GYD: 'GY', HNL: 'HN', HRK: 'HR', HTG: 'HT', HUF: 'HU', IDR: 'ID', ILS: 'IL',
  IQD: 'IQ', IRR: 'IR', ISK: 'IS', JMD: 'JM', JOD: 'JO', KES: 'KE', KGS: 'KG', KHR: 'KH', KMF: 'KM',
  KPW: 'KP', KWD: 'KW', KYD: 'KY', KZT: 'KZ', LAK: 'LA', LBP: 'LB', LKR: 'LK', LRD: 'LR', LSL: 'LS',
  LYD: 'LY', MAD: 'MA', MDL: 'MD', MGA: 'MG', MKD: 'MK', MMK: 'MM', MNT: 'MN', MOP: 'MO', MRU: 'MR',
  MUR: 'MU', MVR: 'MV', MWK: 'MW', MYR: 'RM', MZN: 'MZ', NAD: 'NA', NGN: 'NG', NIO: 'NI', NPR: 'NP',
  OMR: 'OM', PAB: 'PA', PEN: 'PE', PGK: 'PG', PHP: 'PH', PKR: 'PK', PLN: 'PL', PYG: 'PY', QAR: 'QA',
  RON: 'RO', RSD: 'RS', RWF: 'RW', SAR: 'SA', SBD: 'SB', SCR: 'SC', SDG: 'SD', SHP: 'SH', SLL: 'SL',
  SOS: 'SO', SRD: 'SR', SSP: 'SS', STN: 'ST', SVC: 'SV', SYP: 'SY', SZL: 'SZ', THB: 'TH', TJS: 'TJ',
  TMT: 'TM', TND: 'TN', TOP: 'TO', UAH: 'UA', UGX: 'UG', UYU: 'UY', UZS: 'UZ', VES: 'VE', VND: 'VN',
  VUV: 'VU', WST: 'WS', XAF: 'CM', XCD: 'AG', XOF: 'SN', XPF: 'PF', YER: 'YE', ZMW: 'ZM', ZWL: 'ZW'
};

// Global currency symbol mapping
const currencySymbols: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', INR: '₹', AUD: 'A$', CAD: 'C$', CHF: 'CHF', CNY: '元',
  NZD: 'NZ$', BRL: 'R$', ZAR: 'R', MXN: '$', SGD: 'S$', HKD: 'HK$', SEK: 'kr', NOK: 'kr', KRW: '₩',
  TRY: '₺', RUB: '₽', AED: 'د.إ', AFN: '؋', ALL: 'L', AMD: '֏', ANG: 'ƒ', AOA: 'Kz', ARS: '$',
  AWG: 'ƒ', AZN: '₼', BAM: 'KM', BBD: '$', BDT: '৳', BGN: 'лв', BHD: '.د.ب', BIF: 'FBu', BMD: '$',
  BND: '$', BOB: 'Bs.', BSD: '$', BTN: 'Nu.', BWP: 'P', BYN: 'Br', BZD: '$', CDF: 'FC', CLP: '$',
  COP: '$', CRC: '₡', CUP: '₱', CVE: '$', CZK: 'Kč', DJF: 'Fdj', DKK: 'kr', DOP: 'RD$', DZD: 'د.ج',
  EGP: 'E£', ERN: 'Nfk', ETB: 'Br', FJD: '$', FKP: '£', GEL: '₾', GHS: '₵', GIP: '£', GMD: 'D',
  GNF: 'FG', GTQ: 'Q', GYD: '$', HNL: 'L', HRK: 'kn', HTG: 'G', HUF: 'Ft', IDR: 'Rp', ILS: '₪',
  IQD: 'ع.د', IRR: '﷼', ISK: 'kr', JMD: 'J$', JOD: 'د.ا', KES: 'KSh', KGS: 'сом', KHR: '៛', KMF: 'CF',
  KPW: '₩', KWD: 'د.ك', KYD: '$', KZT: '₸', LAK: '₭', LBP: 'ل.ل', LKR: '₨', LRD: '$', LSL: 'M',
  LYD: 'ل.د', MAD: 'د.م.', MDL: 'L', MGA: 'Ar', MKD: 'ден', MMK: 'K', MNT: '₮', MOP: 'MOP$', MRU: 'UM',
  MUR: '₨', MVR: '.ر', MWK: 'MK', MYR: 'RM', MZN: 'MT', NAD: '$', NGN: '₦', NIO: 'C$', NPR: '₨',
  OMR: 'ر.ع.', PAB: 'B/.', PEN: 'S/.', PGK: 'K', PHP: '₱', PKR: '₨', PLN: 'zł', PYG: 'Gs', QAR: 'ر.ق',
  RON: 'lei', RSD: 'دين.', RWF: 'FRw', SAR: 'ر.س', SBD: '$', SCR: '₨', SDG: 'ج.س.', SHP: '£', SLL: 'Le',
  SOS: 'Sh', SRD: '$', SSP: '£', STN: 'Db', SVC: '₡', SYP: '£', SZL: 'L', THB: '฿', TJS: 'SM',
  TMT: 'T', TND: 'د.ت', TOP: 'T$', UAH: '₴', UGX: 'USh', UYU: '$', UZS: 'soʻm', VES: 'Bs.S', VND: '₫',
  VUV: 'VT', WST: 'WS$', XAF: 'FCFA', XCD: '$', XOF: 'CFA', XPF: '₣', YER: '﷼', ZMW: 'ZK', ZWL: '$'
};

/**
 * Generate flag emoji from ISO 2-letter country code using Unicode surrogate pairs.
 */
export function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + (char.codePointAt(0) || 0));
  return String.fromCodePoint(...codePoints);
}

/**
 * Get compiled Currency metadata (code, name, symbol, flag) dynamically.
 * Falls back gracefully to code/name if mapping is absent.
 */
export function getCurrencyMetadata(code: string, nameFromAPI?: string): Currency {
  const upperCode = code.toUpperCase();
  const countryCode = currencyToCountry[upperCode];
  const flag = countryCode ? getFlagEmoji(countryCode) : undefined;
  const flagUrl = countryCode ? `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png` : undefined;
  const symbol = currencySymbols[upperCode] || '';
  
  let name = nameFromAPI || upperCode;
  if (!nameFromAPI) {
    try {
      const displayNames = new Intl.DisplayNames(['en'], { type: 'currency' });
      name = displayNames.of(upperCode) || upperCode;
      // Strip currency symbols if the display name starts with them (e.g. "US Dollar" vs "$")
      if (name === symbol || name.startsWith(symbol + ' ')) {
        name = name.substring(symbol.length).trim();
      }
    } catch {
      name = upperCode;
    }
  }

  return {
    code: upperCode,
    name,
    symbol,
    flag,
    flagUrl,
  };
}

// Fallback base list of major currencies in case API fetch fails on mount
export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'USD', name: 'United States Dollar', symbol: '$', flag: '🇺🇸', flagUrl: 'https://flagcdn.com/w40/us.png' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', flagUrl: 'https://flagcdn.com/w40/eu.png' },
  { code: 'GBP', name: 'British Pound Sterling', symbol: '£', flag: '🇬🇧', flagUrl: 'https://flagcdn.com/w40/gb.png' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', flagUrl: 'https://flagcdn.com/w40/jp.png' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', flagUrl: 'https://flagcdn.com/w40/in.png' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', flagUrl: 'https://flagcdn.com/w40/au.png' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦', flagUrl: 'https://flagcdn.com/w40/ca.png' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭', flagUrl: 'https://flagcdn.com/w40/ch.png' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '元', flag: '🇨🇳', flagUrl: 'https://flagcdn.com/w40/cn.png' },
];
