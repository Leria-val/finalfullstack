import { useState, useEffect, useCallback } from "react";
import Table from "../components/Table.jsx";
import Modal from "../components/Modal.jsx";
import Input from "../components/Input.jsx";
import useAuth from "../hooks/useAuth.js";
import api from "../services/api.js";

/* ── GradeForm ─────────────────────────────────────────────────── */
const GradeForm = ({ enrollments, onSubmit, onCancel, loading }) => {
  const [form, setForm]     = useState({ enrollment_id: "", value: "", period: "", description: "" });
  const [errors, setErrors] = useState({});

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.enrollment_id)                                        errs.enrollment_id = "Selecione uma matrícula.";
    if (form.value === "" || form.value === null)                   errs.value         = "Nota obrigatória.";
    if (parseFloat(form.value) < 0 || parseFloat(form.value) > 10) errs.value         = "Nota deve ser entre 0 e 10.";
    if (!form.period.trim())                                        errs.period        = "Período obrigatório.";
    return errs;
  };

  const submit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    // FIX: send enrollment_id (snake_case) matching gradeController
    onSubmit({ ...form, value: parseFloat(form.value) });
  };

  return (
    <form onSubmit={submit} className="form-col" noValidate>
      <div className="form-field">
        <label className="form-label">
          Matrícula (Aluno) <span className="required-star">*</span>
        </label>
        <select
          value={form.enrollment_id}
          onChange={(e) => setForm((p) => ({ ...p, enrollment_id: e.target.value }))}
          className={`form-select${errors.enrollment_id ? " has-error" : ""}`}
        >
          <option value="">Selecione uma matrícula...</option>
          {enrollments.map((e) => (
            <option key={e.id} value={e.id}>{e.studentName} — {e.className}</option>
          ))}
        </select>
        {errors.enrollment_id && <span className="form-error" role="alert">{errors.enrollment_id}</span>}
      </div>

      <Input label="Nota (0 — 10)" name="value"       type="number" value={form.value}       onChange={handle} placeholder="Ex: 8.5"                              required error={errors.value}  />
      <Input label="Período"       name="period"                    value={form.period}      onChange={handle} placeholder="Ex: 1º Bimestre, Prova Final..."      required error={errors.period} />
      <Input label="Observação"    name="description"               value={form.description} onChange={handle} placeholder="Ex: Ótimo desempenho na prova prática." />

      <div className="form-row-actions">
        <button type="button" onClick={onCancel} className="btn btn--secondary">Cancelar</button>
        <button type="submit" disabled={loading} className="btn btn--primary">
          {loading ? "Lançando..." : "Lançar Nota"}
        </button>
      </div>
    </form>
  );
};

const STATUS_CLS = {
  aprovado:    "badge badge--approved",
  recuperação: "badge badge--recovery",
  reprovado:   "badge badge--failed",
};

const getStatusCls = (val) =>
  STATUS_CLS[val?.toLowerCase()] ?? "badge badge--approved";

/* ── Grade page ────────────────────────────────────────────────── */
const Grade = () => {
  const { user } = useAuth();
  const role     = user?.role?.toUpperCase();
  const isStaff  = role === "TEACHER" || role === "ADMIN";

  const [grades, setGrades]           = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [saving, setSaving]           = useState(false);
  const [search, setSearch]           = useState("");
  const [modal, setModal]             = useState(null);
  const [selected, setSelected]       = useState(null);
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [toast, setToast]             = useState(null);

  const showToast = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchGrades = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/grades", {
        params: { studentName: search || undefined, page, limit: 10 },
      });
      setGrades(data.grades ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      console.error(err);
      showToast("Erro ao carregar notas.");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchGrades(); }, [fetchGrades]);

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };

  const fetchEnrollments = async () => {
    try {
      const { data } = await api.get("/enrollments", { params: { limit: 200 } });
      setEnrollments(data.enrollments ?? []);
    } catch (err) { console.error(err); }
  };

  const openCreate = () => { fetchEnrollments(); setModal("create"); };

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await api.post("/grades", form);
      setModal(null);
      setPage(1);
      showToast("Nota lançada!", "success");
    } catch (err) {
      showToast(err.response?.data?.error || "Erro ao lançar nota.");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/grades/${selected.id}`);
      setModal(null);
      setPage(1);
      showToast("Nota removida.", "success");
    } catch (err) {
      showToast(err.response?.data?.error || "Erro ao remover nota.");
    } finally { setSaving(false); }
  };

  const columns = [
    { key: "studentName",    label: "Aluno",      render: (_, row) => row.student?.name ?? row.studentName ?? "—" },
    { key: "className",      label: "Turma",      render: (_, row) => row.class?.name   ?? row.className   ?? "—" },
    { key: "period",         label: "Período"                                                                       },
    { key: "formattedValue", label: "Nota",       render: (val) => <span className="grade-value">{val}</span>      },
    { key: "status",         label: "Status",     render: (val) => <span className={getStatusCls(val)}>{val}</span> },
    { key: "description",    label: "Observação", render: (val) => val ?? "—"                                       },
  ];

  return (
    <div className="page-wrapper">
      {toast && <div className={`toast toast--${toast.type}`} role="alert">{toast.type === "success" ? "✅" : "⚠️"} {toast.msg}</div>}

      <div className="page-topbar">
        <div className="page-header">
          <h1 className="page-title">Notas</h1>
          <p className="page-subtitle">
            {isStaff ? "Lance e gerencie as notas dos alunos." : "Suas notas e desempenho acadêmico."}
          </p>
        </div>
        {isStaff && <button onClick={openCreate} className="btn btn--primary">+ Lançar Nota</button>}
      </div>

      {isStaff && (
        <div className="page-search">
          <Input name="search" value={search} onChange={handleSearch} placeholder="Buscar por nome do aluno..." icon="🔍" />
        </div>
      )}

      <Table
        columns={columns} data={grades} loading={loading}
        onDelete={isStaff ? (row) => { setSelected(row); setModal("delete"); } : undefined}
        emptyMessage="Nenhuma nota encontrada."
      />

      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} className={`pagination-btn${p === page ? " active" : ""}`}>{p}</button>
          ))}
        </div>
      )}

      <Modal isOpen={modal === "create"} onClose={() => setModal(null)} title="Lançar Nota" size="lg">
        <GradeForm enrollments={enrollments} onSubmit={handleCreate} onCancel={() => setModal(null)} loading={saving} />
      </Modal>

      <Modal isOpen={modal === "delete"} onClose={() => setModal(null)} title="Remover Nota" size="sm">
        <p className="delete-confirm-text">
          Tem certeza que deseja remover a nota <strong>{selected?.formattedValue}</strong> de <strong>{selected?.student?.name ?? selected?.studentName}</strong>?
        </p>
        <div className="form-row-actions">
          <button onClick={() => setModal(null)} className="btn btn--secondary">Cancelar</button>
          <button onClick={handleDelete} disabled={saving} className="btn btn--danger">{saving ? "Removendo..." : "Remover"}</button>
        </div>
      </Modal>
    </div>
  );
};

export default Grade;