"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
  className?: string;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onChange,
  className,
}: DateRangePickerProps) {
  const date: DateRange | undefined = React.useMemo(() => {
    if (!startDate || !endDate) return undefined;
    return {
      from: parseISO(startDate),
      to: parseISO(endDate),
    };
  }, [startDate, endDate]);

  const handleSelect = (range: DateRange | undefined) => {
    if (range?.from) {
      const fromStr = format(range.from, "yyyy-MM-dd");
      const toStr = range.to ? format(range.to, "yyyy-MM-dd") : fromStr;
      onChange(fromStr, toStr);
    } else {
        onChange('', '');
    }
  };

  return (
    <div className={cn("grid gap-2 relative", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[260px] justify-start text-left font-bold bg-card border-border hover:bg-foreground/5 hover:text-foreground transition-all shadow-sm rounded-lg",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-foreground/70" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span className="text-foreground/60 uppercase text-[10px] font-black tracking-widest">Select Date Range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-card border-border shadow-2xl z-[10]" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={1}
            className="rounded-md border-0"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
