import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import {
  useController,
  useFormContext,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';

import { lowerCase, startCase } from '@repo/shared/lib/utils';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type Props<T extends FieldValues, K extends Record<string, any>> = {
  control: Control<T>;
  options: K[];
  inputValue?: string;
  setInputValue?: React.Dispatch<React.SetStateAction<string>>;
  optionValue: keyof K;
  name: Path<T>;
  id?: string;
  label?: string;
  placeholder?: string;
  description?: string;
  mandatory?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  additionalOnChange?: (option: K) => void;
  additionalOnClear?: () => void;
} & (
  | { getSelectedOptionLabel?: never; optionLabel: keyof K }
  | {
      getSelectedOptionLabel: (option: K) => string | false | undefined;
      optionLabel?: never;
    }
);

export function InputCombobox<
  T extends FieldValues,
  K extends Record<string, any>,
>({
  control,
  options = [],
  inputValue,
  setInputValue,
  optionValue,
  optionLabel = 'label',
  name,
  id,
  label,
  placeholder,
  description,
  mandatory,
  disabled,
  clearable = true,
  additionalOnChange = () => {},
  additionalOnClear = () => {},
  getSelectedOptionLabel,
}: Props<T, K>) {
  const [open, setOpen] = useState(false);
  const [triggerWidth, setTriggerWidth] = useState<number | null>(null);

  const { setValue } = useFormContext();
  const {
    field,
    fieldState: { error },
  } = useController({ control, name });

  const selectedOption = options.find(
    (option) => option[optionValue] === field.value
  );

  // @ts-expect-error
  const selectedOptionLabel = () => getSelectedOptionLabel?.(selectedOption);

  const handleBlur = () => {
    setInputValue?.('');
  };

  const onChange = (option: K) => {
    //! (clearable) if value the same, reset.
    if (option[optionValue] === field.value) {
      if (clearable) {
        field.onChange('');
        additionalOnClear?.();
        setInputValue?.('');
      }
      setOpen(false);
      return;
    }

    //! set value
    setValue(name, option[optionValue], { shouldValidate: true });
    additionalOnChange(option);
    setInputValue?.('');
    setOpen(false);
  };

  const onClear = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    field.onChange(null);
    additionalOnClear();

    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <div className='grid gap-2'>
        <Label htmlFor={id || name} className={cn(error && 'text-destructive')}>
          {label || startCase(name)}
          {mandatory && <span className='text-[#f00]'>*</span>}
        </Label>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            ref={(node) => {
              field.ref(node);
              if (node) setTriggerWidth(node.offsetWidth);
            }}
            role='combobox'
            aria-expanded={open}
            className='hover:bg-accent disabled:bg-muted data-[state=open]:ring-primary group relative block w-full overflow-hidden px-2 font-normal data-[state=open]:border-transparent data-[state=open]:ring-2'
            disabled={disabled}
          >
            {/* Value / Placeholder */}
            <span
              className={cn(
                'block truncate pr-10 text-start',
                !(field.value && selectedOption) &&
                  'text-muted-foreground font-normal'
              )}
            >
              {field.value && selectedOption
                ? selectedOptionLabel() || selectedOption[optionLabel]
                : !disabled //! placeholder
                  ? placeholder || label || name
                    ? placeholder || `Select ${lowerCase(label || name)}...`
                    : 'Select Option...'
                  : undefined}
            </span>

            <div
              className={cn(
                'absolute inset-y-0 right-0 flex items-center transition-colors',
                disabled && 'bg-muted'
              )}
            >
              {/* RESET BUTTON */}
              <div
                className={cn(
                  'hidden h-full shrink-0 place-items-center',
                  clearable && field.value && !disabled && 'grid'
                )}
              >
                {/* CLOSE BUTTON */}
                <span
                  className='rounded-md p-1 opacity-50'
                  onClick={onClear}
                  role='button'
                  tabIndex={0}
                >
                  <X size={16} />
                  <span className='sr-only'>clear button</span>
                </span>
              </div>

              {/* CHEVRON ICON */}
              <div className='mr-2 grid h-full place-items-center'>
                <ChevronDown size={16} className='shrink-0 opacity-50' />
              </div>
            </div>
          </Button>
        </PopoverTrigger>

        {/* Description */}
        {description && (
          <p className='text-muted-foreground text-xs'>{description}</p>
        )}

        {/* Error Message */}
        {error?.message && (
          <p className='text-xs text-red-600'>{error.message}</p>
        )}
      </div>
      <PopoverContent
        align='start'
        // className='w-auto max-w-[22rem] p-0 xl:max-w-none' //! old way
        className='p-0'
        style={{ width: triggerWidth || undefined }} //! hack: width follows the trigger width
      >
        <Command>
          <CommandInput
            placeholder='Search option...'
            value={inputValue}
            onValueChange={
              setInputValue ? (search) => setInputValue(search) : undefined
            }
            onBlur={handleBlur}
            className={cn('font-normal')}
          />
          <CommandList className='max-h-60 w-full overflow-y-auto p-1'>
            <CommandEmpty>No option found.</CommandEmpty>

            {/* Option Component */}
            {options.map((option) => (
              <CommandItem
                key={option[optionValue]}
                value={option[optionLabel]}
                onSelect={() => onChange(option)}
                className={cn(
                  field.value === option[optionValue] &&
                    'bg-primary text-primary-foreground data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground data-[selected=true]:hover:bg-primary/90'
                )}
              >
                {getSelectedOptionLabel?.(option) || option[optionLabel]}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
