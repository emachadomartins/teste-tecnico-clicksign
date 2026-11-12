import { useState } from "react";
import { SORT_OPTIONS, type SortOption } from "@/types";
import { Icon } from "../Icon";
import "./styles.css";

const sortLabels: Record<SortOption, string> = {
  name: "Ordem alfabética",
  initial_date: "Iniciados mais recentes",
  final_date: "Prazo mais próximo",
};

type SortSelectProps = {
  value: SortOption;
  onChange: (value: SortOption) => void;
};

export const SortSelect = ({ value, onChange }: SortSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: SortOption) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="sort-select">
      <div
        className={"sort-select-box" + (isOpen ? " sort-select-box--open" : "")}
      >
        <button
          type="button"
          className="sort-select-button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        >
          {sortLabels[value]}
          <Icon
            icon={isOpen ? "chevron-up" : "chevron-down"}
            color="textMuted"
            size={20}
          />
        </button>
        {isOpen && (
          <ul className="sort-select-options" role="listbox">
            {SORT_OPTIONS.map((option) => (
              <li
                key={option}
                className="sort-select-option"
                role="option"
                aria-selected={option === value}
              >
                <button
                  type="button"
                  className="sort-select-option-button"
                  onClick={() => handleSelect(option)}
                >
                  {sortLabels[option]}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
