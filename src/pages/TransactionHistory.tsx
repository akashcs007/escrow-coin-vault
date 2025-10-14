import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Package, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchTransactions(session.user.id);
      }
    });
  }, [navigate]);

  const fetchTransactions = async (userId: string) => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTransactions(data);
    }
  };

  const getTransactionIcon = (type: string, isSender: boolean) => {
    if (type.includes("conversion")) {
      return <RefreshCw className="h-5 w-5 text-secondary" />;
    }
    if (type.includes("business")) {
      return <Package className="h-5 w-5 text-primary" />;
    }
    return isSender ? (
      <ArrowUpRight className="h-5 w-5 text-destructive" />
    ) : (
      <ArrowDownRight className="h-5 w-5 text-secondary" />
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      completed: "default",
      pending: "secondary",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-16 w-16 rounded-full gradient-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-card">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-elegant">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              View all your past and pending transactions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No transactions yet</p>
              </div>
            ) : (
              transactions.map((transaction) => {
                const isSender = transaction.sender_id === user.id;
                return (
                  <Card key={transaction.id} className="border">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            {getTransactionIcon(transaction.transaction_type, isSender)}
                          </div>
                          <div>
                            <p className="font-semibold">
                              {transaction.description || transaction.transaction_type}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleString()}
                            </p>
                            {transaction.receiver_identifier && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {isSender ? "To: " : "From: "}
                                {transaction.receiver_identifier}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${isSender ? "text-destructive" : "text-secondary"}`}>
                            {isSender ? "-" : "+"}
                            {transaction.amount} {transaction.currency}
                          </p>
                          <div className="mt-1">
                            {getStatusBadge(transaction.status)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TransactionHistory;
