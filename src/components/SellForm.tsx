import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

interface SellFormProps {
  userId: string;
  onSuccess: () => void;
  onBack: () => void;
}

const SellForm = ({ userId, onSuccess, onBack }: SellFormProps) => {
  const [buyerEmail, setBuyerEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const handleSell = () => {
    toast({
      title: "Info",
      description: "To sell, share your email with the buyer. They will initiate the purchase.",
    });
    onSuccess();
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="mb-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <div className="p-4 rounded-lg bg-muted">
        <h4 className="font-semibold mb-2">How to Sell</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
          <li>Share your email with the buyer</li>
          <li>Buyer initiates purchase using "Buy" option</li>
          <li>Coins are held in escrow</li>
          <li>Both parties approve the transaction</li>
          <li>Coins are released to your account</li>
        </ol>
      </div>
      <div className="space-y-2">
        <Label>Your Email</Label>
        <Input
          type="text"
          value={buyerEmail}
          onChange={(e) => setBuyerEmail(e.target.value)}
          placeholder="Share this with buyer"
        />
      </div>
      <Button
        variant="outline"
        onClick={handleSell}
        className="w-full"
      >
        Got it
      </Button>
    </div>
  );
};

export default SellForm;
