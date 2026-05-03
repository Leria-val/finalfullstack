import { useState, useEffect, useRef } from "react";
import Table from "../components/Table.jsx";
import Modal from "../components/Modal.jsx";
import api from "../services/api.js";

/* ── EnrollForm ────────────────────────────────────────────────── */
const EnrollForm = ({ students, classes, onSubmit, onCancel, loading }) => {
  const [form, setForm]     = useState({ studentId: "", classId: "" });
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

  return (
    <form onSubmit={submit} className="form-col" noValidate>

      <div className="form-field">
        <label className="form-label">
          Aluno <span className="required-star" aria-hidden="true">*</span>
        </label>
        <select
          value={form.studentId}
          onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))}
          className={`form-select${errors.studentId ? " has-error" : ""}`}
        >
          <option value="">Selecione um aluno...</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>{s.name} — {s.enrollment}</option>
          ))}
        </select>
        {errors.studentId && <span className="form-error" role="alert">{errors.studentId}</span>}
      </div>

      <div className="form-field">
        <label className="form-label">
          Turma <span className="required-star" aria-hidden="true">*</span>
        </label>
        <select
          value={form.classId}
          onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value }))}
          className={`form-select${errors.classId ? " has-error" : ""}`}
        >
          <option value="">Selecione uma turma...</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name} — {c.subject}</option>
          ))}
        </select>
        {errors.classId && <span className="form-error" role="alert">{errors.classId}</span>}
      </div>

      <div className="form-row-actions">
        <button type="button" onClick={onCancel} className="btn btn--secondary">Cancelar</button>
        <button type="submit" disabled={loading} className="btn btn--primary">
          {loading ? "Matriculando..." : "Matricular"}
        </button>
      </div>
    </form>
  );
};

/* ── Enrollments page ──────────────────────────────────────────── */
const STATUS_MAP = {
  active:   "badge badge--approved",
  inactive: "badge badge--failed",
};
const STATUS_LABEL = { active: "Ativa", inactive: "Inativa" };

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
        const { data } = await api.get("/enrollments", {
          params: { studentName: search || undefined, page: currentPage, limit: 10 },
        });
        if (!cancelled) {
          setEnrollments(data.enrollments);
          setTotalPages(data.totalPages);
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

  const fetchOptions = async () => {
    try {
      const [sRes, cRes] = await Promise.all([
        api.get("/students", { params: { limit: 200 } }),
        api.get("/classes",  { params: { limit: 200 } }),
      ]);
      setStudents(sRes.data.students);
      setClasses(cRes.data.classes);
    } catch (err) { console.error(err); }
  };

  const openCreate = () => { fetchOptions(); setModal("create"); };

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await api.post("/enrollments", form);
      setModal(null);
      setPage(1);
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao matricular aluno.");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/enrollments/${selected.id}`);
      setModal(null);
      setPage(1);
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao cancelar matrícula.");
    } finally { setSaving(false); }
  };

  const columns = [
    { key: "studentName", label: "Aluno" },
    { key: "enrollment",  label: "Matrícula" },
    { key: "className",   label: "Turma" },
    { key: "subject",     label: "Matéria" },
    { key: "teacherName", label: "Professor" },
    {
      key: "status",
      label: "Status",
      render: (val = "active") => (
        <span className={STATUS_MAP[val] ?? STATUS_MAP.active}>
          {STATUS_LABEL[val] ?? "Ativa"}
        </span>
      ),
    },
    { key: "createdAt", label: "Matriculado em" },
  ];

  return (
    <div className="page-wrapper">
      <div className="page-topbar">
        <div className="page-header">
          <h1 className="page-title">Matrículas</h1>
          <p className="page-subtitle">Vincule alunos às turmas da plataforma.</p>
        </div>
        <button onClick={openCreate} className="btn btn--primary">+ Nova Matrícula</button>
      </div>

      <div className="inline-search">
        <span className="inline-search-icon" aria-hidden="true">🔍</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome do aluno..."
          className="inline-search-input"
          aria-label="Buscar matrícula"
        />
      </div>

      <Table
        columns={columns} data={enrollments} loading={loading}
        onDelete={(row) => { setSelected(row); setModal("delete"); }}
        emptyMessage="Nenhuma matrícula encontrada."
      />

      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p} onClick={() => setPage(p)}
              className={`pagination-btn${p === page ? " active" : ""}`}
            >{p}</button>
          ))}
        </div>
      )}

      <Modal isOpen={modal === "create"} onClose={() => setModal(null)} title="Nova Matrícula">
        <EnrollForm
          students={students} classes={classes}
          onSubmit={handleCreate} onCancel={() => setModal(null)} loading={saving}
        />
      </Modal>

      <Modal isOpen={modal === "delete"} onClose={() => setModal(null)} title="Cancelar Matrícula" size="sm">
        <p className="delete-confirm-text">
          Tem certeza que deseja cancelar a matrícula de{" "}
          <strong>{selected?.studentName}</strong> na turma{" "}
          <strong>{selected?.className}</strong>?
        </p>
        <div className="form-row-actions">
          <button onClick={() => setModal(null)} className="btn btn--secondary">Voltar</button>
          <button onClick={handleDelete} disabled={saving} className="btn btn--danger">
            {saving ? "Cancelando..." : "Confirmar"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Enrollments;