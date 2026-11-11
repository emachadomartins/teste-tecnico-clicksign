import { Outlet } from "react-router";
import { Topbar } from "./components/Topbar";

import "./App.css";

function App() {
  return (
    <div className="app">
      <Topbar />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
