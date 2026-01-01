import { LoginForm } from '@/components/auth/LoginForm';
import { LoginRedirect } from '@/components/auth/LoginRedirect';

export default function LoginPage() {
  return (
    <LoginRedirect>
      <LoginForm />
    </LoginRedirect>
  );
}

