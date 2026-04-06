import { Lock, Unlock } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Page } from './EbookCanvasEditor';

interface LockedPagesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lockedPages: { page: Page; index: number }[];
  actionLabel: string;
  onUnlockAll: () => void;
  onUnlockPage: (pageId: string) => void;
  onProceedSkipping: () => void;
}

const LockedPagesModal = ({
  open, onOpenChange, lockedPages, actionLabel,
  onUnlockAll, onUnlockPage, onProceedSkipping,
}: LockedPagesModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-destructive" />
            Locked Pages Detected
          </DialogTitle>
          <DialogDescription>
            {lockedPages.length} locked page{lockedPages.length > 1 ? 's' : ''} will be skipped
            during "{actionLabel}". Unlock them to include in this change.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {lockedPages.map(({ page, index }) => (
            <div
              key={page.id}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-foreground/[0.03] border border-foreground/[0.06]"
            >
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-destructive" />
                <span className="text-sm font-medium text-foreground">
                  Page {index + 1} — {page.title}
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs gap-1"
                onClick={() => onUnlockPage(page.id)}
              >
                <Unlock className="w-3 h-3" />
                Unlock
              </Button>
            </div>
          ))}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              className="flex-1 gap-1.5"
              onClick={() => {
                onUnlockAll();
                onOpenChange(false);
              }}
            >
              <Unlock className="w-4 h-4" />
              Unlock All & Apply
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                onProceedSkipping();
                onOpenChange(false);
              }}
            >
              Skip Locked & Continue
            </Button>
          </div>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LockedPagesModal;
