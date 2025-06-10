'use client';

import { useState } from 'react';
import type {
  Control,
  ControllerRenderProps,
  FieldValues,
  Path,
} from 'react-hook-form';

import { lowerCase, startCase } from '@repo/shared/lib/utils';

import { cn } from '@/lib/utils';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

type Props<T extends FieldValues> =
  React.InputHTMLAttributes<HTMLInputElement> & {
    control: Control<T>;
    label?: string;
    name: Path<T>;
    id?: string;
    placeholder?: string;
    disabled?: boolean;
    withLabel?: boolean;
    mandatory?: boolean;
    containerCN?: string;
    inputWrapperCN?: string;
    inputClassName?: string;
    overrideOnChange?: (
      e: React.ChangeEvent<HTMLInputElement>,
      field: ControllerRenderProps<FieldValues, string>
    ) => void;
    additionalOnChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    stringMode?: boolean;
  };

export default function InputNumber<T extends FieldValues>({
  control,
  label,
  name,
  placeholder,
  disabled,
  withLabel = true,
  mandatory,
  containerCN,
  inputClassName,
  overrideOnChange,
  additionalOnChange,
  stringMode,
  ...props
}: Props<T>) {
  const [displayValue, setDisplayValue] = useState<string>('');
  const [isEmptyDeleted, setIsEmptyDeleted] = useState<boolean>(false);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: ControllerRenderProps<any>
  ) => {
    if (overrideOnChange) {
      overrideOnChange(e, field);
      return;
    }

    const val = e.target.value;
    setDisplayValue(val);

    // Track if the field was explicitly cleared (deleted all content)
    if (val === '') {
      setIsEmptyDeleted(true);
    } else {
      setIsEmptyDeleted(false);
    }

    field.onChange(stringMode ? val : val === '' ? 0 : Number(val));
    additionalOnChange?.(e);
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        // Determine what to show in the input
        // Show empty only when the field was explicitly cleared and the value is 0
        const inputValue =
          isEmptyDeleted && field.value === 0
            ? ''
            : displayValue || String(field.value);

        return (
          <FormItem className={cn(containerCN)}>
            {withLabel && (
              <FormLabel>
                {label || startCase(name)}
                {mandatory && <span className='text-[#f00]'>*</span>}
              </FormLabel>
            )}
            <FormControl>
              <Input
                type='number'
                placeholder={
                  !disabled
                    ? placeholder ||
                      label ||
                      `Enter ${lowerCase(name)}...` ||
                      'Type something...'
                    : undefined
                }
                {...props}
                value={inputValue}
                className={cn('bg-background', inputClassName)}
                onChange={(e) => onChange(e, field)}
                onFocus={(e) => {
                  if (
                    !fieldState.isDirty &&
                    field.value === 0 &&
                    isEmptyDeleted
                  ) {
                    // Select all text so user can immediately start typing
                    e.target.select();
                  }
                }}
                onKeyDown={(e) => {
                  //! prevent 'e', 'E' , '+' keys from being entered
                  const keys = [
                    'e',
                    'E',
                    '+',
                    ...(stringMode ? ['-', '.', ','] : []),
                  ];

                  if (keys.includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onWheelCapture={(e) => {
                  //! disable scroll onChange
                  e.currentTarget.blur();
                }}
                disabled={disabled}
              />
            </FormControl>
            <FormMessage className='text-xs' />
          </FormItem>
        );
      }}
    />
  );
}
