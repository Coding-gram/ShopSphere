import { useState } from 'react';
import { Edit3, MapPin, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AddressForm } from './AddressForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { Loader } from '@/components/common/Loader';
import { useAddresses } from '@/hooks/useAddresses';
import { cn } from '@/lib/utils';
import type { Address, AddressInput } from '@/types';

interface AddressBookProps {
  selectedAddressId?: string;
  onSelect?: (addressId: string) => void;
  onAddressSaved?: (address: Address) => void;
  title?: string;
}

export function AddressBook({ selectedAddressId, onSelect, onAddressSaved, title = 'Saved addresses' }: AddressBookProps) {
  const { addresses, isLoading, isError, refetch, createAddress, updateAddress, deleteAddress, isDeleting } = useAddresses();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | undefined>();

  function openCreate() {
    setEditingAddress(undefined);
    setDialogOpen(true);
  }

  async function saveAddress(input: AddressInput) {
    try {
      const response = editingAddress
        ? await updateAddress({ addressId: editingAddress._id, input })
        : await createAddress(input);
      toast.success(editingAddress ? 'Address updated' : 'Address added');
      setDialogOpen(false);
      onAddressSaved?.(response.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save this address');
    }
  }

  async function removeAddress(address: Address) {
    try {
      await deleteAddress(address._id);
      toast.success('Address deleted');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete this address');
    }
  }

  return (
    <section aria-labelledby="address-book-title" className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="address-book-title" className="font-heading text-2xl font-semibold text-foreground">{title}</h2>
          {onSelect && <p className="mt-1 text-sm text-muted-foreground">Choose where this order should be delivered.</p>}
        </div>
        <Button type="button" size="sm" onClick={openCreate} className="bg-accent text-on-accent hover:bg-accent/90">
          <Plus aria-hidden="true" /> Add address
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader /></div>
      ) : isError ? (
        <ErrorDisplay message="We couldn't load your addresses." onRetry={() => refetch()} className="py-10" />
      ) : addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <MapPin className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
          <p className="font-medium text-foreground">No saved addresses</p>
          <p className="text-sm text-muted-foreground">Add a delivery address to continue.</p>
        </div>
      ) : (
        <fieldset className="mt-5 grid gap-3">
          {onSelect && <legend className="sr-only">Select a delivery address</legend>}
          {addresses.map((address) => {
            const isSelected = selectedAddressId === address._id;
            return (
              <div key={address._id} className={cn('rounded-md border p-4 transition-colors duration-200', isSelected ? 'border-accent bg-accent/5' : 'border-border')}>
                <div className="flex items-start gap-3">
                  {onSelect && (
                    <input
                      id={`delivery-address-${address._id}`}
                      type="radio"
                      name="delivery-address"
                      value={address._id}
                      checked={isSelected}
                      onChange={() => onSelect(address._id)}
                      className="mt-1 h-4 w-4 accent-accent"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    {onSelect ? (
                      <label htmlFor={`delivery-address-${address._id}`} className="cursor-pointer font-medium text-foreground">
                        {address.fullName}
                      </label>
                    ) : <p className="font-medium text-foreground">{address.fullName}</p>}
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {address.street}, {address.city}, {address.state} {address.pincode}, {address.country}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{address.phone}</p>
                    {address.isDefault && <Badge variant="secondary" className="mt-2">Default</Badge>}
                  </div>
                  <div className="flex gap-1">
                    <button type="button" aria-label={`Edit address for ${address.fullName}`} onClick={() => { setEditingAddress(address); setDialogOpen(true); }} className="cursor-pointer rounded-md p-2 text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button type="button" aria-label={`Delete address for ${address.fullName}`} disabled={isDeleting} onClick={() => removeAddress(address)} className="cursor-pointer rounded-md p-2 text-muted-foreground transition-colors duration-200 hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </fieldset>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAddress ? 'Edit address' : 'Add an address'}</DialogTitle>
            <DialogDescription>Delivery details are saved securely to your account.</DialogDescription>
          </DialogHeader>
          <AddressForm key={editingAddress?._id ?? 'new'} address={editingAddress} onSubmit={saveAddress} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </section>
  );
}
