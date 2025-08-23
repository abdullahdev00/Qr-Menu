import { createRoot } from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./ErrorBoundary";
import "./index.css";

try {
  console.log('🎨 Loading Original Beautiful Admin Panel...');
  const root = createRoot(document.getElementById("root")!);
  
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
  
  console.log('✅ Original design loaded successfully!');
} catch (error) {
  console.error('❌ Error loading original app:', error);
  document.body.innerHTML = `
    <div style="padding: 40px; background: #fee2e2; color: #991b1b; font-family: Arial;">
      <h1>🚨 Original App Loading Error</h1>
      <p><strong>Error:</strong> ${error.message}</p>
      <p>If you see this, there's a component issue. Check console for details.</p>
    </div>
  `;
}
