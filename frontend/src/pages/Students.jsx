import { useState, useEffect, useRef } from "react";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import api from "../../services/api";

const EMPTY_FORM = { userId: "", enrollment: "", course: "", birthDate: "", phone: "" };

// ─── Formulário ────────────────────────────────────────────────────────────────
const StudentForm = ({ initial = EMPTY_FORM, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.enrollment.trim()) errs.enrollment = "Matrícula obrigatória.";
    if (!form.course.trim())     errs.course     = "Curso obrigatório.";
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
      <Input label="ID do Usuário"      name="userId"     value={form.userId}     onChange={handle} placeholder="UUID do User vinculado" required error={errors.userId} />
      <Input label="Matrícula"          name="enrollment" value={form.enrollment} onChange={handle} placeholder="Ex: 2024001" required error={errors.enrollment} />
      <Input label="Curso"              name="course"     value={form.course}     onChange={handle} placeholder="Ex: Piano, Violão..." required error={errors.course} />
      <Input label="Data de Nascimento" name="birthDate"  type="date" value={form.birthDate} onChange={handle} />
      <Input label="Telefone"           name="phone"      value={form.phone}      onChange={handle} placeholder="(00) 00000-0000" />
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <button type="button" onClick={onCancel} style={btn("#f7f9fc", "#4a5568")}>Cancelar</button>
        <button type="submit" disabled={loading}  style={btn("#1a365d", "#fff")}>{loading ? "Salvando..." : "Salvar"}</button>
      </div>
    </form>
  );
};

// ─── Página ────────────────────────────────────────────────────────────────────
const Students = () => {
  const [students, setStudents]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [search, setSearch]         = useState("");
  const [modal, setModal]           = useState(null);
  const [selected, setSelected]     = useState(null);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Ref para saber se o search mudou e resetar page
  const prevSearch = useRef(search);

  useEffect(() => {
    let currentPage = page;

    // Se o search mudou, busca na página 1 sem chamar setPage separadamente
    if (prevSearch.current !== search) {
      prevSearch.current = search;
      currentPage = 1;
      setPage(1);
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/students", {
          params: { name: search || undefined, page: currentPage, limit: 10 },
        });
        if (!cancelled) {
          setStudents(data.students);
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

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await api.post("/students", form);
      setModal(null);
      setPage(1);
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao criar aluno.");
    } finally { setSaving(false); }
  };

  const handleEdit = async (form) => {
    setSaving(true);
    try {
      await api.put(`/students/${selected.id}`, form);
      setModal(null);
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao atualizar aluno.");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/students/${selected.id}`);
      setModal(null);
      setPage(1);
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao excluir aluno.");
    } finally { setSaving(false); }
  };

  const columns = [
    { key: "name",       label: "Nome" },
    { key: "email",      label: "E-mail" },
    { key: "enrollment", label: "Matrícula" },
    { key: "course",     label: "Curso" },
    {
      key: "status", label: "Status",
      render: () => (
        <span style={{ background: "#c6f6d5", color: "#276749", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>
          Ativo
        </span>
      ),
    },
  ];

  return (
    <div style={pageStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={h1Style}>Alunos</h1>
          <p style={{ margin: 0, color: "#718096", fontSize: 14 }}>Gerencie os alunos cadastrados na plataforma.</p>
        </div>
        <button onClick={() => setModal("create")} style={btn("#1a365d", "#fff")}>+ Novo Aluno</button>
      </div>

      <div style={{ marginBottom: 20, maxWidth: 340 }}>
        <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome..." icon="🔍" />
      </div>

      <Table
        columns={columns} data={students} loading={loading}
        onEdit={(row) => { setSelected(row); setModal("edit"); }}
        onDelete={(row) => { setSelected(row); setModal("delete"); }}
        emptyMessage="Nenhum aluno encontrado."
      />

      {totalPages > 1 && (
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 24 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} style={{ ...btn(p === page ? "#1a365d" : "#f7f9fc", p === page ? "#fff" : "#4a5568"), padding: "6px 14px", minWidth: 36 }}>{p}</button>
          ))}
        </div>
      )}

      <Modal isOpen={modal === "create"} onClose={() => setModal(null)} title="Novo Aluno">
        <StudentForm onSubmit={handleCreate} onCancel={() => setModal(null)} loading={saving} />
      </Modal>

      <Modal isOpen={modal === "edit"} onClose={() => setModal(null)} title="Editar Aluno">
        <StudentForm
          initial={{ enrollment: selected?.enrollment ?? "", course: selected?.course ?? "", birthDate: selected?.birthDate ?? "", phone: selected?.phone ?? "", userId: selected?.userId ?? "" }}
          onSubmit={handleEdit} onCancel={() => setModal(null)} loading={saving}
        />
      </Modal>

      <Modal isOpen={modal === "delete"} onClose={() => setModal(null)} title="Excluir Aluno" size="sm">
        <p style={{ color: "#4a5568", marginTop: 0 }}>
          Tem certeza que deseja excluir <strong>{selected?.name}</strong>? Esta ação não pode ser desfeita.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={() => setModal(null)} style={btn("#f7f9fc", "#4a5568")}>Cancelar</button>
          <button onClick={handleDelete} disabled={saving} style={btn("#c53030", "#fff")}>{saving ? "Excluindo..." : "Excluir"}</button>
        </div>
      </Modal>
    </div>
  );
};

const pageStyle = { padding: "32px 40px", fontFamily: "'DM Sans', sans-serif", maxWidth: 1100, margin: "0 auto" };
const h1Style   = { margin: 0, fontSize: 26, fontWeight: 800, color: "#1a365d", letterSpacing: "-0.02em" };
const btn = (bg, color) => ({ background: bg, color, border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" });

export default Students;