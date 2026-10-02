export function findRow(rows, id) {
  const row = rows.find(item => item.id === id);
  if (!row) throw new Error(`Unknown configuration: ${id}`);
  return row;
}

export function compareRows(rows, reference, comparison) {
  const a = findRow(rows, reference).values;
  const b = findRow(rows, comparison).values;
  return { ac: b[0] - a[0], ta: b[3] - a[3], tokenRatio: b[4] / a[4], a, b };
}

export function modelEffects(model) {
  const before = findRow(model.rows, 'L1+L2').values;
  const after = findRow(model.rows, 'L1+L2+L3').values;
  return { ac: after[0] - before[0], ta: after[3] - before[3], usage: model.usage };
}

export function systemEffects(data, addition) {
  const a = findRow(data.system_results, addition.from).values;
  const b = findRow(data.system_results, addition.to).values;
  return data.systems.map((system, index) => ({ ...system, ac: b[index * 4] - a[index * 4], ta: b[index * 4 + 3] - a[index * 4 + 3] }));
}

export function signed(value) {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded > 0 ? '+' : rounded < 0 ? '\u2212' : ''}${Math.abs(rounded).toFixed(1)}`;
}
