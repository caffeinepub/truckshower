import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { TruckStop } from "../backend.d";
import { useUpdateShowerAvailability } from "../hooks/useQueries";
import {
  getAvailabilityStatus,
  getStatusClasses,
  getStatusLabel,
} from "../lib/formatters";

interface AvailabilityUpdateModalProps {
  stop: TruckStop;
  open: boolean;
  onClose: () => void;
}

export function AvailabilityUpdateModal({
  stop,
  open,
  onClose,
}: AvailabilityUpdateModalProps) {
  const [value, setValue] = useState(Number(stop.availableShowers));
  const total = Number(stop.totalShowers);
  const updateMutation = useUpdateShowerAvailability();

  const status = getAvailabilityStatus(BigInt(value), stop.totalShowers);
  const statusClasses = getStatusClasses(status);

  function handleDecrement() {
    setValue((v) => Math.max(0, v - 1));
  }

  function handleIncrement() {
    setValue((v) => Math.min(total, v + 1));
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const parsed = Number.parseInt(e.target.value, 10);
    if (!Number.isNaN(parsed)) {
      setValue(Math.max(0, Math.min(total, parsed)));
    }
  }

  async function handleConfirm() {
    try {
      await updateMutation.mutateAsync({
        id: stop.id,
        availableShowers: BigInt(value),
      });
      toast.success("Shower availability updated!");
      onClose();
    } catch {
      toast.error("Failed to update — please try again.");
    }
  }

  // Reset value when stop changes
  function handleOpenChange(isOpen: boolean) {
    if (isOpen) {
      setValue(Number(stop.availableShowers));
    } else {
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        data-ocid="availability.dialog"
        className="max-w-sm mx-auto bg-card border-border"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-foreground text-xl">
            Update Showers
          </DialogTitle>
          <p className="text-sm text-muted-foreground font-body mt-1">
            {stop.name} — {stop.city}, {stop.state}
          </p>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Current vs new status */}
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground font-body mb-1">
                Current
              </p>
              <span className="text-2xl font-black font-display text-muted-foreground">
                {Number(stop.availableShowers)}/{total}
              </span>
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="text-center">
              <p className="text-xs text-muted-foreground font-body mb-1">
                New
              </p>
              <span
                className={`text-2xl font-black font-display ${statusClasses.text}`}
              >
                {value}/{total}
              </span>
            </div>
            <div
              className={`
                px-3 py-1 rounded-lg border text-xs font-bold font-body
                ${statusClasses.badge} ${statusClasses.glow}
              `}
            >
              {getStatusLabel(status)}
            </div>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={value <= 0}
              className="
                w-12 h-12 rounded-lg bg-secondary border border-border
                flex items-center justify-center
                text-foreground hover:bg-accent disabled:opacity-40
                transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
              "
            >
              <Minus className="w-5 h-5" />
            </button>

            <input
              data-ocid="availability.input"
              type="number"
              value={value}
              onChange={handleInputChange}
              min={0}
              max={total}
              className="
                flex-1 text-center text-3xl font-black font-display
                bg-secondary border border-border rounded-lg py-3
                text-foreground
                focus:outline-none focus:ring-2 focus:ring-ring
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
              "
            />

            <button
              type="button"
              onClick={handleIncrement}
              disabled={value >= total}
              className="
                w-12 h-12 rounded-lg bg-secondary border border-border
                flex items-center justify-center
                text-foreground hover:bg-accent disabled:opacity-40
                transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
              "
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <p className="text-center text-xs text-muted-foreground font-body">
            Total showers: {total}
          </p>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            data-ocid="availability.cancel_button"
            variant="outline"
            onClick={onClose}
            className="flex-1 border-border"
            disabled={updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            data-ocid="availability.confirm_button"
            onClick={handleConfirm}
            disabled={updateMutation.isPending}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Confirm Update"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
