/** Supabase Auth error messages are English; RB speaks Spanish. Unknown errors keep their original text. */
export function describeAuthError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err ?? '');
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials') || lower.includes('invalid_credentials'))
    return 'Correo o contraseña incorrectos.';
  if (lower.includes('email not confirmed'))
    return 'Confirma tu correo antes de entrar: revisa tu bandeja de entrada.';
  if (
    lower.includes('already registered') ||
    lower.includes('already been registered') ||
    lower.includes('user already exists')
  )
    return 'Ya existe una cuenta con ese correo. Entra o recupera tu contraseña.';
  if (lower.includes('password should be at least') || lower.includes('password is too short'))
    return 'La contraseña debe tener al menos 8 caracteres.';
  if (lower.includes('weak password') || lower.includes('password should contain'))
    return 'Elige una contraseña más fuerte: combina letras, números y símbolos.';
  if (
    lower.includes('rate limit') ||
    lower.includes('too many requests') ||
    lower.includes('over_email_send_rate_limit')
  )
    return 'Demasiados intentos seguidos. Espera unos minutos y vuelve a intentarlo.';
  if (lower.includes('same password') || lower.includes('different from the old'))
    return 'La nueva contraseña debe ser distinta a la anterior.';
  if (lower.includes('invalid email') || lower.includes('unable to validate email'))
    return 'Ese correo no parece válido.';
  if (lower.includes('signups not allowed')) return 'El registro está desactivado en este momento.';
  if (lower.includes('fetch') || lower.includes('network'))
    return 'Sin conexión con el servidor. Revisa tu internet.';
  return message || 'No se pudo completar la operación.';
}
