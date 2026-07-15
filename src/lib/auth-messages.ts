export function mensagemErroAuth(
  message: string,
  contexto: "login" | "cadastro" | "recuperar" | "redefinir",
): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "E-mail ou senha incorretos.";
  }
  if (lower.includes("email not confirmed")) {
    return "Confirme seu e-mail antes de entrar.";
  }
  if (lower.includes("user already registered")) {
    return "Este e-mail já está cadastrado.";
  }
  if (lower.includes("password") && lower.includes("weak")) {
    return "Senha fraca. Use pelo menos 6 caracteres.";
  }
  if (lower.includes("same") && lower.includes("password")) {
    return "A nova senha deve ser diferente da atual.";
  }
  if (lower.includes("too many requests")) {
    return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  }
  if (contexto === "recuperar") {
    return "Não foi possível enviar o e-mail. Tente novamente.";
  }
  if (contexto === "redefinir") {
    return "Não foi possível redefinir a senha. Solicite um novo link.";
  }
  return contexto === "login"
    ? "Não foi possível entrar. Verifique e-mail e senha."
    : "Não foi possível criar a conta. Tente novamente.";
}
