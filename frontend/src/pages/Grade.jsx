import { useState, useEffect, useRef } from "react";
import Table from "../components/Table.jsx";
import Modal from "../components/Modal.jsx";
import Input from "../components/Input.jsx";
import useAuth from "../hooks/useAuth.js";
import api from "../services/api.js";

const GradeForm = ({ enrollments, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState({ enrollmentId: "", value: "", period: "", description: "" });
  const [errors, setErrors] = useState({});

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.enrollmentId)                        errs.enrollmentId = "Selecione uma matrícula.";
    if (form.value === "" || form.value === null)   errs.value        = "Nota obrigatória.";
    if (parseFloat(form.value) < 0 || parseFloat(form.value) > 10) errs.value = "Nota deve ser entre 0 e 10.";
    if (!form.period.trim())                        errs.period       = "Período obrigatório.";
    return errs;
  };

  const submit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    onSubmit({ ...form, value: parseFloat(form.value) });
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={labelStyle}>Matrícula (Aluno) *</label>
        <select
          value={form.enrollmentId}
          onChange={(e) => setForm((p) => ({ ...p, enrollmentId: e.target.value }))}
          style={selStyle(errors.enrollmentId)}
        >
          <option value="">Selecione uma matrícula...</option>
          {enrollments.map((e) => (
            <option key={e.id} value={e.id}>
              {e.studentName} — {e.className}
            </option>
          ))}
        </select>
        {errors.enrollmentId && <span style={errStyle}>{errors.enrollmentId}</span>}
      </div>

      <Input
        label="Nota (0 — 10)"
        name="value"
        type="number"
        value={form.value}
        onChange={handle}
        placeholder="Ex: 8.5"
        required
        error={errors.value}
      />

      <Input
        label="Período"
        name="period"
        value={form.period}
        onChange={handle}
        placeholder="Ex: 1º Bimestre, Prova Final..."
        required
        error={errors.period}
      />

      <Input
        label="Observação (opcional)"
        name="description"
        value={form.description}
        onChange={handle}
        placeholder="Ex: Ótimo desempenho na prova prática."
      />

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <button type="button" onClick={onCancel} style={btn("#f7f9fc", "#4a5568")}>Cancelar</button>
        <button type="submit" disabled={loading} style={btn("#1a365d", "#fff")}>{loading ? "Lançando..." : "Lançar Nota"}</button>
      </div>
    </form>
  );
};

const STATUS_STYLE = {
  Aprovado:    { bg: "#c6f6d5", color: "#276749" },
  Recuperação: { bg: "#fefcbf", color: "#744210" },
  Reprovado:   { bg: "#fed7d7", color: "#9b2c2c" },
};

