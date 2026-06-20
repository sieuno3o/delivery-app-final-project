import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/signup-form";
import { getCurrentUser } from "@/lib/auth/session";
import { getSafeRedirectPath } from "@/lib/auth/validation";

type SignUpPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
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
      description="이메일로 간단히 가입하고 우리 동네 맛집 주문을 시작해 보세요."
      eyebrow="JOIN DONGNE HANIP"
      footer="가입하면 안전한 로그인 세션이 생성됩니다."
      title="첫 주문을 시작해요"
    >
      <SignUpForm redirectTo={redirectTo} />
    </AuthShell>
  );
}
