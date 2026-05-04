import { useState, useEffect, useCallback } from "react";
import Table from "../components/Table.jsx";
import Modal from "../components/Modal.jsx";
import Input from "../components/Input.jsx";
import api from "../services/api.js";

/* ── Backend expects these exact fields on POST ─────────────────
   name, email, password            → creates User with role STUDENT
   registration_number, instrument, musical_level, birth_date, phone → creates Student
   On PUT only: registration_number, musical_level, instrument, birth_date, phone, status
   ──────────────────────────────────────────────────────────────── */

const EMPTY_CREATE = {
  name: "", email: "", password: "",
  registration_number: "", instrument: "", musical_level: "", birth_date: "", phone: "",
};

const EMPTY_EDIT = {
  registration_number: "", instrument: "", musical_level: "", birth_date: "", phone: "", status: "ACTIVE",
};

/* ── CreateStudentForm (POST — needs user data too) ────────────── */
const CreateStudentForm = ({ onSubmit, onCancel, loading }) => {
  const [form, setForm]     = useState(EMPTY_CREATE);
  const [errors, setErrors] = useState({});

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim())                errs.name                = "Nome obrigatório.";
    if (!form.email.trim())               errs.email               = "E-mail obrigatório.";
    if (!form.password.trim())            errs.password            = "Senha obrigatória.";
    if (!form.registration_number.trim()) errs.registration_number = "Matrícula obrigatória.";
    if (!form.birth_date)                 errs.birth_date          = "Data de nascimento obrigatória.";
    if (!form.phone.trim())               errs.phone               = "Telefone obrigatório.";
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
      <p className="form-section-hint">Conta de acesso</p>
      <Input label="Nome completo" name="name"     value={form.name}     onChange={handle} placeholder="Nome do aluno"    required error={errors.name} />
      <Input label="E-mail"        name="email"    type="email" value={form.email} onChange={handle} placeholder="aluno@escola.com" required error={errors.email} />
      <Input label="Senha"         name="password" type="password" value={form.password} onChange={handle} placeholder="••••••••" required error={errors.password} />

      <p className="form-section-hint" style={{ marginTop: 8 }}>Dados acadêmicos</p>
      <Input label="Matrícula"         name="registration_number" value={form.registration_number} onChange={handle} placeholder="Ex: 2024001"   required error={errors.registration_number} />
      <Input label="Instrumento"       name="instrument"          value={form.instrument}          onChange={handle} placeholder="Ex: Piano, Violão..." />
      <Input label="Nível musical"     name="musical_level"       value={form.musical_level}       onChange={handle} placeholder="Ex: Iniciante, Intermediário..." />
      <Input label="Data de nascimento" name="birth_date" type="date" value={form.birth_date}      onChange={handle} required error={errors.birth_date} />
      <Input label="Telefone"          name="phone"               value={form.phone}               onChange={handle} placeholder="(00) 00000-0000" required error={errors.phone} />

      <div className="form-row-actions">
        <button type="button" onClick={onCancel} className="btn btn--secondary">Cancelar</button>
        <button type="submit" disabled={loading} className="btn btn--primary">{loading ? "Salvando..." : "Salvar"}</button>
      </div>
    </form>
  );
};

/* ── EditStudentForm (PUT — only academic data) ────────────────── */
const EditStudentForm = ({ initial, onSubmit, onCancel, loading }) => {
  const [form, setForm]     = useState({ ...EMPTY_EDIT, ...initial });
  const [errors, setErrors] = useState({});

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.registration_number.trim()) errs.registration_number = "Matrícula obrigatória.";
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
      <Input label="Matrícula"          name="registration_number" value={form.registration_number} onChange={handle} placeholder="Ex: 2024001"            required error={errors.registration_number} />
      <Input label="Instrumento"        name="instrument"          value={form.instrument}          onChange={handle} placeholder="Ex: Piano, Violão..." />
      <Input label="Nível musical"      name="musical_level"       value={form.musical_level}       onChange={handle} placeholder="Ex: Iniciante..." />
      <Input label="Data de nascimento" name="birth_date" type="date" value={form.birth_date}       onChange={handle} />
      <Input label="Telefone"           name="phone"               value={form.phone}               onChange={handle} placeholder="(00) 00000-0000" />

      <div className="form-field">
        <label className="form-label">Status</label>
        <select name="status" value={form.status} onChange={handle} className="form-select">
          <option value="ACTIVE">Ativo</option>
          <option value="INACTIVE">Inativo</option>
        </select>
      </div>

      <div className="form-row-actions">
        <button type="button" onClick={onCancel} className="btn btn--secondary">Cancelar</button>
        <button type="submit" disabled={loading} className="btn btn--primary">{loading ? "Salvando..." : "Salvar"}</button>
      </div>
    </form>
  );
};

