import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Note: no <StrictMode>. Its intentional double-mount in development restarts
// getUserMedia and the room connection mid-flight, which makes the Whereby
// media clients flaky locally. Production behaviour is unaffected either way.
createRoot(document.getElementById("root")!).render(<App />);
