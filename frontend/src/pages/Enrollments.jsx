// src/pages/Enrollments/index.jsx
import { useState, useEffect, useCallback } from "react";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import api from "../../services/api";

// ─── Formulário de matrícula ───────────────────────────────────────────────────
const EnrollForm = ({ students, classes, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState({ studentId: "", classId: "" });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.studentId) errs.studentId = "Selecione um aluno.";
    if (!form.classId)   errs.classId   = "Selecione uma turma.";
    return errs;
  };

  const submit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    onSubmit(form);
  };

  const selectStyle = (hasError) => ({
    width: "100%", padding: "11px 14px",
    border: `1.5px solid ${hasError ? "#e53e3e" : "#e2e8f0"}`,
    borderRadius: 10, background: "#f7f9fc",
    fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#1a202c",
    outline: "none", cursor: "pointer",
  });

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Aluno */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={labelStyle}>Aluno *</label>
        <select
          value={form.studentId}
          onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))}
          style={selectStyle(errors.studentId)}
        >
          <option value="">Selecione um aluno...</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {s.enrollment}
            </option>
          ))}
        </select>
        {errors.studentId && <span style={errorStyle}>{errors.studentId}</span>}
      </div>

      {/* Turma */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={labelStyle}>Turma *</label>
        <select
          value={form.classId}
          onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value }))}
          style={selectStyle(errors.classId)}
        >
          <option value="">Selecione uma turma...</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} — {c.subject}
            </option>
          ))}
        </select>
        {errors.classId && <span style={errorStyle}>{errors.classId}</span>}
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
        <button type="button" onClick={onCancel} style={btnStyle("#f7f9fc", "#4a5568")}>Cancelar</button>
        <button type="submit" disabled={loading} style={btnStyle("#1a365d", "#fff")}>
          {loading ? "Matriculando..." : "Matricular"}
        </button>
      </div>
    </form>
  );
};

// ─── Página principal ──────────────────────────────────────────────────────────
const Enrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents]       = useState([]);
  const [classes, setClasses]         = useState([]);
  const [loading, setLoading]         = useState(false);
  const [saving, setSaving]           = useState(false);
  const [search, setSearch]           = useState("");
  const [modal, setModal]             = useState(null);
  const [selected, setSelected]       = useState(null);
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/enrollments", {
        params: { studentName: search || undefined, page, limit: 10 },
      });
      setEnrollments(data.enrollments);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  }, [search, page]);

  // Carrega listas para os selects do formulário
  const fetchOptions = async () => {
    try {
      const [sRes, cRes] = await Promise.all([
        api.get("/students", { params: { limit: 200 } }),
        api.get("/classes",  { params: { limit: 200 } }),
      ]);
      setStudents(sRes.data.students);
      setClasses(cRes.data.classes);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchEnrollments(); }, [fetchEnrollments]);
  useEffect(() => { setPage(1); }, [search]);

  const openCreate = () => {
    fetchOptions();
    setModal("create");
  };

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await api.post("/enrollments", form);
      setModal(null);
      fetchEnrollments();
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao matricular aluno.");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/enrollments/${selected.id}`);
      setModal(null);
      fetchEnrollments();
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao cancelar matrícula.");
    } finally { setSaving(false); }
  };

  const STATUS_BADGE = {
    active:   { bg: "#c6f6d5", color: "#276749", label: "Ativa" },
    inactive: { bg: "#fed7d7", color: "#9b2c2c", label: "Inativa" },
  };

  const columns = [
    { key: "studentName",  label: "Aluno" },
    { key: "enrollment",   label: "Matrícula" },
    { key: "className",    label: "Turma" },
    { key: "subject",      label: "Matéria" },
    { key: "teacherName",  label: "Professor" },
    {
      key: "status", label: "Status",
      render: (val = "active") => {
        const b = STATUS_BADGE[val] ?? STATUS_BADGE.active;
        return (
          <span style={{ background: b.bg, color: b.color, borderRadius: 20, padding: "3px 11px", fontSize: 12, fontWeight: 700 }}>
            {b.label}
          </span>
        );
      },
    },
    { key: "createdAt", label: "Matriculado em" },
  ];

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={h1Style}>Matrículas</h1>
          <p style={{ margin: 0, color: "#718096", fontSize: 14 }}>Vincule alunos às turmas da plataforma.</p>
        </div>
        <button onClick={openCreate} style={btnStyle("#1a365d", "#fff")}>+ Nova Matrícula</button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20, maxWidth: 340 }}>
        <Input
          name="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome do aluno..."
          icon="🔍"
        />
      </div>

      <Table
        columns={columns}
        data={enrollments}
        loading={loading}
        onDelete={(row) => { setSelected(row); setModal("delete"); }}
        emptyMessage="Nenhuma matrícula encontrada."
      />

      {totalPages > 1 && (
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 24 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} style={{ ...btnStyle(p === page ? "#1a365d" : "#f7f9fc", p === page ? "#fff" : "#4a5568"), padding: "6px 14px", minWidth: 36 }}>{p}</button>
          ))}
        </div>
      )}

      {/* Modal: Nova Matrícula */}
      <Modal isOpen={modal === "create"} onClose={() => setModal(null)} title="Nova Matrícula">
        <EnrollForm
          students={students}
          classes={classes}
          onSubmit={handleCreate}
          onCancel={() => setModal(null)}
          loading={saving}
        />
      </Modal>

      {/* Modal: Cancelar Matrícula */}
      <Modal isOpen={modal === "delete"} onClose={() => setModal(null)} title="Cancelar Matrícula" size="sm">
        <p style={{ color: "#4a5568", marginTop: 0 }}>
          Tem certeza que deseja cancelar a matrícula de{" "}
          <strong>{selected?.studentName}</strong> na turma <strong>{selected?.className}</strong>?
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={() => setModal(null)} style={btnStyle("#f7f9fc", "#4a5568")}>Voltar</button>
          <button onClick={handleDelete} disabled={saving} style={btnStyle("#c53030", "#fff")}>
            {saving ? "Cancelando..." : "Confirmar"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

const pageStyle  = { padding: "32px 40px", fontFamily: "'DM Sans', sans-serif", maxWidth: 1100, margin: "0 auto" };
const h1Style    = { margin: 0, fontSize: 26, fontWeight: 800, color: "#1a365d", letterSpacing: "-0.02em" };
const labelStyle = { fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "#2d3748", letterSpacing: "0.02em", textTransform: "uppercase" };
const errorStyle = { fontSize: 12, color: "#e53e3e", fontFamily: "'DM Sans', sans-serif" };
const btnStyle   = (bg, color) => ({ background: bg, color, border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" });

export default Enrollments;