// src/components/layout/BackButton.tsx

import { useNavigate } from "react-router-dom";
import BackIcon from "@/assets/icons/back.svg?react";

const BackButton = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className="flex size-10 items-center justify-center transition-colors active:bg-white">
      <BackIcon className="h-4 w-4" />
    </button>
  );
};

export default BackButton;
