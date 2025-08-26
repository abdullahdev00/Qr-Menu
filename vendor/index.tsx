import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../admin/lib/queryClient";
import { VendorApp } from "./VendorApp";
import "../admin/src/index.css";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <QueryClientProvider client={queryClient}>
      <VendorApp />
    </QueryClientProvider>
  );
}