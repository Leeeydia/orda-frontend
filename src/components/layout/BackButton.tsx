import { useNavigate } from "react-router-dom";
import { joinClassNames } from "@/utils/classNames";

type BackButtonProps = {
  className?: string;
  ariaLabel?: string;
};

const BackButton = ({
  className,
  ariaLabel = "뒤로가기"
}: BackButtonProps) => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      aria-label={ariaLabel}
      className={joinClassNames(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-heading transition-colors duration-150 hover:bg-primary/10 active:opacity-60",
        className
      )}>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-7 w-7">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
};

export default BackButton;