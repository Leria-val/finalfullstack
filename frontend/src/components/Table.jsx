/**
 * Props:
 *   columns:      [{ key, label, render?: (value, row) => JSX }]
 *   data:         array of objects
 *   onEdit:       (row) => void
 *   onDelete:     (row) => void
 *   loading:      boolean
 *   emptyMessage: string
 */
const Table = ({
  columns = [],
  data = [],
  onEdit,
  onDelete,
  loading = false,
  emptyMessage = "Nenhum registro encontrado.",
}) => {
  const hasActions = onEdit || onDelete;

  if (loading) {
    return (
      <div className="table-loading" aria-label="Carregando dados">
        <div className="table-spinner" />
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            {hasActions && <th style={{ textAlign: "center" }}>Ações</th>}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                className="td-empty"
                colSpan={columns.length + (hasActions ? 1 : 0)}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr key={row.id ?? rowIdx}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render
                      ? col.render(row[col.key], row)
                      : (row[col.key] ?? "—")}
                  </td>
                ))}

                {hasActions && (
                  <td className="table-action-cell">
                    <div className="table-actions">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="tbl-btn-edit"
                        >
                          Editar
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="tbl-btn-delete"
                        >
                          Excluir
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;