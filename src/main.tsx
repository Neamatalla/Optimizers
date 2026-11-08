
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { LanguageProvider } from "./app/contexts/LanguageContext";
import { initAnalytics } from "./lib/analytics";

// dataLayer tracking: clicks, section views, scroll depth, time milestones (see src/lib/analytics).
initAnalytics();

createRoot(document.getElementById("root")!).render(
    <LanguageProvider>
        <App />
    </LanguageProvider>
);
