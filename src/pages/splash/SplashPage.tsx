import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import OrdaLogoVertical from "@/assets/icons/ORDA_logo_vertical.svg?react";

const SplashPage = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    const token = localStorage.getItem("accessToken");
    navigate(token ? "/hiking" : "/login");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col px-10 py-10">
        <div className="flex flex-1 items-center justify-center">
          <OrdaLogoVertical
            className="text-primary h-auto w-48"
            aria-label="ORDA"
          />
        </div>

        <Button variant="primary" onClick={handleStart}>
          등산하러 가기
        </Button>
      </div>
    </div>
  );
};

export default SplashPage;
