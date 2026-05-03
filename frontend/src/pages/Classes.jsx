import { useState, useEffect, useRef } from "react";
import Table from "../components/Table.jsx";
import Modal from "../components/Modal.jsx";
import Input from "../components/Input.jsx";
import api from "../services/api.js";

const EMPTY_FORM = { name: "", subject: "", teacher_id: "" };

/* ── ClassForm ─────────────────────────────────────────────────── */
const ClassForm = ({ initial = EMPTY_FORM, teachers, onSubmit, onCancel, loading }) => {
  const [form, setForm]     = useState(initial);
  const [errors, setErrors] = useState({});

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim())    errs.name      = "Nome obrigatório.";
    if (!form.subject.trim()) errs.subject   = "Matéria obrigatória.";
    if (!form.teacher_id)      errs.teacher_id = "Selecione um professor.";
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
      <Input
        label="Nome da Turma" name="name" value={form.name}
        onChange={handle} placeholder="Ex: Turma A — Piano"
        required error={errors.name}
      />
      <Input
        label="Matéria" name="subject" value={form.subject}
        onChange={handle} placeholder="Ex: Piano, Violão, Teoria Musical..."
        required error={errors.subject}
      />

      <div className="form-field">
        <label className="form-label">
          Professor <span className="required-star" aria-hidden="true">*</span>
        </label>
        <select
          value={form.teacher_id}
          onChange={(e) => setForm((p) => ({ ...p, teacher_id: e.target.value }))}
          className={`form-select${errors.teacher_id ? " has-error" : ""}`}
        >
          <option value="">Selecione um professor...</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        {errors.teacher_id && (
          <span className="form-error" role="alert">{errors.teacher_id}</span>
        )}
      </div>

      <div className="form-row-actions">
        <button type="button" onClick={onCancel} className="btn btn--secondary">Cancelar</button>
        <button type="submit" disabled={loading} className="btn btn--primary">
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
};

/* ── Classes page ──────────────────────────────────────────────── */
const Classes = () => {
  const [classes, setClasses]       = useState([]);
  const [teachers, setTeachers]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [search, setSearch]         = useState("");
  const [modal, setModal]           = useState(null);
  const [selected, setSelected]     = useState(null);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
        const { data } = await api.get("/classes", {
          params: { name: search || undefined, page: currentPage, limit: 10 },
        });
        if (!cancelled) {
          setClasses(data.classes ?? []);
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

  const fetchTeachers = async () => {
    try {
      const { data } = await api.get("/users", { params: { role: "TEACHER", limit: 200 } });
      setTeachers(data.users ?? []);
    } catch (err) { console.error(err); }
  };

  const openCreate = () => { fetchTeachers(); setModal("create"); };
  const openEdit   = (row) => { fetchTeachers(); setSelected(row); setModal("edit"); };

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await api.post("/classes", form);
      setModal(null);
      setPage(1);
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao criar turma.");
    } finally { setSaving(false); }
  };

  const handleEdit = async (form) => {
    setSaving(true);
    try {
      await api.put(`/classes/${selected.id}`, form);
      setModal(null);
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao atualizar turma.");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/classes/${selected.id}`);
      setModal(null);
      setPage(1);
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao excluir turma.");
    } finally { setSaving(false); }
  };

  const columns = [
    { key: "name",        label: "Nome da Turma" },
    { key: "subject",     label: "Matéria" },
    { key: "teacherName", label: "Professor" },
    {
      key: "enrollmentCount",
      label: "Alunos",
      render: (val) => (
        <span className="count-badge">{val ?? 0}</span>
      ),
    },
    { key: "createdAt", label: "Criada em" },
  ];

  return (
    <div className="page-wrapper">
      <div className="page-topbar">
        <div className="page-header">
          <h1 className="page-title">Turmas</h1>
          <p className="page-subtitle">Gerencie as turmas da plataforma.</p>
        </div>
        <button onClick={openCreate} className="btn btn--primary">+ Nova Turma</button>
      </div>

      <div className="page-search">
        <Input
          name="search" value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome..." icon="🔍"
        />
      </div>

      <Table
        columns={columns} data={classes} loading={loading}
        onEdit={openEdit}
        onDelete={(row) => { setSelected(row); setModal("delete"); }}
        emptyMessage="Nenhuma turma encontrada."
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

      <Modal isOpen={modal === "create"} onClose={() => setModal(null)} title="Nova Turma">
        <ClassForm teachers={teachers} onSubmit={handleCreate} onCancel={() => setModal(null)} loading={saving} />
      </Modal>

      <Modal isOpen={modal === "edit"} onClose={() => setModal(null)} title="Editar Turma">
        <ClassForm
          initial={{ name: selected?.name ?? "", subject: selected?.subject ?? "", teacher_id: selected?.teacher_id ?? "" }}
          teachers={teachers} onSubmit={handleEdit} onCancel={() => setModal(null)} loading={saving}
        />
      </Modal>

      <Modal isOpen={modal === "delete"} onClose={() => setModal(null)} title="Excluir Turma" size="sm">
        <p className="delete-confirm-text">
          Tem certeza que deseja excluir a turma <strong>{selected?.name}</strong>?
        </p>
        <div className="form-row-actions">
          <button onClick={() => setModal(null)} className="btn btn--secondary">Cancelar</button>
          <button onClick={handleDelete} disabled={saving} className="btn btn--danger">
            {saving ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Classes;