/* ── Students page ─────────────────────────────────────────────── */
const Students = () => {
  const [students, setStudents]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [search, setSearch]         = useState("");
  const [modal, setModal]           = useState(null);
  const [selected, setSelected]     = useState(null);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [toast, setToast]           = useState(null);

  const showToast = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/students", {
        params: { name: search || undefined, page, limit: 10 },
      });
      setStudents(data.students ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      console.error(err);
      showToast("Erro ao carregar alunos.");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await api.post("/students", form);
      setModal(null);
      setPage(1);
      showToast("Aluno criado com sucesso!", "success");
    } catch (err) {
      showToast(err.response?.data?.error || "Erro ao criar aluno.");
    } finally { setSaving(false); }
  };

  const handleEdit = async (form) => {
    setSaving(true);
    try {
      await api.put(`/students/${selected.id}`, form);
      setModal(null);
      showToast("Aluno atualizado!", "success");
      fetchStudents();
    } catch (err) {
      showToast(err.response?.data?.error || "Erro ao atualizar aluno.");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/students/${selected.id}`);
      setModal(null);
      setPage(1);
      showToast("Aluno excluído.", "success");
    } catch (err) {
      showToast(err.response?.data?.error || "Erro ao excluir aluno.");
    } finally { setSaving(false); }
  };

  const columns = [
    { key: "name",                label: "Nome"       },
    { key: "email",               label: "E-mail"     },
    { key: "registration_number", label: "Matrícula"  },
    { key: "instrument",          label: "Instrumento"},
    {
      key: "status", label: "Status",
      render: (val) => (
        <span className={`status-badge ${val === "ACTIVE" ? "status-badge--active" : "status-badge--inactive"}`}>
          {val === "ACTIVE" ? "Ativo" : "Inativo"}
        </span>
      ),
    },
  ];

  return (
    <div className="page-wrapper">
      {toast && <div className={`toast toast--${toast.type}`} role="alert">{toast.type === "success" ? "✅" : "⚠️"} {toast.msg}</div>}

      <div className="page-topbar">
        <div className="page-header">
          <h1 className="page-title">Alunos</h1>
          <p className="page-subtitle">Gerencie os alunos cadastrados na plataforma.</p>
        </div>
        <button onClick={() => setModal("create")} className="btn btn--primary">+ Novo Aluno</button>
      </div>

      <div className="page-search">
        <Input name="search" value={search} onChange={handleSearch} placeholder="Buscar por nome..." icon="🔍" />
      </div>

      <Table
        columns={columns} data={students} loading={loading}
        onEdit={(row) => { setSelected(row); setModal("edit"); }}
        onDelete={(row) => { setSelected(row); setModal("delete"); }}
        emptyMessage="Nenhum aluno encontrado."
      />

      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} className={`pagination-btn${p === page ? " active" : ""}`}>{p}</button>
          ))}
        </div>
      )}

      {/* CREATE — needs full user + academic data */}
      <Modal isOpen={modal === "create"} onClose={() => setModal(null)} title="Novo Aluno" size="lg">
        <CreateStudentForm onSubmit={handleCreate} onCancel={() => setModal(null)} loading={saving} />
      </Modal>

      {/* EDIT — only academic data (PUT) */}
      <Modal isOpen={modal === "edit"} onClose={() => setModal(null)} title="Editar Aluno">
        <EditStudentForm
          initial={{
            registration_number: selected?.registration_number ?? "",
            instrument:          selected?.instrument          ?? "",
            musical_level:       selected?.musical_level       ?? "",
            birth_date:          selected?.birth_date          ?? "",
            phone:               selected?.phone               ?? "",
            status:              selected?.status              ?? "ACTIVE",
          }}
          onSubmit={handleEdit} onCancel={() => setModal(null)} loading={saving}
        />
      </Modal>

      <Modal isOpen={modal === "delete"} onClose={() => setModal(null)} title="Excluir Aluno" size="sm">
        <p className="delete-confirm-text">Tem certeza que deseja excluir <strong>{selected?.name}</strong>?</p>
        <div className="form-row-actions">
          <button onClick={() => setModal(null)} className="btn btn--secondary">Cancelar</button>
          <button onClick={handleDelete} disabled={saving} className="btn btn--danger">{saving ? "Excluindo..." : "Excluir"}</button>
        </div>
      </Modal>
    </div>
  );
};

export default Students;