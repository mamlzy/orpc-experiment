'use client';

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useORPC } from '@/context/orpc-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDebouncedValue } from '@mantine/hooks';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { addDays, format } from 'date-fns';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';

import { createInvoiceSchema, type CreateInvoiceSchema } from '@repo/db/schema';

import type { Outputs } from '@/lib/orpc';
import { getNextPageParamFn } from '@/lib/react-query';
import { formatIDRCurrency } from '@/lib/utils';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InputDatePickerRange } from '@/components/inputs/basic/input-datepicker-range';
import { InputCombobox } from '@/components/inputs/rhf/input-combobox';
import { InputComboboxPaginate } from '@/components/inputs/rhf/input-combobox-paginate';
import InputNumber from '@/components/inputs/rhf/input-number';
import { InputText } from '@/components/inputs/rhf/input-text';

import {
  invoiceTypeOptions,
  materaiOptions,
  ppnOptions,
  type PpnOptionValue,
} from './options';
import { countDPP, countGrandTotal, countPPN, countSubtotal } from './utils';

export default function Page() {
  const router = useRouter();
  const qc = useQueryClient();
  const orpc = useORPC();

  const form = useForm({
    mode: 'all',
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      dueDate: format(addDays(new Date(), 10), 'yyyy-MM-dd'),
      customerId: '',
      transactionId: '',
      type: 'DOWN_PAYMENT',
      percentage: '100',
      subtotal: '',
      taxAmount: '0',
      stampDuty: '0',
      grandTotal: '',
      // TODO: implement Bank Id
      bankId: '',
    },
  });

  //! count DPP
  const dppValue = countDPP({ subtotal: Number(form.watch('subtotal')) });

  //! count taxAmount (PPN)
  const [isIncludePPN, setIsIncludePPN] = useState(false);
  useEffect(() => {
    if (isIncludePPN) {
      form.setValue('taxAmount', countPPN({ dpp: dppValue }).toString());
    } else {
      form.setValue('taxAmount', '0');
    }
  }, [isIncludePPN, dppValue]);

  //! count grand total
  useEffect(() => {
    form.setValue(
      'grandTotal',
      countGrandTotal({
        subtotal: Number(form.watch('subtotal')),
        materai: Number(form.watch('stampDuty')),
        ppn: Number(form.watch('taxAmount')),
      }).toString()
    );
  }, [
    form.watch('subtotal'),
    form.watch('stampDuty'),
    form.watch('taxAmount'),
  ]);

  const [selectedTransaction, setSelectedTransaction] = useState<
    Outputs['sales']['transaction']['getAll']['data'][number] | null
  >(null);

  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSearchDebounce] = useDebouncedValue(customerSearch, 300);

  const customersQuery = useInfiniteQuery(
    orpc.masterData.customer.getAll.infiniteOptions({
      initialPageParam: 1,
      getNextPageParam: getNextPageParamFn,
      input: (pageParam) => ({
        page: pageParam,
        name: customerSearchDebounce,
      }),
    })
  );

  const [transactionSearch, setTransactionSearch] = useState('');
  const [transactionSearchDebounce] = useDebouncedValue(transactionSearch, 300);

  const transactionsQuery = useInfiniteQuery(
    orpc.sales.transaction.getAll.infiniteOptions({
      enabled: !!form.watch('customerId'),
      initialPageParam: 1,
      getNextPageParam: getNextPageParamFn,
      input: (pageParam) => ({
        page: pageParam,
        transactionId: transactionSearchDebounce,
        customerId: form.watch('customerId'),
        status: ['PENDING'],
      }),
    })
  );

  const createInvoiceMutation = useMutation(
    orpc.ar.invoice.create.mutationOptions()
  );

  const onSubmit: SubmitHandler<CreateInvoiceSchema> = async (values) => {
    createInvoiceMutation.mutate(values, {
      onSuccess: async () => {
        await qc.invalidateQueries({
          queryKey: orpc.ar.invoice.key(),
        });
        toast.success('Invoice created successfully');
        router.push('/ar/invoice');
      },
      onError: (error) => {
        console.error('error', error);

        toast.error(error.message);
      },
    });
  };

  return (
    <div className='container'>
      <Breadcrumb className='my-4'>
        <BreadcrumbList className='sm:gap-2'>
          <BreadcrumbItem>
            <BreadcrumbPage className='text-muted-foreground'>
              Ar
            </BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href='/ar/invoice'>Invoices</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h2 className='mb-6 text-3xl font-bold'>Create Invoice</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-6'>
          {/* Basic Information Section */}
          <div className='border-border bg-card rounded-lg border p-6'>
            <h3 className='text-foreground mb-4 text-lg font-semibold'>
              Basic Information
            </h3>

            <div className='grid gap-6 md:grid-cols-2'>
              {/* Date & Due Date */}
              <div className='md:col-span-2'>
                <div className='grid gap-2'>
                  <Label>
                    Date - Due Date<span className='text-[#f00]'>*</span>
                  </Label>

                  <InputDatePickerRange
                    value={{
                      from: new Date(form.watch('date')),
                      to: new Date(form.watch('dueDate')),
                    }}
                    onValueChange={(range) => {
                      form.setValue(
                        'date',
                        format(range?.from || new Date(), 'yyyy-MM-dd')
                      );
                      form.setValue(
                        'dueDate',
                        format(
                          range?.to || range?.from || new Date(),
                          'yyyy-MM-dd'
                        )
                      );
                    }}
                  />
                </div>
              </div>

              {/* Customer */}
              <div className='md:col-span-2'>
                <InputComboboxPaginate
                  control={form.control}
                  name='customerId'
                  label='Customer'
                  optionValue='id'
                  optionLabel='name'
                  query={customersQuery}
                  search={customerSearch}
                  getSingleQueryOptions={
                    orpc.masterData.customer.getById.queryOptions
                  }
                  setSearch={setCustomerSearch}
                  mandatory
                  additionalOnClear={() => {
                    form.setValue('transactionId', '');
                    form.setValue('subtotal', '0');
                  }}
                />
              </div>

              {/* Transaction */}
              <div className='md:col-span-2'>
                <InputComboboxPaginate
                  control={form.control}
                  name='transactionId'
                  label='Transaction'
                  optionValue='id'
                  optionLabel='id'
                  query={transactionsQuery}
                  search={transactionSearch}
                  getSingleQueryOptions={
                    orpc.sales.transaction.getById.queryOptions
                  }
                  setSearch={setTransactionSearch}
                  mandatory
                  disabled={!form.watch('customerId')}
                  additionalOnChange={(transaction) => {
                    setSelectedTransaction(transaction);
                    form.setValue('subtotal', transaction.subtotal);
                  }}
                  additionalOnClear={() => {
                    setSelectedTransaction(null);
                    form.setValue('subtotal', '0');
                  }}
                  description={`Total: ${formatIDRCurrency(
                    Number(form.watch('subtotal'))
                  )}`}
                />
              </div>

              {/* Type */}
              <InputCombobox
                control={form.control}
                name='type'
                options={invoiceTypeOptions}
                optionValue='value'
                optionLabel='label'
                mandatory
                clearable={false}
              />

              {/* Percentage */}
              <InputNumber
                control={form.control}
                name='percentage'
                label='Percentage'
                placeholder='Enter percentage'
                mandatory
                additionalOnChange={(e) => {
                  if (!selectedTransaction) return;

                  const percentage = e.target.value;
                  if (Number(percentage) === 0) {
                    form.setValue('subtotal', selectedTransaction.subtotal);
                    return;
                  }

                  form.setValue(
                    'subtotal',
                    countSubtotal({
                      grandTotal: Number(selectedTransaction.grandTotal),
                      percentage: Number(form.getValues('percentage')),
                    }).toFixed(2)
                  );
                }}
              />
            </div>
          </div>

          {/* Financial Calculation Section */}
          <div className='border-border bg-card rounded-lg border p-6'>
            <h3 className='text-foreground mb-4 text-lg font-semibold'>
              Financial Details
            </h3>

            <div className='grid gap-6 md:grid-cols-2'>
              {/* Subtotal */}
              <InputText
                control={form.control}
                name='subtotal'
                label='Subtotal'
                inputClassName='disabled:opacity-100 dark:bg-transparent'
                disabled
                formatIDRCurrency
              />

              {/* DPP */}
              <div className='grid gap-2'>
                <Label>DPP</Label>
                <div className='border-input flex h-9 items-center rounded-md border px-3 py-1 text-sm'>
                  {formatIDRCurrency(dppValue)}
                </div>
              </div>

              {/* Materai */}
              <InputCombobox
                control={form.control}
                name='stampDuty'
                label='Materai'
                options={materaiOptions}
                optionValue='value'
                optionLabel='label'
                mandatory
                description={`Charged: ${formatIDRCurrency(
                  Number(form.watch('stampDuty'))
                )}`}
                clearable={false}
              />

              {/* PPN */}
              <InputPpn
                taxAmount={Number(form.watch('taxAmount'))}
                isIncludePPN={isIncludePPN}
                setIsIncludePPN={setIsIncludePPN}
              />

              {/* Grand Total */}
              <div className='md:col-span-2'>
                <div className='grid gap-2'>
                  <Label className='text-lg font-medium leading-none'>
                    Grand Total
                  </Label>
                  <div className='border-input flex h-9 items-center rounded-md border px-3 py-1 text-sm font-semibold'>
                    {formatIDRCurrency(Number(form.watch('grandTotal')))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Section */}
          <div className='flex justify-center gap-4'>
            <Button type='submit' disabled={createInvoiceMutation.isPending}>
              {createInvoiceMutation.isPending
                ? 'Creating Invoice...'
                : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function InputPpn({
  taxAmount,
  isIncludePPN,
  setIsIncludePPN,
}: {
  taxAmount: number;
  isIncludePPN: boolean;
  setIsIncludePPN: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div className='grid gap-2'>
      <Label>
        PPN<span className='text-[#f00]'>*</span>
      </Label>
      <Select
        value={isIncludePPN ? 'yes' : 'no'}
        onValueChange={(value: PpnOptionValue) =>
          setIsIncludePPN(value === 'yes')
        }
      >
        <div className='grid gap-2'>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder='Select PPN' />
          </SelectTrigger>
          <p className='text-muted-foreground text-xs'>
            Charged: {formatIDRCurrency(taxAmount)}
          </p>
        </div>

        <SelectContent>
          <SelectGroup>
            {ppnOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
