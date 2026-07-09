import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; reset?: string }>;
}) {
  const { next, error, reset } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <LoginForm
        next={next}
        authError={error === "auth"}
        resetOk={reset === "ok"}
      />
    </div>
  );
}
