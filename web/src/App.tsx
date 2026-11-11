import "./App.css";
import { Topbar } from "./components/Topbar";
import { ProjectList } from "./pages/ProjectList";

function App() {
  return (
    <div className="app">
      <Topbar />
      <main className="app-content">
        <ProjectList />
      </main>
    </div>
  );
}

export default App;
