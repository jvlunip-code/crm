import * as React from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const COUNTRY_CODES = [
  { code: 'PT', dialCode: '+351', flag: '\u{1F1F5}\u{1F1F9}', mask: '000 000 000', maxDigits: 9 },
] as const

type CountryCode = (typeof COUNTRY_CODES)[number]

function applyMask(digits: string, mask: string): string {
  let result = ''
  let digitIndex = 0
  for (const char of mask) {
    if (digitIndex >= digits.length) break
    if (char === '0') {
      result += digits[digitIndex]
      digitIndex++
    } else {
      result += char
    }
  }
  return result
}

function parsePhoneValue(value: string): { country: CountryCode; digits: string } {
  const defaultCountry = COUNTRY_CODES[0]

  if (!value) return { country: defaultCountry, digits: '' }

  for (const country of COUNTRY_CODES) {
    if (value.startsWith(country.dialCode)) {
      const digits = value.slice(country.dialCode.length).replace(/\D/g, '').slice(0, country.maxDigits)
      return { country, digits }
    }
  }

  // Fallback: strip all non-digits and use default country
  const digits = value.replace(/\D/g, '').slice(0, defaultCountry.maxDigits)
  return { country: defaultCountry, digits }
}

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  required?: boolean
  className?: string
}

export function PhoneInput({ value, onChange, required, className }: PhoneInputProps) {
  const { country, digits } = parsePhoneValue(value)
  const maskedValue = applyMask(digits, country.mask)

  const handleDigitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, country.maxDigits)
    onChange(`${country.dialCode}${raw}`)
  }

  return (
    <div className={`flex gap-2 ${className ?? ''}`}>
      <Select value={country.code} disabled>
        <SelectTrigger className="w-[100px] shrink-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {COUNTRY_CODES.map(c => (
            <SelectItem key={c.code} value={c.code}>
              {c.flag} {c.dialCode}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        value={maskedValue}
        onChange={handleDigitChange}
        placeholder={country.mask.replace(/0/g, '0')}
        required={required}
        className="flex-1"
      />
    </div>
  )
}
