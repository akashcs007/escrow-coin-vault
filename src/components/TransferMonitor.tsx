import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Clock, CheckCircle2, XCircle, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TransferMonitorProps {
  userId: string;
  onUpdate: () => void;
}

const TransferMonitor = ({ userId, onUpdate }: TransferMonitorProps) => {
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPendingTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("status", "pending")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPendingTransactions(data);
    }
  };

  useEffect(() => {
    fetchPendingTransactions();

    const channel = supabase
      .channel("transactions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
        },
        () => {
          fetchPendingTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleApprove = async (transactionId: string, isSender: boolean) => {
    setLoading(true);
    try {
      const { data: transaction, error: fetchError } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", transactionId)
        .single();

      if (fetchError || !transaction) {
        throw new Error("Transaction not found");
      }

      const updateData = isSender
        ? { sender_approved: true }
        : { receiver_approved: true };

      await supabase
        .from("transactions")
        .update(updateData)
        .eq("id", transactionId);

      // Check if both approved
      const bothApproved = isSender
        ? transaction.receiver_approved
        : transaction.sender_approved;

      if (bothApproved) {
        // Complete the transaction
        const { data: receiverProfile } = await supabase
          .from("profiles")
          .select("coins_balance")
          .eq("id", transaction.receiver_id)
          .single();

        if (receiverProfile) {
          await supabase
            .from("profiles")
            .update({ coins_balance: receiverProfile.coins_balance + transaction.amount })
            .eq("id", transaction.receiver_id);
        }

        await supabase
          .from("transactions")
          .update({ status: "completed" })
          .eq("id", transactionId);

        toast({
          title: "Transaction completed!",
          description: "Coins have been transferred successfully.",
        });
      } else {
        toast({
          title: "Approved",
          description: "Waiting for the other party to approve.",
        });
      }

      fetchPendingTransactions();
      onUpdate();
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

  const handleReject = async (transactionId: string, isSender: boolean) => {
    setLoading(true);
    try {
      const { data: transaction, error: fetchError } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", transactionId)
        .single();

      if (fetchError || !transaction) {
        throw new Error("Transaction not found");
      }

      // Return coins to sender
      const { data: senderProfile } = await supabase
        .from("profiles")
        .select("coins_balance")
        .eq("id", transaction.sender_id)
        .single();

      if (senderProfile) {
        await supabase
          .from("profiles")
          .update({ coins_balance: senderProfile.coins_balance + transaction.amount })
          .eq("id", transaction.sender_id);
      }

      await supabase
        .from("transactions")
        .update({ status: "rejected" })
        .eq("id", transactionId);

      toast({
        title: "Transaction rejected",
        description: "Coins have been returned to the buyer.",
      });

      fetchPendingTransactions();
      onUpdate();
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

  if (pendingTransactions.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Transfer Monitor
        </CardTitle>
        <CardDescription>
          Pending escrow transactions awaiting approval
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingTransactions.map((transaction) => {
          const isSender = transaction.sender_id === userId;
          const isApproved = isSender
            ? transaction.sender_approved
            : transaction.receiver_approved;

          return (
            <Card key={transaction.id} className="border-2">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {isSender ? "You are buying" : "You are selling"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {transaction.amount} coins
                      </p>
                      <Badge variant={isApproved ? "default" : "secondary"} className="mt-1">
                        {isApproved ? "You approved" : "Pending your approval"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(transaction.created_at).toLocaleDateString()}</span>
                  </div>

                  {!isApproved && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="success"
                        onClick={() => handleApprove(transaction.id, isSender)}
                        disabled={loading}
                        className="flex-1"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Satisfied
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleReject(transaction.id, isSender)}
                        disabled={loading}
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Return
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default TransferMonitor;
