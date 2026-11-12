import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    document.title = 'My Profile — ShopSphere';
    return () => { document.title = 'ShopSphere'; };
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      phone: user?.phone ?? '',
    },
  });

  function handleCancel() {
    reset({ name: user?.name ?? '', phone: user?.phone ?? '' });
    setIsEditing(false);
  }

  async function onSubmit(data: ProfileFormData) {
    try {
      await updateProfile({ name: data.name, phone: data.phone || undefined });
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Failed to update profile. Please try again.';
      toast.error(message);
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 lg:px-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
          My Profile
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your account information
        </p>
      </div>

      <Separator className="my-8" />

      {/* Profile card */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
        {/* Avatar area */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <User className="h-8 w-8 text-accent" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              {user.name}
            </h2>
            <p className="text-sm text-muted-foreground">{user.role}</p>
          </div>
        </div>

        {/* Info or Edit form */}
        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
                {...register('name')}
              />
              {errors.name && (
                <p id="name-error" className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="Add phone number"
                {...register('phone')}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting || !isDirty}
                className="gap-2 bg-accent text-on-accent hover:bg-accent/90 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-on-accent border-t-transparent" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSubmitting ? 'Saving…' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Name
                </p>
                <p className="text-sm text-foreground">{user.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Email
                </p>
                <p className="text-sm text-foreground">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Phone
                </p>
                <p className="text-sm text-foreground">
                  {user.phone || 'Not provided'}
                </p>
              </div>
            </div>

            <Separator />

            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="cursor-pointer"
            >
              Edit Profile
            </Button>
          </div>
        )}
      </div>

      {/* Account info */}
      <div className="mt-6 rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
        <h3 className="font-heading text-lg font-semibold text-foreground">
          Account Information
        </h3>
        <div className="mt-4 space-y-3 text-sm text-muted-foreground">
          <p>
            Member since:{' '}
            <span className="text-foreground">
              {new Date(user.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </p>
          <p>
            Account status:{' '}
            <span className="font-medium text-success">Active</span>
          </p>
        </div>
      </div>
    </div>
  );
}

