import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";

interface BuyFormProps {
  userId: string;
  onSuccess: () => void;
  onBack: () => void;
}

const BuyForm = ({ userId, onSuccess, onBack }: BuyFormProps) => {
  const [sellerEmail, setSellerEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleBuy = async () => {
    if (!sellerEmail || !amount || !description || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid input",
        description: "Please fill all fields with valid values",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get seller profile
      const { data: sellerProfile, error: sellerError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", sellerEmail)
        .single();

      if (sellerError || !sellerProfile) {
        throw new Error("Seller not found");
      }

      // Get buyer profile
      const { data: buyerProfile, error: buyerError } = await supabase
        .from("profiles")
        .select("coins_balance")
        .eq("id", userId)
        .single();

      if (buyerError || !buyerProfile) {
        throw new Error("Unable to fetch your profile");
      }

      const amountNum = parseFloat(amount);

      if (buyerProfile.coins_balance < amountNum) {
        throw new Error("Insufficient coin balance");
      }

      // Deduct coins from buyer
      await supabase
        .from("profiles")
        .update({ coins_balance: buyerProfile.coins_balance - amountNum })
        .eq("id", userId);

      // Create escrow transaction
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          sender_id: userId,
          receiver_id: sellerProfile.id,
          receiver_identifier: sellerEmail,
          transaction_type: "business_buy",
          amount: amountNum,
          currency: "coins",
          status: "pending",
          description,
          sender_approved: false,
          receiver_approved: false,
        });

      if (transactionError) throw transactionError;

      toast({
        title: "Purchase initiated!",
        description: `${amountNum} coins held in escrow. Awaiting confirmation from both parties.`,
      });

      setSellerEmail("");
      setAmount("");
      setDescription("");
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
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="mb-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <div className="space-y-2">
        <Label htmlFor="sellerEmail">Seller Email/Phone</Label>
        <Input
          id="sellerEmail"
          type="text"
          value={sellerEmail}
          onChange={(e) => setSellerEmail(e.target.value)}
          placeholder="seller@example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="buyAmount">Amount (Coins)</Label>
        <Input
          id="buyAmount"
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
        />
        <p className="text-xs text-muted-foreground">1 Coin = $1 USD</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="buyDescription">Description</Label>
        <Textarea
          id="buyDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What are you buying?"
          rows={3}
          required
        />
      </div>
      <Button
        variant="success"
        onClick={handleBuy}
        disabled={loading}
        className="w-full"
      >
        {loading ? "Processing..." : "Place Order"}
      </Button>
    </div>
  );
};

export default BuyForm;
