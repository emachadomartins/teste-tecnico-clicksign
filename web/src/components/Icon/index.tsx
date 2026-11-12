import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CalendarCheck,
  CalendarPlus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Ellipsis,
  History,
  Layers,
  PlusCircle,
  Search,
  SquarePen,
  Star,
  Trash,
  Upload,
  X,
  type LucideProps,
} from "lucide-react";

import { colors, type ColorName } from "../../theme";
import "./styles.css";

const icons = {
  trash: Trash,
  star: Star,
  ellipsis: Ellipsis,
  search: Search,
  "calendar-plus": CalendarPlus,
  "calendar-check": CalendarCheck,
  history: History,
  x: X,
  "arrow-right": ArrowRight,
  "arrow-left": ArrowLeft,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "square-pen": SquarePen,
  layers: Layers,
  upload: Upload,
  "arrow-up": ArrowUp,
  "arrow-down": ArrowDown,
  "chevron-up": ChevronUp,
  "chevron-down": ChevronDown,
  plus: PlusCircle,
} as const;

export type IconName = keyof typeof icons;

type IconProps = LucideProps & { name: IconName };

export const IconComponent = ({ name, ...props }: IconProps) => {
  const Component = icons[name];
  return <Component {...props} />;
};

type BaseProps = {
  icon: IconName;
  color?: ColorName;
  size: number;
  fill?: ColorName | "none";
  className?: string;
  shadow?: boolean;
  stroke?: number;
} & (
  | {
      circle: true;
      circleColor: ColorName;
      circleSize: number;
    }
  | {
      circle?: false;
      circleColor?: ColorName;
      circleSize?: number;
    }
);

type ClickableProps = BaseProps & {
  onClick: () => void;
  label: string;
};

type StaticProps = BaseProps & {
  onClick?: never;
  label?: never;
};

type IconCircleProps = ClickableProps | StaticProps;

export const Icon = ({
  icon,
  circle = false,
  circleColor,
  circleSize,
  color,
  fill = "none",
  size = 24,
  className = "",
  onClick,
  label,
  shadow = false,
  stroke = 2,
}: IconCircleProps) => {
  const classes = [
    "icon",
    circle && "icon-circle",
    shadow && "icon-shadow",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const wrapperStyle: React.CSSProperties = {
    color: color ? colors[color] : undefined,
    ...(circle && {
      width: circleSize,
      height: circleSize,
      background: circleColor ? colors[circleColor] : undefined,
    }),
  };

  const svg = (
    <IconComponent
      name={icon}
      size={size}
      color="currentColor"
      fill={fill === "none" ? "none" : "currentColor"}
      style={fill === "none" ? undefined : { fill: colors[fill] }}
      strokeWidth={stroke}
    />
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={classes}
        style={wrapperStyle}
        onClick={onClick}
        aria-label={label}
      >
        {svg}
      </button>
    );
  }

  return (
    <span className={classes} aria-hidden="true" style={wrapperStyle}>
      {svg}
    </span>
  );
};
