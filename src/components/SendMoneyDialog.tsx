import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Send } from "lucide-react";

interface SendMoneyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSuccess: () => void;
}

const SendMoneyDialog = ({ open, onOpenChange, userId, onSuccess }: SendMoneyDialogProps) => {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!recipientEmail || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid input",
        description: "Please fill all fields with valid values",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get recipient profile
      const { data: recipientProfile, error: recipientError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", recipientEmail)
        .single();

      if (recipientError || !recipientProfile) {
        throw new Error("Recipient not found");
      }

      // Get sender profile
      const { data: senderProfile, error: senderError } = await supabase
        .from("profiles")
        .select("cash_balance")
        .eq("id", userId)
        .single();

      if (senderError || !senderProfile) {
        throw new Error("Unable to fetch your profile");
      }

      const amountNum = parseFloat(amount);

      if (senderProfile.cash_balance < amountNum) {
        throw new Error("Insufficient balance");
      }

      // Create transaction
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          sender_id: userId,
          receiver_id: recipientProfile.id,
          receiver_identifier: recipientEmail,
          transaction_type: "send",
          amount: amountNum,
          currency: "cash",
          status: "completed",
          description,
        });

      if (transactionError) throw transactionError;

      // Update sender balance
      await supabase
        .from("profiles")
        .update({ cash_balance: senderProfile.cash_balance - amountNum })
        .eq("id", userId);

      // Update receiver balance
      const { data: receiverProfile } = await supabase
        .from("profiles")
        .select("cash_balance")
        .eq("id", recipientProfile.id)
        .single();

      if (receiverProfile) {
        await supabase
          .from("profiles")
          .update({ cash_balance: receiverProfile.cash_balance + amountNum })
          .eq("id", recipientProfile.id);
      }

      toast({
        title: "Success!",
        description: `Sent $${amountNum.toFixed(2)} to ${recipientEmail}`,
      });

      setRecipientEmail("");
      setAmount("");
      setDescription("");
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
            <Send className="h-5 w-5 text-primary" />
            Send Money
          </DialogTitle>
          <DialogDescription>
            Send cash directly to another user's account
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipientEmail">Recipient Email</Label>
            <Input
              id="recipientEmail"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="recipient@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this for?"
              rows={3}
            />
          </div>
          <Button
            variant="gradient"
            onClick={handleSend}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Processing..." : "Send Money"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendMoneyDialog;
