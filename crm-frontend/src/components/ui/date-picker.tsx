import * as React from 'react'
import { format, parse } from 'date-fns'
import { pt } from 'date-fns/locale/pt'
import { CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DatePickerProps {
  value: string | null
  onChange: (value: string) => void
  placeholder?: string
}

export function DatePicker({ value, onChange, placeholder = 'Selecionar data' }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const date = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined
  const validDate = date && !isNaN(date.getTime()) ? date : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !validDate && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {validDate ? format(validDate, 'dd/MM/yyyy', { locale: pt }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={validDate}
          onSelect={(day) => {
            if (day) {
              onChange(format(day, 'yyyy-MM-dd'))
            }
            setOpen(false)
          }}
          locale={pt}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
