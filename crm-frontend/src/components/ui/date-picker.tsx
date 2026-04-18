import * as React from 'react'
import { format, isValid, parse } from 'date-fns'
import { pt } from 'date-fns/locale/pt'
import { CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DatePickerProps {
  value: string | null
  onChange: (value: string) => void
  placeholder?: string
  id?: string
}

const DISPLAY_FORMAT = 'dd/MM/yyyy'
const STORAGE_FORMAT = 'yyyy-MM-dd'

function parseStored(value: string | null): Date | undefined {
  if (!value) return undefined
  const d = parse(value, STORAGE_FORMAT, new Date())
  return isValid(d) ? d : undefined
}

function parseTyped(input: string): Date | undefined {
  const normalized = input.trim().replace(/-/g, '/').replace(/\./g, '/')
  const d = parse(normalized, DISPLAY_FORMAT, new Date())
  return isValid(d) ? d : undefined
}

function toDisplay(value: string | null): string {
  const d = parseStored(value)
  return d ? format(d, DISPLAY_FORMAT) : ''
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'dd/mm/aaaa',
  id,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [text, setText] = React.useState(() => toDisplay(value))

  React.useEffect(() => {
    setText(toDisplay(value))
  }, [value])

  const selected = parseStored(value)
  const invalid = text.trim() !== '' && !parseTyped(text)

  const commitText = () => {
    const trimmed = text.trim()
    if (!trimmed) {
      if (value) onChange('')
      return
    }
    const d = parseTyped(trimmed)
    if (d) {
      const next = format(d, STORAGE_FORMAT)
      setText(format(d, DISPLAY_FORMAT))
      if (next !== value) onChange(next)
    } else {
      setText(toDisplay(value))
    }
  }

  const currentYear = new Date().getFullYear()

  return (
    <div className="relative">
      <Input
        id={id}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commitText}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            commitText()
          }
        }}
        placeholder={placeholder}
        className={cn('pr-10', invalid && 'border-destructive focus-visible:ring-destructive')}
        inputMode="numeric"
        autoComplete="off"
        aria-invalid={invalid || undefined}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
            aria-label="Abrir calendário"
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected ?? new Date()}
            onSelect={(day) => {
              if (day) {
                onChange(format(day, STORAGE_FORMAT))
                setText(format(day, DISPLAY_FORMAT))
                setOpen(false)
              }
            }}
            locale={pt}
            captionLayout="dropdown"
            startMonth={new Date(1970, 0)}
            endMonth={new Date(currentYear + 20, 11)}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
