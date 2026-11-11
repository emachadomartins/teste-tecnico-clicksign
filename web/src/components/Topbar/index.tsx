import logo from "../../assets/logo.svg";
import { useSearchHistory } from "../../hooks/useSearchHistory";

import React, { useState } from "react";
import { useSearchParams } from "react-router";
import { Icon } from "../Icon";
import "./styles.css";

export type TopbarProps = {
  hasSearchButton?: boolean;
};

export const Topbar: React.FC<TopbarProps> = ({
  hasSearchButton = true,
}: TopbarProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSearchActive, setIsSearchActive] = React.useState(false);
  const [search, setSearch] = useState("");
  const { addSearch, history } = useSearchHistory();

  const term = searchParams.get("term") || undefined;

  const handleSearchClick = () => {
    setIsSearchActive(!isSearchActive);
  };

  const handleSearch = (term: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("favorites_only");
      next.delete("sort_by");
      if (term) next.set("term", term);
      else next.delete("term");
      return next;
    });
    addSearch(term);
    setSearch("");
    setIsSearchActive(false);
  };

  return (
    <div className="top-bar">
      <img src={logo} alt="Logo Gerenciador de Projetos" className="logo" />
      {hasSearchButton &&
        (!term ? (
          <Icon
            className="search-btn"
            onClick={handleSearchClick}
            label="Pesquisar"
            icon="search"
            color="#FFFFFF"
            size={32}
          />
        ) : (
          <Icon
            className="search-btn"
            onClick={() => handleSearch("")}
            label="Cancelar Pesquisa"
            icon="x"
            color="#FFFFFF"
            size={32}
          />
        ))}
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
                if (e.key === "Enter") handleSearch(search);
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
                      handleSearch(term);
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
