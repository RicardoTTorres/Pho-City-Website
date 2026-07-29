function quoteIdentifier(identifier) {
  if (!/^[A-Za-z0-9_]+$/.test(identifier)) {
    throw new Error(`Unsafe SQL identifier: ${identifier}`);
  }
  return `\`${identifier}\``;
}

export async function tableExists(connection, table) {
  const [rows] = await connection.query(
    `SELECT 1
       FROM information_schema.tables
      WHERE table_schema = DATABASE() AND table_name = ?
      LIMIT 1`,
    [table],
  );
  return rows.length > 0;
}

export async function getColumn(connection, table, column) {
  const [rows] = await connection.query(
    `SELECT COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
       FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = ?
        AND column_name = ?
      LIMIT 1`,
    [table, column],
  );
  return rows[0] ?? null;
}

export async function ensureTable(connection, table, createSql) {
  if (!(await tableExists(connection, table))) {
    await connection.query(createSql);
  }
}

export async function ensureColumn(connection, table, column, definition) {
  if (!(await getColumn(connection, table, column))) {
    await connection.query(
      `ALTER TABLE ${quoteIdentifier(table)}
       ADD COLUMN ${quoteIdentifier(column)} ${definition}`,
    );
    return true;
  }
  return false;
}

function normalizedDefault(value) {
  if (value === null || value === undefined) return null;
  return String(value).replace(/^'(.*)'$/, "$1").toLowerCase();
}

export async function ensureColumnShape(
  connection,
  table,
  column,
  { definition, type, nullable, defaultValue },
) {
  const existing = await getColumn(connection, table, column);
  if (!existing) {
    await ensureColumn(connection, table, column, definition);
    return;
  }

  const typeMatches =
    String(existing.COLUMN_TYPE).toLowerCase() === String(type).toLowerCase();
  const nullMatches =
    (String(existing.IS_NULLABLE).toUpperCase() === "YES") === nullable;
  const defaultMatches =
    normalizedDefault(existing.COLUMN_DEFAULT) ===
    normalizedDefault(defaultValue);

  if (!typeMatches || !nullMatches || !defaultMatches) {
    await connection.query(
      `ALTER TABLE ${quoteIdentifier(table)}
       MODIFY COLUMN ${quoteIdentifier(column)} ${definition}`,
    );
  }
}
export async function indexExists(connection, table, indexName) {
  const [rows] = await connection.query(
    `SELECT 1
       FROM information_schema.statistics
      WHERE table_schema = DATABASE()
        AND table_name = ?
        AND index_name = ?
      LIMIT 1`,
    [table, indexName],
  );
  return rows.length > 0;
}

export async function ensureIndex(
  connection,
  table,
  indexName,
  columnsSql,
  { unique = false } = {},
) {
  if (!(await indexExists(connection, table, indexName))) {
    await connection.query(
      `CREATE ${unique ? "UNIQUE " : ""}INDEX ${quoteIdentifier(indexName)}
       ON ${quoteIdentifier(table)} (${columnsSql})`,
    );
  }
}
