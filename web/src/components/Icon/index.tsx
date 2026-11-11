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
  color: string;
  size: number;
  fill?: string;
  className?: string;
  shadow?: boolean;
  stroke?: number;
} & (
  | {
      circle: true;
      circleColor: string;
      circleSize: number;
    }
  | {
      circle?: false;
      circleColor?: string;
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

  const circleStyle: React.CSSProperties | undefined = circle
    ? {
        width: circleSize,
        height: circleSize,
        background: circleColor,
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }
    : undefined;

  if (onClick) {
    return (
      <button
        type="button"
        className={classes}
        style={circleStyle}
        onClick={onClick}
        aria-label={label}
      >
        <IconComponent
          color={color}
          name={icon}
          size={size}
          fill={fill}
          strokeWidth={stroke}
        />
      </button>
    );
  }

  return (
    <span className={classes} aria-hidden="true" style={circleStyle}>
      <IconComponent
        color={color}
        name={icon}
        size={size}
        fill={fill}
        strokeWidth={stroke}
      />
    </span>
  );
};
