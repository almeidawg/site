
export const maskTelefone = (v) =>
  v.replace(/\D/g,'')
   .replace(/^(\d{2})(\d)/,'($1) $2')
   .replace(/(\d{5})(\d{4})$/,'$1-$2');

export const maskCPF = (v) =>
  v.replace(/\D/g,'').replace(/(\d{3})(\d)/,'$1.$2')
   .replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2');

export const maskCNPJ = (v) =>
  v.replace(/\D/g,'').replace(/^(\d{2})(\d)/,'$1.$2')
   .replace(/^(\d{2})\.(\d{3})(\d)/,'$1.$2.$3')
   .replace(/\.(\d{3})(\d)/,'.$1/$2').replace(/(\d{4})(\d{1,2})$/,'$1-$2');

export const maskRG = (v) => v.replace(/\D/g,'').replace(/(\d{2})(\d)/,'$1.$2')
   .replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1})$/,'$1-$2');

export const maskCEP = (v) => v.replace(/\D/g,'').replace(/(\d{5})(\d{3})$/,'$1-$2');
