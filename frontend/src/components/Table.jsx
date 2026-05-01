// src/components/Table.jsx

/**
 * Props:
 *   columns: [{ key: string, label: string, render?: (value, row) => JSX }]
 *   data:    array of objects
 *   onEdit:  (row) => void
 *   onDelete:(row) => void
 *   loading: boolean
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
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
        <div style={{
          width: 36, height: 36,
          border: "3px solid #e2e8f0",
          borderTopColor: "#1a365d",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", overflowX: "auto", borderRadius: 14, boxShadow: "0 2px 16px rgba(26,54,93,0.07)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Sans', sans-serif" }}>
        {/* HEAD */}
        <thead>
          <tr style={{ background: "#1a365d" }}>
            {columns.map((col) => (
              <th key={col.key} style={{
                padding: "13px 20px",
                textAlign: "left",
                fontSize: 11,
                fontWeight: 700,
                color: "#90cdf4",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}>
                {col.label}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th style={{
                padding: "13px 20px",
                textAlign: "center",
                fontSize: 11,
                fontWeight: 700,
                color: "#90cdf4",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}>
                Ações
              </th>
            )}
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                style={{ padding: "40px 20px", textAlign: "center", color: "#a0aec0", fontSize: 14 }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr key={row.id ?? rowIdx} style={{
                background: rowIdx % 2 === 0 ? "#fff" : "#f7f9fc",
                borderBottom: "1px solid #edf2f7",
                transition: "background 0.15s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#ebf4ff"}
                onMouseLeave={e => e.currentTarget.style.background = rowIdx % 2 === 0 ? "#fff" : "#f7f9fc"}
              >
                {columns.map((col) => (
                  <td key={col.key} style={{
                    padding: "13px 20px",
                    fontSize: 14,
                    color: "#2d3748",
                    whiteSpace: "nowrap",
                  }}>
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
                  </td>
                ))}

                {(onEdit || onDelete) && (
                  <td style={{ padding: "13px 20px", textAlign: "center", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                      {onEdit && (
                        <button onClick={() => onEdit(row)} style={{
                          background: "#ebf8ff",
                          color: "#2b6cb0",
                          border: "none",
                          borderRadius: 7,
                          padding: "6px 14px",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                          transition: "background 0.15s",
                        }}
                          onMouseEnter={e => e.target.style.background = "#bee3f8"}
                          onMouseLeave={e => e.target.style.background = "#ebf8ff"}
                        >
                          Editar
                        </button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(row)} style={{
                          background: "#fff5f5",
                          color: "#c53030",
                          border: "none",
                          borderRadius: 7,
                          padding: "6px 14px",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                          transition: "background 0.15s",
                        }}
                          onMouseEnter={e => e.target.style.background = "#fed7d7"}
                          onMouseLeave={e => e.target.style.background = "#fff5f5"}
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