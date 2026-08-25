import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/member")({
  component: MemberLayout,
});

function MemberLayout() {
  return (
    <AppShell role="MEMBER">
      <Outlet />
    </AppShell>
  );
}
