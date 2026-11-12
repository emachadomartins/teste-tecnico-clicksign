import "./styles.css";

type SwitchProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export const Switch = ({ label, checked, onChange }: SwitchProps) => (
  <label className="switch">
    <input
      type="checkbox"
      role="switch"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
    <span className="switch-slider" aria-hidden="true" />
    {label}
  </label>
);
