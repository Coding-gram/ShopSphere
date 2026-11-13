import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function createIdempotencyKey(): string {
  return globalThis.crypto?.randomUUID?.() ?? `cancel-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface CancelOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string, idempotencyKey: string) => Promise<void>;
  isPending: boolean;
}

export function CancelOrderDialog({ open, onOpenChange, onConfirm, isPending }: CancelOrderDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string>();
  const idempotencyKey = useRef(createIdempotencyKey());

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setReason('');
      setError(undefined);
      idempotencyKey.current = createIdempotencyKey();
    }
    onOpenChange(nextOpen);
  }

  async function submit() {
    const trimmedReason = reason.trim();
    if (trimmedReason.length < 3) {
      setError('Please share a short cancellation reason.');
      return;
    }
    if (trimmedReason.length > 300) {
      setError('Cancellation reason must be 300 characters or fewer.');
      return;
    }

    setError(undefined);
    try {
      await onConfirm(trimmedReason, idempotencyKey.current);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'We could not cancel this order.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel this order?</DialogTitle>
          <DialogDescription>
            Reserved stock will be returned to inventory. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <label htmlFor="cancellation-reason" className="text-sm font-medium text-foreground">Cancellation reason</label>
          <textarea
            id="cancellation-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={300}
            rows={4}
            className="flex w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Tell us why you are cancelling"
            aria-describedby={error ? 'cancellation-reason-error' : 'cancellation-reason-help'}
            aria-invalid={Boolean(error)}
          />
          <p id="cancellation-reason-help" className="text-xs text-muted-foreground">{reason.length}/300 characters</p>
          {error && <p id="cancellation-reason-error" role="alert" className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="outline" disabled={isPending}>Keep order</Button></DialogClose>
          <Button type="button" onClick={submit} disabled={isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {isPending ? 'Cancelling…' : 'Confirm cancellation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
