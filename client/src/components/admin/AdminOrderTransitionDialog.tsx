import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { AdminLifecycleStatus } from '@/types';

const statusLabels: Record<AdminLifecycleStatus, string> = { packed: 'packed', shipped: 'shipped', delivered: 'delivered' };

interface AdminOrderTransitionDialogProps {
  open: boolean;
  status: AdminLifecycleStatus | null;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (note?: string) => Promise<void>;
}

export function AdminOrderTransitionDialog({ open, status, isPending, onOpenChange, onConfirm }: AdminOrderTransitionDialogProps) {
  const [note, setNote] = useState('');
  const [error, setError] = useState<string>();

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setNote('');
      setError(undefined);
    }
    onOpenChange(nextOpen);
  }

  async function submit() {
    const trimmedNote = note.trim();
    if (trimmedNote.length > 300) {
      setError('Transition notes must be 300 characters or fewer.');
      return;
    }
    setError(undefined);
    try {
      await onConfirm(trimmedNote || undefined);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'We could not update this order.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{status ? `Mark order as ${statusLabels[status]}?` : 'Update order status'}</DialogTitle>
          <DialogDescription>This advances the fulfilment lifecycle and cannot be undone.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <label htmlFor="transition-note" className="text-sm font-medium text-foreground">Transition note <span className="text-muted-foreground">(optional)</span></label>
          <textarea id="transition-note" aria-label="Transition note" value={note} onChange={(event) => setNote(event.target.value)} maxLength={300} rows={3} className="flex w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" aria-describedby={error ? 'transition-note-error' : 'transition-note-help'} aria-invalid={Boolean(error)} />
          <p id="transition-note-help" className="text-xs text-muted-foreground">{note.length}/300 characters</p>
          {error && <p id="transition-note-error" role="alert" className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="outline" disabled={isPending}>Cancel</Button></DialogClose>
          <Button type="button" onClick={submit} disabled={isPending || !status}>{isPending ? 'Updating…' : 'Confirm transition'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
