import { Check, ChevronsUpDown } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { PensionerOption } from '@/data/communication-mock-data'
import { cn } from '@/lib/utils'

interface PensionerSearchComboboxProps {
  options: PensionerOption[]
  value: string
  onChange: (pensionerId: string) => void
  placeholder?: string
  disabled?: boolean
}

export function PensionerSearchCombobox({
  options,
  value,
  onChange,
  placeholder = 'Search by name or PPO number...',
  disabled,
}: PensionerSearchComboboxProps) {
  const [open, setOpen] = useState(false)

  const selected = useMemo(
    () => options.find((p) => p.id === value),
    [options, value],
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="h-auto min-h-10 w-full justify-between rounded-xl px-3 py-2 font-normal"
        >
          {selected ? (
            <span className="truncate text-left">
              <span className="font-medium">{selected.name}</span>
              <span className="text-muted-foreground"> · {selected.ppoNumber}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search name, PPO, department..." />
          <CommandList>
            <CommandEmpty>No pensioner found.</CommandEmpty>
            <CommandGroup heading="Portal demo pensioners">
              {options
                .filter((p) => p.isDemo)
                .map((p) => (
                  <CommandItem
                    key={p.id}
                    value={`${p.name} ${p.ppoNumber} ${p.department}`}
                    onSelect={() => {
                      onChange(p.id)
                      setOpen(false)
                    }}
                  >
                    <Check className={cn('mr-2 size-4', value === p.id ? 'opacity-100' : 'opacity-0')} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{p.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {p.ppoNumber} · {p.department}
                      </p>
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
            <CommandGroup heading="All registered pensioners">
              {options
                .filter((p) => !p.isDemo)
                .map((p) => (
                  <CommandItem
                    key={p.id}
                    value={`${p.name} ${p.ppoNumber} ${p.department}`}
                    onSelect={() => {
                      onChange(p.id)
                      setOpen(false)
                    }}
                  >
                    <Check className={cn('mr-2 size-4', value === p.id ? 'opacity-100' : 'opacity-0')} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{p.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {p.ppoNumber} · {p.department}
                      </p>
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
