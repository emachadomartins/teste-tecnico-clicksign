import { History, Search, X } from "lucide-react";
import logo from "../../assets/logo.svg";
import { useSearchHistory } from "../../hooks/useSearchHistory";
import type { TopbarProps } from "./types";

import React, { useState } from "react";
import "./styles.css";

export const Topbar: React.FC<TopbarProps> = ({
  hasSearchButton = true,
}: TopbarProps) => {
  const [isSearchActive, setIsSearchActive] = React.useState(false);
  const [search, setSearch] = useState("");
  const { addSearch, history } = useSearchHistory();

  const handleSearchClick = () => {
    setIsSearchActive(!isSearchActive);
  };

  return (
    <div className="top-bar">
      <img src={logo} alt="Logo Gerenciador de Projetos" className="logo" />
      {hasSearchButton && (
        <button
          className="search-btn"
          onClick={handleSearchClick}
          aria-label="Pesquisar"
        >
          <Search className="search-icon" color="#FFFFFF" size={32} />
        </button>
      )}
      {isSearchActive && (
        <div className="search-box">
          <div className="search-field">
            <Search size={24} aria-hidden="true" />
            <input
              className="search-input"
              type="text"
              enterKeyHint="search"
              placeholder="Digite o nome do projeto..."
              aria-label="Buscar projetos"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addSearch(search);
                if (e.key === "Escape") handleSearchClick();
              }}
              autoFocus
            />
            <button
              className="search-btn"
              aria-label="Fechar busca"
              onClick={handleSearchClick}
            >
              <X size={24} />
            </button>
          </div>
          {history.length > 0 && (
            <ul className="search-history">
              {history.map((term) => (
                <li key={term} className="search-history-item">
                  <button
                    onClick={() => {
                      setSearch(term);
                      handleSearchClick();
                    }}
                    className="search-history-button"
                  >
                    <History size={24} aria-hidden="true" />
                    {term}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
