import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { EllipsisVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';

import { orpc, type Outputs } from '@/lib/orpc';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const columnHelper =
  createColumnHelper<
    Outputs['masterData']['service']['getAll']['data'][number]
  >();

export const columns = [
  columnHelper.accessor('name', {
    header: () => 'Name',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('description', {
    header: () => 'Description',
    cell: (info) => info.getValue(),
  }),
  columnHelper.display({
    id: 'actions',
    cell: (info) => {
      const qc = useQueryClient();

      const [showConfirmationDialog, setshowConfirmationDialog] =
        useState(false);

      const { id } = info.row.original;

      const deleteCustomerMutation = useMutation(
        orpc.masterData.service.deleteById.mutationOptions()
      );

      const handleDelete = () => {
        toast.promise(deleteCustomerMutation.mutateAsync({ id }), {
          loading: 'Loading...',
          success: async () => {
            await qc.invalidateQueries({
              queryKey: orpc.masterData.service.key(),
            });

            return `Service deleted.`;
          },
          error: (err) => {
            console.log('err =>', err);
            return `Error, ${err.message}`;
          },
        });
      };

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='hover:bg-primary/10'
              >
                <EllipsisVerticalIcon
                  strokeWidth={2.5}
                  className='text-muted-foreground !size-5'
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='end'
              sideOffset={0}
              className='font-normal'
            >
              <DropdownMenuItem asChild>
                <Link href={`/master-data/service/${id}`}>
                  <PencilIcon className='mr-2' />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setshowConfirmationDialog(true)}>
                <Trash2Icon className='mr-2' />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Delete Confirmation Dialog */}
          <AlertDialog
            open={showConfirmationDialog}
            onOpenChange={setshowConfirmationDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      );
    },
  }),
];
