import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Download, ShoppingBag, RefreshCw } from "lucide-react";

interface QuickActionsProps {
  onSendMoney: () => void;
  onReceiveMoney: () => void;
  onBusinessPayment: () => void;
  onConvert: () => void;
}

const QuickActions = ({ onSendMoney, onReceiveMoney, onBusinessPayment, onConvert }: QuickActionsProps) => {
  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Choose an action to get started</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <Button variant="gradient" onClick={onSendMoney} className="h-auto py-4 flex-col gap-2">
          <Send className="h-5 w-5" />
          <span>Send Money</span>
        </Button>
        <Button variant="outline" onClick={onReceiveMoney} className="h-auto py-4 flex-col gap-2 hover:border-primary">
          <Download className="h-5 w-5" />
          <span>Receive Money</span>
        </Button>
        <Button variant="success" onClick={onBusinessPayment} className="h-auto py-4 flex-col gap-2">
          <ShoppingBag className="h-5 w-5" />
          <span>Business Payment</span>
        </Button>
        <Button variant="outline" onClick={onConvert} className="h-auto py-4 flex-col gap-2 hover:border-secondary">
          <RefreshCw className="h-5 w-5" />
          <span>Convert Currency</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
