import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { User, LogOut, History, Wallet } from "lucide-react";
import WalletBalance from "@/components/WalletBalance";
import QuickActions from "@/components/QuickActions";
import SendMoneyDialog from "@/components/SendMoneyDialog";
import BusinessPaymentDialog from "@/components/BusinessPaymentDialog";
import ConversionDialog from "@/components/ConversionDialog";
import TransferMonitor from "@/components/TransferMonitor";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [businessDialogOpen, setBusinessDialogOpen] = useState(false);
  const [conversionDialogOpen, setConversionDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setProfile(data);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-16 w-16 rounded-full gradient-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-card">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-elegant">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center shadow-glow">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SecurePay
              </h1>
              <p className="text-xs text-muted-foreground">Welcome, {profile.full_name || profile.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/profile")}
            >
              <User className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/history")}
            >
              <History className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6 max-w-4xl">
        <WalletBalance
          coinsBalance={profile.coins_balance}
          cashBalance={profile.cash_balance}
        />

        <TransferMonitor
          userId={user.id}
          onUpdate={() => fetchProfile(user.id)}
        />

        <QuickActions
          onSendMoney={() => setSendDialogOpen(true)}
          onReceiveMoney={() => {
            toast({
              title: "Share your email",
              description: `Share ${profile.email} with the sender to receive money.`,
            });
          }}
          onBusinessPayment={() => setBusinessDialogOpen(true)}
          onConvert={() => setConversionDialogOpen(true)}
        />
      </main>

      <SendMoneyDialog
        open={sendDialogOpen}
        onOpenChange={setSendDialogOpen}
        userId={user.id}
        onSuccess={() => fetchProfile(user.id)}
      />

      <BusinessPaymentDialog
        open={businessDialogOpen}
        onOpenChange={setBusinessDialogOpen}
        userId={user.id}
        onSuccess={() => fetchProfile(user.id)}
      />

      <ConversionDialog
        open={conversionDialogOpen}
        onOpenChange={setConversionDialogOpen}
        userId={user.id}
        onSuccess={() => fetchProfile(user.id)}
      />
    </div>
  );
};

export default Dashboard;
