import { useState, useEffect, useRef } from "react";
import Table from "../components/Table.jsx";
import Modal from "../components/Modal.jsx";
import Input from "../components/Input.jsx";
import api from "../services/api.js";

const EMPTY_FORM = { name: "", subject: "", teacherId: "" };

const ClassForm = ({ initial = EMPTY_FORM, teachers, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim())    errs.name    = "Nome obrigatório.";
    if (!form.subject.trim()) errs.subject = "Matéria obrigatória.";
    if (!form.teacherId)      errs.teacherId = "Selecione um professor.";
    return errs;
  };

  const submit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    onSubmit(form);
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Input label="Nome da Turma" name="name"    value={form.name}    onChange={handle} placeholder="Ex: Turma A — Piano" required error={errors.name} />
      <Input label="Matéria"       name="subject" value={form.subject} onChange={handle} placeholder="Ex: Piano, Violão, Teoria Musical..." required error={errors.subject} />

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={labelStyle}>Professor *</label>
        <select
          value={form.teacherId}
          onChange={(e) => setForm((p) => ({ ...p, teacherId: e.target.value }))}
          style={selStyle(errors.teacherId)}
        >
          <option value="">Selecione um professor...</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        {errors.teacherId && <span style={errStyle}>{errors.teacherId}</span>}
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <button type="button" onClick={onCancel} style={btn("#f7f9fc", "#4a5568")}>Cancelar</button>
        <button type="submit" disabled={loading} style={btn("#1a365d", "#fff")}>{loading ? "Salvando..." : "Salvar"}</button>
      </div>
    </form>
  );
};

const Classes = () => {
  const [classes, setClasses]   = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [search, setSearch]     = useState("");
  const [modal, setModal]       = useState(null);
  const [selected, setSelected] = useState(null);
  const [page, setPage]         = useState(1);
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
    } catch (err) {
      console.error(err);
    }
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
      key: "enrollmentCount", label: "Alunos",
      render: (val) => (
        <span style={{ background: "#bee3f8", color: "#1a365d", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>
          {val ?? 0}
        </span>
      ),
    },
    { key: "createdAt", label: "Criada em" },
  ];

  return (
    <div style={pageStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={h1Style}>Turmas</h1>
          <p style={{ margin: 0, color: "#718096", fontSize: 14 }}>Gerencie as turmas da plataforma.</p>
        </div>
        <button onClick={openCreate} style={btn("#1a365d", "#fff")}>+ Nova Turma</button>
      </div>

      <div style={{ marginBottom: 20, maxWidth: 340 }}>
        <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome..." icon="🔍" />
      </div>

      <Table
        columns={columns} data={classes} loading={loading}
        onEdit={openEdit}
        onDelete={(row) => { setSelected(row); setModal("delete"); }}
        emptyMessage="Nenhuma turma encontrada."
      />

      {totalPages > 1 && (
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 24 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} style={{ ...btn(p === page ? "#1a365d" : "#f7f9fc", p === page ? "#fff" : "#4a5568"), padding: "6px 14px", minWidth: 36 }}>{p}</button>
          ))}
        </div>
      )}

      <Modal isOpen={modal === "create"} onClose={() => setModal(null)} title="Nova Turma">
        <ClassForm teachers={teachers} onSubmit={handleCreate} onCancel={() => setModal(null)} loading={saving} />
      </Modal>

      <Modal isOpen={modal === "edit"} onClose={() => setModal(null)} title="Editar Turma">
        <ClassForm
          initial={{ name: selected?.name ?? "", subject: selected?.subject ?? "", teacherId: selected?.teacherId ?? "" }}
          teachers={teachers}
          onSubmit={handleEdit}
          onCancel={() => setModal(null)}
          loading={saving}
        />
      </Modal>

      <Modal isOpen={modal === "delete"} onClose={() => setModal(null)} title="Excluir Turma" size="sm">
        <p style={{ color: "#4a5568", marginTop: 0 }}>
          Tem certeza que deseja excluir a turma <strong>{selected?.name}</strong>?
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={() => setModal(null)} style={btn("#f7f9fc", "#4a5568")}>Cancelar</button>
          <button onClick={handleDelete} disabled={saving} style={btn("#c53030", "#fff")}>{saving ? "Excluindo..." : "Excluir"}</button>
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

export default Classes;