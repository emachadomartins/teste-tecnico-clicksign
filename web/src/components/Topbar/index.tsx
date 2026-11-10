import { Search } from "lucide-react";
import logo from "../../assets/logo.svg";
import type { TopbarProps } from "./types";

import "./styles.css";

export const Topbar: React.FC<TopbarProps> = ({
  hasSearchButton = true,
}: TopbarProps) => {
  return (
    <div className="top-bar">
      <img src={logo} alt="Logo Gerenciador de Projetos" className="logo" />
      {hasSearchButton && (
        <button className="search-btn">
          <Search className="search-icon" color="#FFFFFF" />
        </button>
      )}
    </div>
  );
};
