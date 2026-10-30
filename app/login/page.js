import AuthPage from "../auth-page";

export const metadata = {
  title: "Masuk | SPMB SMK Tadika Mesra Jakarta",
};

export default function LoginPage() {
  return <AuthPage initialMode="login" />;
}
