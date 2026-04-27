import type { ReactNode } from "react";

type PublicOnlyRouteProps = {
  children: ReactNode;
};

export default function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  return <>{children}</>;
}
