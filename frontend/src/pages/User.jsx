import { useState, useEffect, useCallback } from "react";
import Table from "../components/Table.jsx";
import Modal from "../components/Modal.jsx";
import Input from "../components/Input.jsx";
import api from "../services/api.js";

const ROLES = ["admin", "teacher", "student"];
const EMPTY_FORM = { name: "", email: "", password: "", role: "student" };

/* ── UserForm ──────────────────────────────────────────────────── */
const UserForm = ({ initial = EMPTY_FORM, isEdit = false, onSubmit, onCancel, loading }) => {
  const [form, setForm]     = useState(initial);
  const [errors, setErrors] = useState({});

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim())                       errs.name     = "Nome obrigatório.";
    if (!form.email.trim())                      errs.email    = "E-mail obrigatório.";
    if (!isEdit && !form.password.trim())        errs.password = "Senha obrigatória.";
    return errs;
  };

  const submit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    const payload = { ...form };
    if (isEdit && !payload.password) delete payload.password;
    onSubmit(payload);
  };

  return (
    <form onSubmit={submit} className="form-col" noValidate>
      <Input label="Nome"   name="name"     value={form.name}     onChange={handle} placeholder="Nome completo"    required error={errors.name} />
      <Input label="E-mail" name="email"    type="email" value={form.email} onChange={handle} placeholder="email@exemplo.com" required error={errors.email} />
      <Input label={isEdit ? "Nova Senha (opcional)" : "Senha"} name="password" type="password" value={form.password} onChange={handle} placeholder="••••••••" required={!isEdit} error={errors.password} />

      <div className="form-field">
        <label className="form-label">Perfil <span className="required-star">*</span></label>
        <div className="role-toggle-group">
          {ROLES.map((r) => (
            <button
              key={r} type="button"
              onClick={() => setForm((p) => ({ ...p, role: r }))}
              className={`role-toggle-btn${form.role === r ? " active" : ""}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="form-row-actions">
        <button type="button" onClick={onCancel} className="btn btn--secondary">Cancelar</button>
        <button type="submit" disabled={loading} className="btn btn--primary">{loading ? "Salvando..." : "Salvar"}</button>
      </div>
    </form>
  );
};

/* ── Role badge in table ───────────────────────────────────────── */
const ROLE_BADGE_CLS = {
  admin:   "role-badge role-badge--admin",
  teacher: "role-badge role-badge--teacher",
  student: "role-badge role-badge--student",
};

/* ── User page ─────────────────────────────────────────────────── */
const User = () => {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [modal, setModal]           = useState(null);
  const [selected, setSelected]     = useState(null);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [toast, setToast]           = useState(null);

  const showToast = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* FIX: all three filters are explicit deps — no ref tricks */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/users", {
        params: { name: search || undefined, role: roleFilter || undefined, page, limit: 10 },
      });
      setUsers(data.users ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      console.error(err);
      showToast("Erro ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  /* FIX: both search and roleFilter reset page to 1 */
  const handleSearch     = (e) => { setSearch(e.target.value); setPage(1); };
  const handleRoleFilter = (r)  => { setRoleFilter(r);         setPage(1); };

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await api.post("/users", form);
      setModal(null);
      setPage(1);
      showToast("Usuário criado!", "success");
    } catch (err) {
      showToast(err.response?.data?.error || "Erro ao criar usuário.");
    } finally { setSaving(false); }
  };

  const handleEdit = async (form) => {
    setSaving(true);
    try {
      await api.put(`/users/${selected.id}`, form);
      setModal(null);
      showToast("Usuário atualizado!", "success");
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.error || "Erro ao atualizar usuário.");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/users/${selected.id}`);
      setModal(null);
      setPage(1);
      showToast("Usuário excluído.", "success");
    } catch (err) {
      showToast(err.response?.data?.error || "Erro ao excluir usuário.");
    } finally { setSaving(false); }
  };

  const columns = [
    { key: "name",  label: "Nome"  },
    { key: "email", label: "E-mail" },
    {
      key: "role", label: "Perfil",
      render: (val) => (
        <span className={ROLE_BADGE_CLS[val?.toLowerCase()] ?? "role-badge"}>
          {val}
        </span>
      ),
    },
    { key: "createdAt", label: "Cadastrado em" },
  ];

  return (
    <div className="page-wrapper">
      {toast && <div className={`toast toast--${toast.type}`} role="alert">{toast.type === "success" ? "✅" : "⚠️"} {toast.msg}</div>}

      <div className="page-topbar">
        <div className="page-header">
          <h1 className="page-title">Usuários</h1>
          <p className="page-subtitle">Gerencie todos os usuários da plataforma.</p>
        </div>
        <button onClick={() => setModal("create")} className="btn btn--primary">+ Novo Usuário</button>
      </div>

      {/* FIX: filter bar with search + role chips side by side */}
      <div className="filter-bar">
        <div className="filter-bar-search">
          <Input name="search" value={search} onChange={handleSearch} placeholder="Buscar por nome..." icon="🔍" />
        </div>
        <div className="filter-chips">
          {["", ...ROLES].map((r) => (
            <button
              key={r}
              onClick={() => handleRoleFilter(r)}
              className={`filter-chip${roleFilter === r ? " active" : ""}`}
            >
              {r === "" ? "Todos" : r}
            </button>
          ))}
        </div>
      </div>

      <Table
        columns={columns} data={users} loading={loading}
        onEdit={(row) => { setSelected(row); setModal("edit"); }}
        onDelete={(row) => { setSelected(row); setModal("delete"); }}
        emptyMessage="Nenhum usuário encontrado."
      />

      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} className={`pagination-btn${p === page ? " active" : ""}`}>{p}</button>
          ))}
        </div>
      )}

      <Modal isOpen={modal === "create"} onClose={() => setModal(null)} title="Novo Usuário">
        <UserForm onSubmit={handleCreate} onCancel={() => setModal(null)} loading={saving} />
      </Modal>

      <Modal isOpen={modal === "edit"} onClose={() => setModal(null)} title="Editar Usuário">
        <UserForm
          initial={{ name: selected?.name ?? "", email: selected?.email ?? "", password: "", role: selected?.role?.toLowerCase() ?? "student" }}
          isEdit onSubmit={handleEdit} onCancel={() => setModal(null)} loading={saving}
        />
      </Modal>

      <Modal isOpen={modal === "delete"} onClose={() => setModal(null)} title="Excluir Usuário" size="sm">
        <p className="delete-confirm-text">Tem certeza que deseja excluir <strong>{selected?.name}</strong>?</p>
        <div className="form-row-actions">
          <button onClick={() => setModal(null)} className="btn btn--secondary">Cancelar</button>
          <button onClick={handleDelete} disabled={saving} className="btn btn--danger">{saving ? "Excluindo..." : "Excluir"}</button>
        </div>
      </Modal>
    </div>
  );
};

export default User;