// src/components/layout/BackButton.tsx

import { useNavigate } from "react-router-dom";

const BackButton = () => {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className="flex h-10 w-10 items-center justify-center rounded-full text-[#4a521e] transition hover:bg-[#89943d]/10"
      aria-label="뒤로가기">
      <span className="text-xl">←</span>
    </button>
  );
};

export default BackButton;
