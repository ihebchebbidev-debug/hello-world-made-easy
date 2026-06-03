import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

export type ConfirmOptions = {
  title?: string;
  description?: ReactNode;
  /** Affiche le badge "Action irréversible" et un style destructive. Default: false. */
  destructive?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
};

type Resolver = (v: boolean) => void;

const ConfirmContext = createContext<((opts: ConfirmOptions) => Promise<boolean>) | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ConfirmOptions>({});
  // Use refs (not state) to guarantee a single active resolver and prevent
  // races between concurrent calls / rapid clicks.
  const resolverRef = useRef<Resolver | null>(null);
  const lockedRef = useRef(false);

  const confirm = useCallback((o: ConfirmOptions) => {
    // Block concurrent confirmations: if one is already open, reject the new
    // request immediately with `false` and keep the existing dialog intact.
    if (lockedRef.current) {
      return Promise.resolve(false);
    }
    lockedRef.current = true;
    setOpts(o);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const finish = useCallback((v: boolean) => {
    const resolve = resolverRef.current;
    resolverRef.current = null;
    setOpen(false);
    // Resolve exactly once, then release the lock.
    if (resolve) resolve(v);
    lockedRef.current = false;
  }, []);

  const isDestructive = !!opts.destructive;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog open={open} onOpenChange={(v) => { if (!v) finish(false); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {isDestructive && <AlertTriangle className="h-5 w-5 text-destructive" />}
              {opts.title ?? "Confirmer l'action"}
            </AlertDialogTitle>
            {opts.description && (
              <AlertDialogDescription asChild>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>{opts.description}</div>
                  {isDestructive && (
                    <div className="mt-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive">
                      ⚠ Action irréversible — les données ne pourront pas être récupérées.
                    </div>
                  )}
                </div>
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => finish(false)}>
              {opts.cancelLabel ?? "Annuler"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => finish(true)}
              className={isDestructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {opts.confirmLabel ?? (isDestructive ? "Supprimer" : "Confirmer")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used inside <ConfirmProvider>");
  return ctx;
}
