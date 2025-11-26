export async function parseCsvFile(file) {
  const text = await file.text();
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter((line) => line);
  if (lines.length === 0) {
    return { columns: [], rows: [] };
  }
  const header = lines.shift();
  const columns = header.split(',').map((column) => column.trim().toLowerCase());
  const rows = lines.map((line) =>
    line.split(',').map((cell) => cell.trim())
  );
  return { columns, rows };
}

export function validateCsvColumns(actualColumns, expectedColumns) {
  const normalized = actualColumns.map((column) => column.toLowerCase());
  const missing = expectedColumns.filter((column) => !normalized.includes(column.toLowerCase()));
  return missing;
}
