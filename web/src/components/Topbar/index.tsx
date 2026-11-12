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
  const { addSearch, removeSearch, history } = useSearchHistory();

  const term = searchParams.get("term") || undefined;

  const isShowingResult = hasSearchButton && Boolean(term);
  const isSearchOpen = isSearchActive || isShowingResult;

  const handleSearchClick = () => {
    setIsSearchActive(!isSearchActive);
  };

  const handleSearchFocus = () => {
    if (isSearchActive) return;
    setSearch(term ?? "");
    setIsSearchActive(true);
  };

  const handleSearchBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setIsSearchActive(false);
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
      {hasSearchButton && !isSearchOpen && (
        <Icon
          className="search-btn"
          onClick={handleSearchClick}
          label="Pesquisar"
          icon="search"
          color="white"
          size={32}
        />
      )}
      {isSearchOpen && (
        <div
          className={
            "search-box" + (isSearchActive ? "" : " search-box--result")
          }
          onBlur={handleSearchBlur}
        >
          <div className="search-field">
            <Icon icon="search" color="primary" size={24} aria-hidden="true" />
            <input
              className="search-input"
              type="text"
              enterKeyHint="search"
              placeholder="Digite o nome do projeto..."
              aria-label="Buscar projetos"
              value={isSearchActive ? search : (term ?? "")}
              onFocus={handleSearchFocus}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch(search);
                if (e.key === "Escape") {
                  setIsSearchActive(false);
                  e.currentTarget.blur();
                }
              }}
              autoFocus={isSearchActive}
            />
          </div>
          {isSearchActive && history.length > 0 && (
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
                      color="textMuted"
                    />
                    {term}
                  </button>
                  <Icon
                    icon="x"
                    color="textMuted"
                    size={20}
                    label={`Remover "${term}" do histórico`}
                    onClick={() => removeSearch(term)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
