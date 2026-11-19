import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * ISO 3166-1 alpha-2 → international dial code. NANP territories use their
 * area code (+1 268…) so a stored number maps back to the right flag; codes
 * shared by several regions resolve through DEFAULT_FOR_DIAL.
 */
const DIAL_CODES: Record<string, string> = {
  AD: '+376', AE: '+971', AF: '+93', AG: '+1268', AI: '+1264', AL: '+355', AM: '+374',
  AO: '+244', AR: '+54', AS: '+1684', AT: '+43', AU: '+61', AW: '+297', AX: '+358',
  AZ: '+994', BA: '+387', BB: '+1246', BD: '+880', BE: '+32', BF: '+226', BG: '+359',
  BH: '+973', BI: '+257', BJ: '+229', BL: '+590', BM: '+1441', BN: '+673', BO: '+591',
  BQ: '+599', BR: '+55', BS: '+1242', BT: '+975', BW: '+267', BY: '+375', BZ: '+501',
  CA: '+1', CC: '+61', CD: '+243', CF: '+236', CG: '+242', CH: '+41', CI: '+225',
  CK: '+682', CL: '+56', CM: '+237', CN: '+86', CO: '+57', CR: '+506', CU: '+53',
  CV: '+238', CW: '+599', CX: '+61', CY: '+357', CZ: '+420', DE: '+49', DJ: '+253',
  DK: '+45', DM: '+1767', DO: '+1809', DZ: '+213', EC: '+593', EE: '+372', EG: '+20',
  EH: '+212', ER: '+291', ES: '+34', ET: '+251', FI: '+358', FJ: '+679', FK: '+500',
  FM: '+691', FO: '+298', FR: '+33', GA: '+241', GB: '+44', GD: '+1473', GE: '+995',
  GF: '+594', GG: '+44', GH: '+233', GI: '+350', GL: '+299', GM: '+220', GN: '+224',
  GP: '+590', GQ: '+240', GR: '+30', GT: '+502', GU: '+1671', GW: '+245', GY: '+592',
  HK: '+852', HN: '+504', HR: '+385', HT: '+509', HU: '+36', ID: '+62', IE: '+353',
  IL: '+972', IM: '+44', IN: '+91', IO: '+246', IQ: '+964', IR: '+98', IS: '+354',
  IT: '+39', JE: '+44', JM: '+1876', JO: '+962', JP: '+81', KE: '+254', KG: '+996',
  KH: '+855', KI: '+686', KM: '+269', KN: '+1869', KP: '+850', KR: '+82', KW: '+965',
  KY: '+1345', KZ: '+7', LA: '+856', LB: '+961', LC: '+1758', LI: '+423', LK: '+94',
  LR: '+231', LS: '+266', LT: '+370', LU: '+352', LV: '+371', LY: '+218', MA: '+212',
  MC: '+377', MD: '+373', ME: '+382', MF: '+590', MG: '+261', MH: '+692', MK: '+389',
  ML: '+223', MM: '+95', MN: '+976', MO: '+853', MP: '+1670', MQ: '+596', MR: '+222',
  MS: '+1664', MT: '+356', MU: '+230', MV: '+960', MW: '+265', MX: '+52', MY: '+60',
  MZ: '+258', NA: '+264', NC: '+687', NE: '+227', NF: '+672', NG: '+234', NI: '+505',
  NL: '+31', NO: '+47', NP: '+977', NR: '+674', NU: '+683', NZ: '+64', OM: '+968',
  PA: '+507', PE: '+51', PF: '+689', PG: '+675', PH: '+63', PK: '+92', PL: '+48',
  PM: '+508', PR: '+1787', PS: '+970', PT: '+351', PW: '+680', PY: '+595', QA: '+974',
  RE: '+262', RO: '+40', RS: '+381', RU: '+7', RW: '+250', SA: '+966', SB: '+677',
  SC: '+248', SD: '+249', SE: '+46', SG: '+65', SH: '+290', SI: '+386', SJ: '+47',
  SK: '+421', SL: '+232', SM: '+378', SN: '+221', SO: '+252', SR: '+597', SS: '+211',
  ST: '+239', SV: '+503', SX: '+1721', SY: '+963', SZ: '+268', TC: '+1649', TD: '+235',
  TG: '+228', TH: '+66', TJ: '+992', TK: '+690', TL: '+670', TM: '+993', TN: '+216',
  TO: '+676', TR: '+90', TT: '+1868', TV: '+688', TW: '+886', TZ: '+255', UA: '+380',
  UG: '+256', US: '+1', UY: '+598', UZ: '+998', VA: '+39', VC: '+1784', VE: '+58',
  VG: '+1284', VI: '+1340', VN: '+84', VU: '+678', WF: '+681', WS: '+685', XK: '+383',
  YE: '+967', YT: '+262', ZA: '+27', ZM: '+260', ZW: '+263',
};

