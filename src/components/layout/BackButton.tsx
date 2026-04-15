import { useNavigate } from "react-router-dom";

type BackButtonProps = {
  className?: string;
  ariaLabel?: string;
};

const joinClassNames = (
  ...classes: Array<string | false | null | undefined>
): string => classes.filter(Boolean).join(" ");

const BackButton = ({ className, ariaLabel = "뒤로가기" }: BackButtonProps) => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      aria-label={ariaLabel}
      className={joinClassNames(
        "border-border-default text-heading hover:bg-secondary flex h-11 w-11 items-center justify-center rounded-xl border bg-white shadow-sm transition-colors duration-150 active:opacity-60",
        className
      )}>
      <span aria-hidden="true" className="text-xl leading-none">
        ←
      </span>
    </button>
  );
};

export default BackButton;
