export const maskTelefone = (v) => {
  if (!v) return "";
  v = v.replace(/\D/g,'');
  if (v.length <= 10) {
    return v
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return v
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15);
}

export const maskCPF = (v) => {
  if (!v) return "";
  return v
    .replace(/\D/g,'')
    .replace(/(\d{3})(\d)/,'$1.$2')
    .replace(/(\d{3})(\d)/,'$1.$2')
    .replace(/(\d{3})(\d{1,2})$/,'$1-$2')
    .slice(0, 14);
}

export const maskCNPJ = (v) => {
  if (!v) return "";
  return v
    .replace(/\D/g,'')
    .replace(/^(\d{2})(\d)/,'$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/,'$1.$2.$3')
    .replace(/\.(\d{3})(\d)/,'.$1/$2')
    .replace(/(\d{4})(\d{1,2})$/,'$1-$2')
    .slice(0, 18);
}

export const maskRG = (v) => {
  if (!v) return "";
  return v
    .replace(/\D/g,'')
    .replace(/(\d{2})(\d)/,'$1.$2')
    .replace(/(\d{3})(\d)/,'$1.$2')
    .replace(/(\d{3})(\d{1})$/,'$1-$2');
}

export const maskCEP = (v) => {
  if (!v) return "";
  return v
    .replace(/\D/g,'')
    .replace(/(\d{5})(\d{3})$/,'$1-$2')
    .slice(0, 9);
}

export const onlyDigits = (s) => (s || '').replace(/\D/g, '');