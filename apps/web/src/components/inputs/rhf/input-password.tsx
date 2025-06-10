'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type {
  Control,
  ControllerRenderProps,
  FieldValues,
  Path,
} from 'react-hook-form';

import { lowerCase, startCase } from '@repo/shared/lib/utils';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
    placeholder?: string;
    disabled?: boolean;
    mandatory?: boolean;
    withLabel?: boolean;
    containerClassName?: string;
    labelClassName?: string;
    inputWrapperCN?: string;
    inputClassName?: string;
    withErrorMessage?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  };

export function InputPassword<T extends FieldValues>({
  control,
  label,
  name,
  placeholder,
  disabled,
  mandatory,
  withLabel = true,
  containerClassName,
  labelClassName,
  inputClassName,
  withErrorMessage = true,
  onChange: customOnChange,
  ...props
}: Props<T>) {
  const [showPassword, setShowPassword] = React.useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: ControllerRenderProps<any>
  ) => {
    const value = e.target.value === '' ? undefined : e.target.value;

    customOnChange?.(e);
    field.onChange(value);
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn(containerClassName)}>
          {withLabel && (
            <FormLabel className={cn('justify-self-start', labelClassName)}>
              {label || startCase(name)}
              {mandatory && <span className='text-[#f00]'>*</span>}
            </FormLabel>
          )}
          <FormControl>
            <div className='relative'>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder={
                  !disabled
                    ? placeholder ||
                      label ||
                      `Enter ${lowerCase(name)}...` ||
                      'Type password...'
                    : undefined
                }
                {...props}
                {...field}
                value={field.value || ''}
                className={cn('pr-10', inputClassName)}
                onChange={(e) => onChange(e, field)}
              />
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff className='text-muted-foreground h-4 w-4' />
                ) : (
                  <Eye className='text-muted-foreground h-4 w-4' />
                )}
                <span className='sr-only'>
                  {showPassword ? 'Hide password' : 'Show password'}
                </span>
              </Button>
            </div>
          </FormControl>
          {withErrorMessage && <FormMessage className='text-xs' />}
        </FormItem>
      )}
    />
  );
}
