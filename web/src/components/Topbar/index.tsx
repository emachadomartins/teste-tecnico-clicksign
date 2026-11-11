import logo from "../../assets/logo.svg";
import { useSearchHistory } from "../../hooks/useSearchHistory";

import React, { useState } from "react";
import { Icon } from "../Icon";
import "./styles.css";

export type TopbarProps = {
  hasSearchButton?: boolean;
};

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
        <Icon
          className="search-btn"
          onClick={handleSearchClick}
          label="Pesquisar"
          icon="search"
          color="#FFFFFF"
          size={32}
        />
      )}
      {isSearchActive && (
        <div className="search-box">
          <div className="search-field">
            <Icon icon="search" color="#695ccd" size={24} aria-hidden="true" />
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
            <Icon
              icon="x"
              color="#695ccd"
              size={24}
              label="Fechar busca"
              onClick={handleSearchClick}
            />
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
                    <Icon
                      icon="history"
                      size={24}
                      aria-hidden="true"
                      color="#717171"
                    />
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
