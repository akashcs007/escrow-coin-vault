import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, ArrowRight } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ConversionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSuccess: () => void;
}

const ConversionDialog = ({ open, onOpenChange, userId, onSuccess }: ConversionDialogProps) => {
  const [conversionType, setConversionType] = useState<"toCoins" | "toCash">("toCoins");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleConvert = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("coins_balance, cash_balance")
        .eq("id", userId)
        .single();

      if (profileError || !profile) {
        throw new Error("Unable to fetch your profile");
      }

      const amountNum = parseFloat(amount);

      if (conversionType === "toCoins") {
        if (profile.cash_balance < amountNum) {
          throw new Error("Insufficient cash balance");
        }

        await supabase
          .from("profiles")
          .update({
            cash_balance: profile.cash_balance - amountNum,
            coins_balance: profile.coins_balance + amountNum,
          })
          .eq("id", userId);

        await supabase.from("transactions").insert({
          sender_id: userId,
          receiver_id: userId,
          transaction_type: "conversion_to_coins",
          amount: amountNum,
          currency: "cash",
          status: "completed",
          description: `Converted $${amountNum} to ${amountNum} coins`,
        });

        toast({
          title: "Conversion successful!",
          description: `Converted $${amountNum} to ${amountNum} coins`,
        });
      } else {
        if (profile.coins_balance < amountNum) {
          throw new Error("Insufficient coin balance");
        }

        await supabase
          .from("profiles")
          .update({
            coins_balance: profile.coins_balance - amountNum,
            cash_balance: profile.cash_balance + amountNum,
          })
          .eq("id", userId);

        await supabase.from("transactions").insert({
          sender_id: userId,
          receiver_id: userId,
          transaction_type: "conversion_to_cash",
          amount: amountNum,
          currency: "coins",
          status: "completed",
          description: `Converted ${amountNum} coins to $${amountNum}`,
        });

        toast({
          title: "Conversion successful!",
          description: `Converted ${amountNum} coins to $${amountNum}`,
        });
      }

      setAmount("");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-secondary" />
            Convert Currency
          </DialogTitle>
          <DialogDescription>
            Convert between coins and cash (1 Coin = $1 USD)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <RadioGroup value={conversionType} onValueChange={(value: any) => setConversionType(value)}>
            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:border-primary transition-smooth cursor-pointer">
              <RadioGroupItem value="toCoins" id="toCoins" />
              <Label htmlFor="toCoins" className="flex-1 cursor-pointer">
                Cash <ArrowRight className="inline h-4 w-4 mx-2" /> Coins
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:border-secondary transition-smooth cursor-pointer">
              <RadioGroupItem value="toCash" id="toCash" />
              <Label htmlFor="toCash" className="flex-1 cursor-pointer">
                Coins <ArrowRight className="inline h-4 w-4 mx-2" /> Cash
              </Label>
            </div>
          </RadioGroup>
          <div className="space-y-2">
            <Label htmlFor="conversionAmount">
              Amount ({conversionType === "toCoins" ? "USD" : "Coins"})
            </Label>
            <Input
              id="conversionAmount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <Button
            variant={conversionType === "toCoins" ? "gradient" : "success"}
            onClick={handleConvert}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Processing..." : "Convert"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConversionDialog;
