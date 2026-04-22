import { Navigate } from "react-router-dom";

type PublicOnlyRouteProps = {
  children: React.ReactNode;
};

export default function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const token = localStorage.getItem("accessToken");
  if (token) {
    return <Navigate to="/hiking" replace />;
  }
  return <>{children}</>;
}
