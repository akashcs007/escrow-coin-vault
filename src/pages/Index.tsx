import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wallet, Shield, Zap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-card flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 rounded-full gradient-primary flex items-center justify-center shadow-glow">
            <Wallet className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
          SecurePay
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Modern payment app with escrow protection. Send money, buy & sell securely, and convert currency instantly.
        </p>
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 rounded-xl gradient-card shadow-elegant">
            <Shield className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Escrow Protection</h3>
            <p className="text-sm text-muted-foreground">Secure transactions with built-in escrow</p>
          </div>
          <div className="p-6 rounded-xl gradient-card shadow-elegant">
            <Zap className="h-10 w-10 text-secondary mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Instant Transfer</h3>
            <p className="text-sm text-muted-foreground">Send and receive money instantly</p>
          </div>
          <div className="p-6 rounded-xl gradient-card shadow-elegant">
            <Wallet className="h-10 w-10 text-accent mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Dual Currency</h3>
            <p className="text-sm text-muted-foreground">Manage coins and cash seamlessly</p>
          </div>
        </div>
        <div className="flex gap-4 justify-center pt-8">
          <Button variant="gradient" size="lg" onClick={() => navigate("/auth")}>
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
