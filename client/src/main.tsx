import { createRoot } from "react-dom/client";
import SimpleRestaurantsPage from "./SimpleRestaurantsPage";

console.log('🏪 Loading Simple Restaurants Page for testing...');
const root = createRoot(document.getElementById("root")!);
root.render(<SimpleRestaurantsPage />);
