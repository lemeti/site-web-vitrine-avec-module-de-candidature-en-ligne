function csvCell(value) {
  const text = value == null ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function toCsv(rows, headers) {
  const output = [headers.map((header) => csvCell(header.label)).join(',')];
  for (const row of rows) {
    output.push(headers.map((header) => csvCell(row[header.key])).join(','));
  }
  return output.join('\r\n');
}

module.exports = { toCsv };