/** Region shown for a dial code several regions share, unless the user picked another. */
const DEFAULT_FOR_DIAL: Record<string, string> = {
  '+1': 'US',
  '+7': 'RU',
  '+39': 'IT',
  '+44': 'GB',
  '+47': 'NO',
  '+61': 'AU',
  '+212': 'MA',
  '+262': 'RE',
  '+358': 'FI',
  '+590': 'GP',
  '+599': 'CW',
};

/** E.164 caps a number at 15 digits, dial code included. */
const E164_MAX_DIGITS = 15;

type Country = {
  iso: string;
  name: string;
  dialCode: string;
  flag: string;
  /** Grouping mask ('0' = digit), only where the national format is fixed. */
  mask?: string;
  maxDigits: number;
};

function flagEmoji(iso: string): string {
  return String.fromCodePoint(...[...iso].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

/** "+1268" → "+1 268" (NANP area code); everything else unchanged. */
function formatDialCode(dialCode: string): string {
  return dialCode.startsWith('+1') && dialCode.length > 2
    ? `+1 ${dialCode.slice(2)}`
    : dialCode;
}

const COUNTRIES: Country[] = (() => {
  let regionNames: Intl.DisplayNames | null = null;
  try {
    regionNames = new Intl.DisplayNames(['pt-PT'], { type: 'region' });
  } catch {
    regionNames = null;
  }
  const all = Object.entries(DIAL_CODES).map(([iso, dialCode]): Country => {
    const isPt = iso === 'PT';
    return {
      iso,
      name: regionNames?.of(iso) ?? iso,
      dialCode,
      flag: flagEmoji(iso),
      mask: isPt ? '000 000 000' : undefined,
      maxDigits: isPt ? 9 : E164_MAX_DIGITS - (dialCode.length - 1),
    };
  });
  const collator = new Intl.Collator('pt-PT');
  const portugal = all.find((c) => c.iso === 'PT')!;
  const rest = all.filter((c) => c.iso !== 'PT').sort((a, b) => collator.compare(a.name, b.name));
  return [portugal, ...rest];
})();

const DEFAULT_COUNTRY = COUNTRIES[0];
const BY_ISO = new Map(COUNTRIES.map((c) => [c.iso, c]));
/** Dial codes without '+', longest first, for prefix matching (+351 before +35… before +3). */
const DIAL_PREFIXES = [...new Set(COUNTRIES.map((c) => c.dialCode.slice(1)))].sort(
  (a, b) => b.length - a.length,
);

function countryForDial(dialCode: string, preferredIso: string | null): Country {
  const preferred = preferredIso ? BY_ISO.get(preferredIso) : undefined;
  if (preferred?.dialCode === dialCode) return preferred;
  const fallbackIso = DEFAULT_FOR_DIAL[dialCode];
  return (
    (fallbackIso && BY_ISO.get(fallbackIso)) ||
    COUNTRIES.find((c) => c.dialCode === dialCode) ||
    DEFAULT_COUNTRY
  );
}

type ParsedPhone =
  | { kind: 'empty' }
  | { kind: 'phone'; dialCode: string; digits: string }
  /** Anything that can't be shown as dial code + digits without losing text. */
  | { kind: 'raw' };

/** "+351 912…" / "0044 20…" / "912…" → its digits, flagged international; null for text. */
function splitDigits(value: string): { international: boolean; digits: string } | null {
  const trimmed = value.trim();
  if (!/^\+?[\d\s().-]+$/.test(trimmed)) return null;
  let digits = trimmed.replace(/\D/g, '');
  let international = trimmed.startsWith('+');
  if (!international && digits.startsWith('00')) {
    international = true;
    digits = digits.slice(2);
  }
  return { international, digits };
}

/** Longest known dial code (without '+') that `digits` starts with. */
function matchDialPrefix(digits: string): string | undefined {
  return DIAL_PREFIXES.find((p) => digits.startsWith(p));
}

/**
 * "+351912345678", "+351 912 345 678", "0044 20…" → dial code + national digits.
 * A number without a "+"/"00" prefix belongs to `fallback` (Portugal, or the
 * country the user picked) when it fits. An international number keeps the
 * fallback's dial code when it starts with it, so +1 numbers typed under the
 * United States don't jump to a NANP territory (+1 787…) mid-entry. Text,
 * several numbers, a bare dial code or too many digits come back as raw.
 */
function parsePhone(value: string, fallback: Country): ParsedPhone {
  if (!value.trim()) return { kind: 'empty' };
  const split = splitDigits(value);
  if (!split || !split.digits) return { kind: 'raw' };
  const { international, digits } = split;

  if (!international) {
    return digits.length <= fallback.maxDigits
      ? { kind: 'phone', dialCode: fallback.dialCode, digits }
      : { kind: 'raw' };
  }

  const own = fallback.dialCode.slice(1);
  const ownNational = digits.slice(own.length);
  if (digits.startsWith(own) && ownNational && ownNational.length <= fallback.maxDigits) {
    return { kind: 'phone', dialCode: fallback.dialCode, digits: ownNational };
  }

  const prefix = matchDialPrefix(digits);
  if (!prefix) return { kind: 'raw' };
  const dialCode = `+${prefix}`;
  const national = digits.slice(prefix.length);
  const max = countryForDial(dialCode, null).maxDigits;
  return national && national.length <= max
    ? { kind: 'phone', dialCode, digits: national }
    : { kind: 'raw' };
}

/** National digits of a number that didn't parse (too long for its country), or null. */
function rawNationalDigits(value: string): string | null {
  const split = splitDigits(value);
  if (!split || !split.digits) return null;
  if (!split.international) return split.digits;
  const prefix = matchDialPrefix(split.digits);
  return prefix ? split.digits.slice(prefix.length) || null : null;
}

function applyMask(digits: string, mask: string): string {
  let result = '';
  let digitIndex = 0;
  for (const char of mask) {
    if (digitIndex >= digits.length) break;
    if (char === '0') {
      result += digits[digitIndex];
      digitIndex++;
    } else {
      result += char;
    }
  }
  return result;
}

interface PhoneInputProps {
  /** Stored as "+<dial code><digits>" (no spaces); '' when empty. */
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  /** Goes on the number input, so a `<label htmlFor>` points at it. */
  id?: string;
  'aria-label'?: string;
  autoFocus?: boolean;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}

export function PhoneInput({
  value,
  onChange,
  required,
  className,
  id,
  'aria-label': ariaLabel,
  autoFocus,
  onKeyDown,
}: PhoneInputProps) {
  // The stored value only carries the dial code, so remember which of the
  // regions sharing it (+1 US/CA, +44 GB/JE…) the user picked while editing.
  const [preferredIso, setPreferredIso] = React.useState<string | null>(null);
  const fallback = (preferredIso && BY_ISO.get(preferredIso)) || DEFAULT_COUNTRY;

  const parsed = parsePhone(value, fallback);
  const isRaw = parsed.kind === 'raw';
  const country = parsed.kind === 'phone' ? countryForDial(parsed.dialCode, preferredIso) : fallback;
  const digits = parsed.kind === 'phone' ? parsed.digits : '';

  const compose = (c: Country, d: string) => (d ? `${c.dialCode}${d}` : '');

  /** Normalises typed/pasted text when it parses; otherwise keeps it verbatim. */
  const emitText = (text: string) => {
    const next = parsePhone(text, fallback);
    if (next.kind === 'empty') onChange('');
    else if (next.kind === 'phone') onChange(`${next.dialCode}${next.digits}`);
    else onChange(text);
  };

  const handleCountryChange = (iso: string) => {
    const next = BY_ISO.get(iso);
    if (!next) return;
    setPreferredIso(iso);
    // Keep every digit: a number too long for the new country shows as raw
    // (with the tooltip) and comes back intact when the user switches back.
    let national: string | null = null;
    if (parsed.kind === 'phone') {
      national = parsed.digits;
      // NANP territories carry the area code in the dial code (+1 787): keep it.
      if (parsed.dialCode.startsWith('+1') && next.dialCode.startsWith('+1')) {
        national = parsed.dialCode.slice(2) + national;
      }
    } else if (parsed.kind === 'raw') {
      // Free text stays as it is; a digits-only number moves to the new country.
      national = rawNationalDigits(value);
    }
    if (national) onChange(compose(next, national));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    // "+44…" / "0044…" typed by hand carries its own dial code, like a paste.
    if (isRaw || /^\s*(\+|00)/.test(text)) {
      if (!isRaw) setPreferredIso(null);
      emitText(text);
      return;
    }
    // Keep reading the digits under the country on screen while typing.
    if (preferredIso !== country.iso) setPreferredIso(country.iso);
    onChange(compose(country, text.replace(/\D/g, '').slice(0, country.maxDigits)));
  };

  // A pasted international number ("+44 20 7946 0958") carries its own dial code.
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (isRaw) return;
    const text = e.clipboardData.getData('text');
    if (!/^\s*(\+|00)/.test(text)) return;
    e.preventDefault();
    const next = parsePhone(text, fallback);
    if (next.kind === 'phone') setPreferredIso(null);
    emitText(text);
  };

  const displayValue = isRaw
    ? value
    : country.mask
      ? applyMask(digits, country.mask)
      : digits;

  return (
    <div className={cn('flex gap-2', className)}>
      <Select value={country.iso} onValueChange={handleCountryChange}>
        <SelectTrigger className="w-28 shrink-0" aria-label="Indicativo do país">
          <SelectValue>
            <span aria-hidden>{country.flag}</span>
            <span className="type-mono">{formatDialCode(country.dialCode)}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-80 w-72">
          {COUNTRIES.map((c) => (
            <SelectItem
              key={c.iso}
              value={c.iso}
              textValue={c.name}
              className="*:[span]:last:min-w-0 *:[span]:last:flex-1"
            >
              <span aria-hidden>{c.flag}</span>
              <span className="min-w-0 flex-1 truncate">{c.name}</span>
              <span className="type-mono text-muted-foreground">{formatDialCode(c.dialCode)}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        id={id}
        value={displayValue}
        onChange={handleChange}
        onPaste={handlePaste}
        onKeyDown={onKeyDown}
        type="tel"
        inputMode={isRaw ? 'text' : 'tel'}
        autoComplete="tel-national"
        placeholder={country.mask ?? 'Número'}
        required={required}
        aria-label={ariaLabel}
        autoFocus={autoFocus}
        title={isRaw ? 'Formato não reconhecido: edite para normalizar' : undefined}
        className="flex-1 type-mono"
      />
    </div>
  );
}
