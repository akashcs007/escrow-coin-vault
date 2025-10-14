import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import BuyForm from "./BuyForm";
import SellForm from "./SellForm";

interface BusinessPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSuccess: () => void;
}

const BusinessPaymentDialog = ({ open, onOpenChange, userId, onSuccess }: BusinessPaymentDialogProps) => {
  const [mode, setMode] = useState<"select" | "buy" | "sell">("select");

  const handleClose = () => {
    setMode("select");
    onOpenChange(false);
  };

  const handleSuccess = () => {
    setMode("select");
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-secondary" />
            Business Payment
          </DialogTitle>
          <DialogDescription>
            {mode === "select" && "Choose to buy or sell with escrow protection"}
            {mode === "buy" && "Buy items with escrow protection"}
            {mode === "sell" && "Sell items with escrow protection"}
          </DialogDescription>
        </DialogHeader>

        {mode === "select" && (
          <div className="grid gap-3 py-4">
            <Button
              variant="success"
              onClick={() => setMode("buy")}
              className="h-auto py-6 flex-col gap-2"
            >
              <ShoppingCart className="h-6 w-6" />
              <span className="text-lg">Buy</span>
              <span className="text-xs opacity-80">Purchase items with coin escrow</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setMode("sell")}
              className="h-auto py-6 flex-col gap-2 hover:border-secondary"
            >
              <ShoppingBag className="h-6 w-6" />
              <span className="text-lg">Sell</span>
              <span className="text-xs opacity-80">List items for sale</span>
            </Button>
          </div>
        )}

        {mode === "buy" && (
          <BuyForm
            userId={userId}
            onSuccess={handleSuccess}
            onBack={() => setMode("select")}
          />
        )}

        {mode === "sell" && (
          <SellForm
            userId={userId}
            onSuccess={handleSuccess}
            onBack={() => setMode("select")}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BusinessPaymentDialog;
