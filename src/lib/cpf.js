export const CPF_LOGIN_DOMAIN = "cpf.wgeasy.local";

export function sanitizeCpf(value) {
  if (!value) return "";
  return String(value).replace(/\D/g, "");
}

export function isCpfValid(value) {
  return sanitizeCpf(value).length === 11;
}

export function buildCpfLoginEmail(cpfDigits) {
  return `${cpfDigits}@${CPF_LOGIN_DOMAIN}`;
}

export function resolveLoginEmailFromCpf(rawCpf) {
  const digits = sanitizeCpf(rawCpf);
  if (digits.length !== 11) {
    return null;
  }
  return buildCpfLoginEmail(digits);
}

export function formatCpf(value) {
  const digits = sanitizeCpf(value);
  if (digits.length !== 11) {
    return value || "";
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}
