import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth/session";
import { getSafeRedirectPath } from "@/lib/auth/validation";

type LoginPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectTo = getSafeRedirectPath(
    typeof params.next === "string" ? params.next : null,
  );
  const user = await getCurrentUser();

  if (user) {
    redirect(redirectTo);
  }

  return (
    <AuthShell
      description="가입한 이메일과 비밀번호로 다시 동네 맛집을 만나보세요."
      eyebrow="WELCOME BACK"
      footer="비밀번호는 암호화된 해시로만 저장됩니다."
      title="다시 만나 반가워요"
    >
      <LoginForm redirectTo={redirectTo} />
    </AuthShell>
  );
}
