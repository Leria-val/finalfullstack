import { useState, useEffect, useRef } from "react";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import api from "../../services/api";

const ROLES = ["admin", "teacher", "student"];
const EMPTY_FORM = { name: "", email: "", password: "", role: "student" };

const ROLE_BADGE = {
  admin:   { bg: "#fefcbf", color: "#744210" },
  teacher: { bg: "#bee3f8", color: "#1a365d" },
  student: { bg: "#c6f6d5", color: "#276749" },
};

// ─── Formulário ────────────────────────────────────────────────────────────────
const UserForm = ({ initial = EMPTY_FORM, isEdit = false, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim())  errs.name  = "Nome obrigatório.";
    if (!form.email.trim()) errs.email = "E-mail obrigatório.";
    if (!isEdit && !form.password.trim()) errs.password = "Senha obrigatória.";
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
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Input label="Nome"   name="name"     value={form.name}     onChange={handle} placeholder="Nome completo" required error={errors.name} />
      <Input label="E-mail" name="email"    type="email" value={form.email} onChange={handle} placeholder="email@exemplo.com" required error={errors.email} />
      <Input label={isEdit ? "Nova Senha (opcional)" : "Senha"} name="password" type="password" value={form.password} onChange={handle} placeholder="••••••••" required={!isEdit} error={errors.password} />

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={labelStyle}>Perfil *</label>
        <div style={{ display: "flex", gap: 8 }}>
          {ROLES.map((r) => (
            <button key={r} type="button" onClick={() => setForm((p) => ({ ...p, role: r }))} style={{
              flex: 1, padding: "9px 0", borderRadius: 9, border: "1.5px solid",
              borderColor: form.role === r ? "#1a365d" : "#e2e8f0",
              background: form.role === r ? "#1a365d" : "#f7f9fc",
              color: form.role === r ? "#fff" : "#4a5568",
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
              cursor: "pointer", textTransform: "capitalize",
            }}>{r}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <button type="button" onClick={onCancel} style={btn("#f7f9fc", "#4a5568")}>Cancelar</button>
        <button type="submit" disabled={loading} style={btn("#1a365d", "#fff")}>{loading ? "Salvando..." : "Salvar"}</button>
      </div>
    </form>
  );
};

// ─── Página ────────────────────────────────────────────────────────────────────
const Users = () => {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [modal, setModal]           = useState(null);
  const [selected, setSelected]     = useState(null);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const prevFilters = useRef({ search, roleFilter });

  useEffect(() => {
    let currentPage = page;

    // Se algum filtro mudou, reseta para página 1 sem useEffect separado
    const filtersChanged =
      prevFilters.current.search !== search ||
      prevFilters.current.roleFilter !== roleFilter;

    if (filtersChanged) {
      prevFilters.current = { search, roleFilter };
      currentPage = 1;
      setPage(1);
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/users", {
          params: { name: search || undefined, role: roleFilter || undefined, page: currentPage, limit: 10 },
        });
        if (!cancelled) {
          setUsers(data.users);
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
  }, [search, roleFilter, page]);

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await api.post("/users", form);
      setModal(null);
      setPage(1);
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao criar usuário.");
    } finally { setSaving(false); }
  };

  const handleEdit = async (form) => {
    setSaving(true);
    try {
      await api.put(`/users/${selected.id}`, form);
      setModal(null);
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao atualizar usuário.");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/users/${selected.id}`);
      setModal(null);
      setPage(1);
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao excluir usuário.");
    } finally { setSaving(false); }
  };

  const columns = [
    { key: "name",  label: "Nome" },
    { key: "email", label: "E-mail" },
    {
      key: "role", label: "Perfil",
      render: (val) => {
        const b = ROLE_BADGE[val] ?? { bg: "#edf2f7", color: "#4a5568" };
        return (
          <span style={{ background: b.bg, color: b.color, borderRadius: 20, padding: "3px 11px", fontSize: 12, fontWeight: 700, textTransform: "capitalize" }}>
            {val}
          </span>
        );
      },
    },
    { key: "createdAt", label: "Cadastrado em" },
  ];

  return (
    <div style={pageStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={h1Style}>Usuários</h1>
          <p style={{ margin: 0, color: "#718096", fontSize: 14 }}>Gerencie todos os usuários da plataforma.</p>
        </div>
        <button onClick={() => setModal("create")} style={btn("#1a365d", "#fff")}>+ Novo Usuário</button>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, maxWidth: 340 }}>
          <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome..." icon="🔍" />
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {["", ...ROLES].map((r) => (
            <button key={r} onClick={() => setRoleFilter(r)} style={{
              padding: "8px 14px", borderRadius: 8, border: "1.5px solid",
              borderColor: roleFilter === r ? "#1a365d" : "#e2e8f0",
              background: roleFilter === r ? "#1a365d" : "#f7f9fc",
              color: roleFilter === r ? "#fff" : "#4a5568",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", textTransform: "capitalize",
            }}>
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
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 24 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} style={{ ...btn(p === page ? "#1a365d" : "#f7f9fc", p === page ? "#fff" : "#4a5568"), padding: "6px 14px", minWidth: 36 }}>{p}</button>
          ))}
        </div>
      )}

      <Modal isOpen={modal === "create"} onClose={() => setModal(null)} title="Novo Usuário">
        <UserForm onSubmit={handleCreate} onCancel={() => setModal(null)} loading={saving} />
      </Modal>

      <Modal isOpen={modal === "edit"} onClose={() => setModal(null)} title="Editar Usuário">
        <UserForm
          initial={{ name: selected?.name ?? "", email: selected?.email ?? "", password: "", role: selected?.role ?? "student" }}
          isEdit onSubmit={handleEdit} onCancel={() => setModal(null)} loading={saving}
        />
      </Modal>

      <Modal isOpen={modal === "delete"} onClose={() => setModal(null)} title="Excluir Usuário" size="sm">
        <p style={{ color: "#4a5568", marginTop: 0 }}>
          Tem certeza que deseja excluir <strong>{selected?.name}</strong>?
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={() => setModal(null)} style={btn("#f7f9fc", "#4a5568")}>Cancelar</button>
          <button onClick={handleDelete} disabled={saving} style={btn("#c53030", "#fff")}>{saving ? "Excluindo..." : "Excluir"}</button>
        </div>
      </Modal>
    </div>
  );
};

const pageStyle  = { padding: "32px 40px", fontFamily: "'DM Sans', sans-serif", maxWidth: 1100, margin: "0 auto" };
const h1Style    = { margin: 0, fontSize: 26, fontWeight: 800, color: "#1a365d", letterSpacing: "-0.02em" };
const labelStyle = { fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "#2d3748", letterSpacing: "0.02em", textTransform: "uppercase" };
const btn = (bg, color) => ({ background: bg, color, border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" });

export default Users;