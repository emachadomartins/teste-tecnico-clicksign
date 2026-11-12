import { createBrowserRouter } from "react-router";
import App from "./App";
import { ProjectForm, ProjectList } from "@/pages";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <ProjectList /> },
      { path: "projects/new", element: <ProjectForm /> },
      { path: "projects/:id/edit", element: <ProjectForm /> },
    ],
  },
]);
