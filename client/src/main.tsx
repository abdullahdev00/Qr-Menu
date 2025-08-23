import { createRoot } from "react-dom/client";
import SafeApp from "./SafeApp";
import ErrorBoundary from "./ErrorBoundary";
import "./index.css";

try {
  console.log('🏠 Loading Dashboard with Sidebar...');
  const root = createRoot(document.getElementById("root")!);
  
  root.render(
    <ErrorBoundary>
      <SafeApp />
    </ErrorBoundary>
  );
  
  console.log('✅ Dashboard loaded successfully!');
} catch (error) {
  console.error('❌ Error loading dashboard:', error);
  document.body.innerHTML = `
    <div style="padding: 40px; background: #fee2e2; color: #991b1b; font-family: Arial;">
      <h1>🚨 Dashboard Loading Error</h1>
      <p><strong>Error:</strong> ${error.message}</p>
      <p>Check console for details</p>
    </div>
  `;
}
