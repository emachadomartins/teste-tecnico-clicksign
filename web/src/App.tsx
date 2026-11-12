import { Outlet, useMatch } from "react-router";
import { Topbar } from "@/components";

import "./App.css";

function App() {
  const isListPage = useMatch("/") !== null;

  return (
    <div className="app">
      <Topbar hasSearchButton={isListPage} />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
