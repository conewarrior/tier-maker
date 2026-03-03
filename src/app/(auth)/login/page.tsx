import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">sisiduck</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            로그인하고 나만의 티어를 만들어보세요
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
