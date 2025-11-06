import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import Items from "./pages/Items";
import Suppliers from "./pages/Suppliers";
import Stock from "./pages/Stock";
import PurchaseOrders from "./pages/PurchaseOrders";
import PurchaseOrderDetail from "./pages/PurchaseOrderDetail";
import StockAdjustments from "./pages/StockAdjustments";
import Dashboard from "./pages/Dashboard";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"}>
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      </Route>
      <Route path={"/items"}>
        <DashboardLayout>
          <Items />
        </DashboardLayout>
      </Route>
      <Route path={"/suppliers"}>
        <DashboardLayout>
          <Suppliers />
        </DashboardLayout>
      </Route>
      <Route path={"/stock"}>
        <DashboardLayout>
          <Stock />
        </DashboardLayout>
      </Route>
      <Route path={"/purchase-orders"}>
        <DashboardLayout>
          <PurchaseOrders />
        </DashboardLayout>
      </Route>
      <Route path={"/purchase-orders/:id"}>
        {(params) => (
          <DashboardLayout>
            <PurchaseOrderDetail id={Number(params.id)} />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/stock-adjustments"}>
        <DashboardLayout>
          <StockAdjustments />
        </DashboardLayout>
      </Route>
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
