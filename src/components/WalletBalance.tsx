import { Card, CardContent } from "@/components/ui/card";
import { Coins, DollarSign } from "lucide-react";

interface WalletBalanceProps {
  coinsBalance: number;
  cashBalance: number;
}

const WalletBalance = ({ coinsBalance, cashBalance }: WalletBalanceProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="gradient-card shadow-elegant border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Coins Balance</p>
              <h3 className="text-3xl font-bold mt-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {coinsBalance.toFixed(2)}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">SPay Coins</p>
            </div>
            <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center shadow-glow">
              <Coins className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="gradient-card shadow-elegant border-secondary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cash Balance</p>
              <h3 className="text-3xl font-bold mt-2 bg-gradient-to-r from-secondary to-secondary/80 bg-clip-text text-transparent">
                ${cashBalance.toFixed(2)}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">USD</p>
            </div>
            <div className="h-12 w-12 rounded-full gradient-success flex items-center justify-center shadow-glow">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletBalance;
