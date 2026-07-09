import { SignupForm } from "@/components/auth/signup-form";

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <SignupForm next={next} />
    </div>
  );
}
