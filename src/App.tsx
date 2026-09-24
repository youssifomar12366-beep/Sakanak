import { BrowserRouter } from "react-router-dom";
import { AppShell } from "./components/AppShell";

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