const Grade = () => {
  const { user }              = useAuth();
  const role                  = user?.role?.toUpperCase();

  const [grades, setGrades]           = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [saving, setSaving]           = useState(false);
  const [search, setSearch]           = useState("");
  const [modal, setModal]             = useState(null);
  const [selected, setSelected]       = useState(null);
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);

  const prevSearch = useRef(search);

  useEffect(() => {
    let currentPage = page;
    if (prevSearch.current !== search) {
      prevSearch.current = search;
      currentPage = 1;
      setPage(1);
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/grades", {
          params: {
            studentName: search || undefined,
            page: currentPage,
            limit: 10,
          },
        });
        if (!cancelled) {
          setGrades(data.grades ?? []);
          setTotalPages(data.totalPages ?? 1);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [search, page]);

  const fetchEnrollments = async () => {
    try {
      const { data } = await api.get("/enrollments", { params: { limit: 200 } });
      setEnrollments(data.enrollments ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  const openCreate = () => { fetchEnrollments(); setModal("create"); };

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await api.post("/grades", form);
      setModal(null);
      setPage(1);
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao lançar nota.");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/grades/${selected.id}`);
      setModal(null);
      setPage(1);
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao remover nota.");
    } finally { setSaving(false); }
  };

  const isTeacherOrAdmin = role === "TEACHER" || role === "ADMIN";

  const columns = [
    { key: "studentName", label: "Aluno",    render: (_, row) => row.student?.name ?? "—" },
    { key: "className",   label: "Turma",    render: (_, row) => row.class?.name ?? "—" },
    { key: "period",      label: "Período" },
    {
      key: "formattedValue", label: "Nota",
      render: (val) => (
        <span style={{ fontSize: 16, fontWeight: 800, color: "#1a365d" }}>{val}</span>
      ),
    },
    {
      key: "status", label: "Status",
      render: (val) => {
        const s = STATUS_STYLE[val] ?? STATUS_STYLE.Reprovado;
        return <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: "3px 11px", fontSize: 12, fontWeight: 700 }}>{val}</span>;
      },
    },
    { key: "description", label: "Observação", render: (val) => val ?? "—" },
  ];

  return (
    <div style={pageStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={h1Style}>Notas</h1>
          <p style={{ margin: 0, color: "#718096", fontSize: 14 }}>
            {isTeacherOrAdmin ? "Lance e gerencie as notas dos alunos." : "Suas notas e desempenho acadêmico."}
          </p>
        </div>
        {isTeacherOrAdmin && (
          <button onClick={openCreate} style={btn("#1a365d", "#fff")}>+ Lançar Nota</button>
        )}
      </div>

      {isTeacherOrAdmin && (
        <div style={{ marginBottom: 20, maxWidth: 340 }}>
          <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome do aluno..." icon="🔍" />
        </div>
      )}

      <Table
        columns={columns}
        data={grades}
        loading={loading}
        onDelete={isTeacherOrAdmin ? (row) => { setSelected(row); setModal("delete"); } : undefined}
        emptyMessage="Nenhuma nota encontrada."
      />

      {totalPages > 1 && (
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 24 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} style={{ ...btn(p === page ? "#1a365d" : "#f7f9fc", p === page ? "#fff" : "#4a5568"), padding: "6px 14px", minWidth: 36 }}>{p}</button>
          ))}
        </div>
      )}

      <Modal isOpen={modal === "create"} onClose={() => setModal(null)} title="Lançar Nota" size="lg">
        <GradeForm enrollments={enrollments} onSubmit={handleCreate} onCancel={() => setModal(null)} loading={saving} />
      </Modal>

      <Modal isOpen={modal === "delete"} onClose={() => setModal(null)} title="Remover Nota" size="sm">
        <p style={{ color: "#4a5568", marginTop: 0 }}>
          Tem certeza que deseja remover a nota <strong>{selected?.formattedValue}</strong> de <strong>{selected?.student?.name}</strong>?
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={() => setModal(null)} style={btn("#f7f9fc", "#4a5568")}>Cancelar</button>
          <button onClick={handleDelete} disabled={saving} style={btn("#c53030", "#fff")}>{saving ? "Removendo..." : "Remover"}</button>
        </div>
      </Modal>
    </div>
  );
};

const pageStyle  = { padding: "32px 40px", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", maxWidth: 1100, margin: "0 auto" };
const h1Style    = { margin: 0, fontSize: 26, fontWeight: 800, color: "#1a365d", letterSpacing: "-0.02em" };
const labelStyle = { fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "#2d3748", letterSpacing: "0.02em", textTransform: "uppercase" };
const errStyle   = { fontSize: 12, color: "#e53e3e", fontFamily: "'DM Sans', sans-serif" };
const selStyle   = (hasError) => ({ width: "100%", padding: "11px 14px", border: `1.5px solid ${hasError ? "#e53e3e" : "#e2e8f0"}`, borderRadius: 10, background: "#f7f9fc", fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#1a202c", outline: "none", cursor: "pointer", boxSizing: "border-box" });
const btn = (bg, color) => ({ background: bg, color, border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" });

export default Grade;