import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { EllipsisVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';

import { authClient } from '@repo/auth/client';
import { adminUserIds } from '@repo/shared';

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
  createColumnHelper<Outputs['masterData']['user']['getAll']['data'][number]>();

export const columns = [
  columnHelper.display({
    id: 'no',
    header: () => 'No',
    meta: {
      getCellContext: () => ({ className: '!w-px' }),
    },
    cell: (info) =>
      info.row.index +
      1 +
      info.table.getState().pagination.pageIndex *
        info.table.getState().pagination.pageSize,
  }),
  columnHelper.accessor('name', {
    header: () => 'Name',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('email', {
    header: () => 'Email',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('company.companyName', {
    header: () => 'Company',
    cell: (info) => info.getValue(),
  }),
  columnHelper.display({
    id: 'actions',
    meta: {
      getCellContext: () => ({ className: '!w-px' }),
    },
    cell: (info) => {
      const qc = useQueryClient();
      const user = info.row.original;
      const { data: session } = authClient.useSession();

      const isTargetUserAdmin = adminUserIds.includes(user.id);
      const isCurrentUserAdmin = adminUserIds.includes(session?.user.id ?? '');
      const canModify = !isTargetUserAdmin || isCurrentUserAdmin;

      const [showConfirmationDialog, setshowConfirmationDialog] =
        useState(false);

      const { id } = info.row.original;

      const deleteUserMutation = useMutation(
        orpc.masterData.user.deleteById.mutationOptions()
      );

      const handleDelete = () => {
        toast.promise(deleteUserMutation.mutateAsync({ id }), {
          loading: 'Loading...',
          success: async () => {
            await qc.invalidateQueries({
              queryKey: orpc.masterData.user.key(),
            });
            return `User deleted.`;
          },
          error: (err) => {
            console.log('err =>', err);
            return `Error, ${err.message}`;
          },
        });
      };

      if (!canModify) return null;

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
                <Link href={`/master-data/user/${id}`}>
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
