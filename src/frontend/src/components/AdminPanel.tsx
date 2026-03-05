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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Database, Edit2, Loader2, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { TruckStop } from "../backend.d";
import {
  useAddOrUpdateTruckStop,
  useRemoveTruckStop,
  useSeedSampleData,
} from "../hooks/useQueries";
import { KNOWN_CHAINS } from "../lib/chainConfig";

interface AdminPanelProps {
  stops: TruckStop[];
  onClose: () => void;
}

interface StopFormData {
  id: bigint | null;
  name: string;
  chain: string;
  city: string;
  state: string;
  highway: string;
  totalShowers: string;
}

const EMPTY_FORM: StopFormData = {
  id: null,
  name: "",
  chain: "",
  city: "",
  state: "",
  highway: "",
  totalShowers: "10",
};

export function AdminPanel({ stops, onClose }: AdminPanelProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState<StopFormData>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<TruckStop | null>(null);

  const addMutation = useAddOrUpdateTruckStop();
  const removeMutation = useRemoveTruckStop();
  const seedMutation = useSeedSampleData();

  function handleEdit(stop: TruckStop) {
    setFormData({
      id: stop.id,
      name: stop.name,
      chain: stop.chain,
      city: stop.city,
      state: stop.state,
      highway: stop.highway,
      totalShowers: String(stop.totalShowers),
    });
    setFormOpen(true);
  }

  function handleAdd() {
    setFormData(EMPTY_FORM);
    setFormOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.chain ||
      !formData.city ||
      !formData.state
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      await addMutation.mutateAsync({
        id: formData.id,
        name: formData.name,
        chain: formData.chain,
        city: formData.city,
        state: formData.state,
        highway: formData.highway,
        totalShowers: BigInt(Number.parseInt(formData.totalShowers, 10) || 10),
      });
      toast.success(formData.id ? "Truck stop updated!" : "Truck stop added!");
      setFormOpen(false);
    } catch {
      toast.error("Failed to save — please try again.");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await removeMutation.mutateAsync(deleteTarget.id);
      toast.success("Truck stop removed.");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete — please try again.");
    }
  }

  async function handleSeed() {
    try {
      await seedMutation.mutateAsync();
      toast.success("Sample data seeded!");
    } catch {
      toast.error("Failed to seed data.");
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-sm overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 gradient-header px-4 py-4 flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-foreground">
            Admin Panel
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button
              data-ocid="admin.add_button"
              onClick={handleAdd}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-body"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Truck Stop
            </Button>
            <Button
              data-ocid="admin.seed_button"
              variant="outline"
              onClick={handleSeed}
              disabled={seedMutation.isPending}
              className="border-border font-body"
            >
              {seedMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Database className="w-4 h-4 mr-2" />
              )}
              Seed Sample Data
            </Button>
          </div>

          {/* List */}
          <div className="space-y-2">
            {stops.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground font-body">
                No truck stops yet. Add one or seed sample data.
              </div>
            ) : (
              stops.map((stop, i) => {
                const idx = i + 1;
                return (
                  <div
                    key={stop.id.toString()}
                    className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-semibold text-sm text-foreground truncate">
                        {stop.name}
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        {stop.chain} · {stop.city}, {stop.state} ·{" "}
                        {stop.highway}
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        {Number(stop.availableShowers)}/
                        {Number(stop.totalShowers)} showers available
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        type="button"
                        data-ocid={`admin.edit_button.${idx}`}
                        onClick={() => handleEdit(stop)}
                        className="p-2 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        data-ocid={`admin.delete_button.${idx}`}
                        onClick={() => setDeleteTarget(stop)}
                        className="p-2 rounded-md hover:bg-destructive/20 transition-colors text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-sm bg-card border-border mx-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">
              {formData.id ? "Edit Truck Stop" : "Add Truck Stop"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-body text-foreground">
                Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Pilot Travel Center #1234"
                className="bg-secondary border-border font-body"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chain" className="font-body text-foreground">
                Chain *
              </Label>
              <Select
                value={formData.chain}
                onValueChange={(v) => setFormData((p) => ({ ...p, chain: v }))}
              >
                <SelectTrigger
                  data-ocid="admin.select"
                  className="bg-secondary border-border font-body"
                >
                  <SelectValue placeholder="Select chain" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {KNOWN_CHAINS.map((c) => (
                    <SelectItem key={c} value={c} className="font-body">
                      {c}
                    </SelectItem>
                  ))}
                  <SelectItem value="Other" className="font-body">
                    Other
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="city" className="font-body text-foreground">
                  City *
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, city: e.target.value }))
                  }
                  placeholder="Nashville"
                  className="bg-secondary border-border font-body"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state" className="font-body text-foreground">
                  State *
                </Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, state: e.target.value }))
                  }
                  placeholder="TN"
                  maxLength={2}
                  className="bg-secondary border-border font-body uppercase"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="highway" className="font-body text-foreground">
                  Highway
                </Label>
                <Input
                  id="highway"
                  value={formData.highway}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, highway: e.target.value }))
                  }
                  placeholder="I-40"
                  className="bg-secondary border-border font-body"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="totalShowers"
                  className="font-body text-foreground"
                >
                  Total Showers
                </Label>
                <Input
                  id="totalShowers"
                  type="number"
                  min={1}
                  max={50}
                  value={formData.totalShowers}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, totalShowers: e.target.value }))
                  }
                  className="bg-secondary border-border font-body"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button
                data-ocid="admin.cancel_button"
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
                className="flex-1 border-border font-body"
              >
                Cancel
              </Button>
              <Button
                data-ocid="admin.save_button"
                type="submit"
                disabled={addMutation.isPending}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-body"
              >
                {addMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : formData.id ? (
                  "Save Changes"
                ) : (
                  "Add Stop"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="bg-card border-border max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-foreground">
              Remove Truck Stop?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body text-muted-foreground">
              This will permanently remove "{deleteTarget?.name}" from the list.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel
              data-ocid="admin.cancel_button"
              className="flex-1 border-border font-body"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="admin.delete_button.1"
              onClick={handleDelete}
              disabled={removeMutation.isPending}
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 font-body"
            >
              {removeMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : null}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
