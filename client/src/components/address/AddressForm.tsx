import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Address, AddressInput } from '@/types';

const addressSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100),
  phone: z.string().trim().regex(/^\+?[1-9]\d{7,14}$/, 'Enter a valid phone number'),
  street: z.string().trim().min(5, 'Street address must be at least 5 characters').max(300),
  city: z.string().trim().min(2, 'City must be at least 2 characters').max(100),
  state: z.string().trim().min(2, 'State must be at least 2 characters').max(100),
  pincode: z.string().trim().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  country: z.string().trim().min(2, 'Country is required').max(100),
  isDefault: z.boolean(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressFormProps {
  address?: Address;
  onSubmit: (input: AddressInput) => Promise<void> | void;
  onCancel?: () => void;
}

function defaults(address?: Address): AddressFormValues {
  return {
    fullName: address?.fullName ?? '',
    phone: address?.phone ?? '',
    street: address?.street ?? '',
    city: address?.city ?? '',
    state: address?.state ?? '',
    pincode: address?.pincode ?? '',
    country: address?.country ?? 'India',
    isDefault: address?.isDefault ?? false,
  };
}

export function AddressForm({ address, onSubmit, onCancel }: AddressFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: defaults(address),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="address-full-name" label="Full name" error={errors.fullName?.message}>
          <Input id="address-full-name" autoComplete="name" aria-invalid={!!errors.fullName} aria-describedby={errors.fullName ? 'address-full-name-error' : undefined} {...register('fullName')} />
        </Field>
        <Field id="address-phone" label="Phone number" error={errors.phone?.message}>
          <Input id="address-phone" type="tel" autoComplete="tel" placeholder="9876543210" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'address-phone-error' : undefined} {...register('phone')} />
        </Field>
      </div>
      <Field id="address-street" label="Street address" error={errors.street?.message}>
        <Input id="address-street" autoComplete="street-address" aria-invalid={!!errors.street} aria-describedby={errors.street ? 'address-street-error' : undefined} {...register('street')} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="address-city" label="City" error={errors.city?.message}>
          <Input id="address-city" autoComplete="address-level2" aria-invalid={!!errors.city} aria-describedby={errors.city ? 'address-city-error' : undefined} {...register('city')} />
        </Field>
        <Field id="address-state" label="State" error={errors.state?.message}>
          <Input id="address-state" autoComplete="address-level1" aria-invalid={!!errors.state} aria-describedby={errors.state ? 'address-state-error' : undefined} {...register('state')} />
        </Field>
        <Field id="address-pincode" label="Pincode" error={errors.pincode?.message}>
          <Input id="address-pincode" inputMode="numeric" autoComplete="postal-code" aria-invalid={!!errors.pincode} aria-describedby={errors.pincode ? 'address-pincode-error' : undefined} {...register('pincode')} />
        </Field>
        <Field id="address-country" label="Country" error={errors.country?.message}>
          <Input id="address-country" autoComplete="country-name" aria-invalid={!!errors.country} aria-describedby={errors.country ? 'address-country-error' : undefined} {...register('country')} />
        </Field>
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
        <input type="checkbox" className="h-4 w-4 rounded border-border accent-accent" {...register('isDefault')} />
        Make this my default address
      </label>
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={isSubmitting} className="bg-accent text-on-accent hover:bg-accent/90">
          {isSubmitting ? 'Saving…' : 'Save address'}
        </Button>
      </div>
    </form>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p id={`${id}-error`} className="text-xs text-destructive" role="alert">{error}</p>}
    </div>
  );
}
