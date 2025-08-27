import { Route, Switch } from "wouter";
import { VendorDashboard } from "./pages/VendorDashboard";
import { MenuManagement } from "./pages/MenuManagement";
import { QRCodeManagement } from "./pages/QRCodeManagement";
import { Analytics } from "./pages/Analytics";
import { CustomerFeedback } from "./pages/CustomerFeedback";
import { Settings } from "./pages/Settings";

export function VendorApp() {
  console.log("🏪 VendorApp component rendering!");
  return (
    <Switch>
      <Route path="/vendor" component={VendorDashboard} />
      <Route path="/vendor/menu-management" component={MenuManagement} />
      <Route path="/vendor/qr-codes" component={QRCodeManagement} />
      <Route path="/vendor/analytics" component={Analytics} />
      <Route path="/vendor/feedback" component={CustomerFeedback} />
      <Route path="/vendor/settings" component={Settings} />
      <Route>
        <VendorDashboard />
      </Route>
    </Switch>
  );
}