import { createRoot } from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./ErrorBoundary";
import "./index.css";

try {
  console.log('🚀 Loading QR Menu Admin App...');
  const root = createRoot(document.getElementById("root")!);
  console.log('📦 Rendering App with Error Boundary...');
  
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
  
  console.log('✅ App rendered successfully!');
} catch (error) {
  console.error('❌ Error loading app:', error);
  document.body.innerHTML = `
    <div style="padding: 40px; background: #fee2e2; color: #991b1b; font-family: Arial;">
      <h1>🚨 App Loading Error</h1>
      <p><strong>Error:</strong> ${error.message}</p>
      <p>Check browser console for more details.</p>
    </div>
  `;
}
