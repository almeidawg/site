export const USER_MODULES = [
  { key: 'colaboradores', label: 'Colaboradores' },
  { key: 'fornecedores', label: 'Fornecedores' },
  { key: 'especificadores', label: 'Especificadores' },
  { key: 'area_cliente', label: 'Area do Cliente' },
];

export function createModuleState() {
  return USER_MODULES.reduce((acc, option) => {
    acc[option.key] = false;
    return acc;
  }, {});
}

export function describeModules(modules = {}) {
  return USER_MODULES.filter((option) => modules[option.key]).map((option) => option.label);
}
