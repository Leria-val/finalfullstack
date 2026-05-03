import { useState, useEffect, useRef } from "react";
import Table from "../components/Table.jsx";
import Modal from "../components/Modal.jsx";
import Input from "../components/Input.jsx";
import api from "../services/api.js";

const EMPTY_FORM = { userId: "", enrollment: "", course: "", birthDate: "", phone: "" };

/* ── StudentForm ───────────────────────────────────────────────── */
const StudentForm = ({ initial = EMPTY_FORM, onSubmit, onCancel, loading }) => {
  const [form, setForm]     = useState(initial);
  const [errors, setErrors] = useState({});

  const handle = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

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
    <form onSubmit={submit} className="form-col" noValidate>
      <Input
        label="ID do Usuário" name="userId" value={form.userId}
        onChange={handle} placeholder="UUID do User vinculado"
        required error={errors.userId}
      />
      <Input
        label="Matrícula" name="enrollment" value={form.enrollment}
        onChange={handle} placeholder="Ex: 2024001"
        required error={errors.enrollment}
      />
      <Input
        label="Curso" name="course" value={form.course}
        onChange={handle} placeholder="Ex: Piano, Violão..."
        required error={errors.course}
      />
      <Input
        label="Data de Nascimento" name="birthDate" type="date"
        value={form.birthDate} onChange={handle}
      />
      <Input
        label="Telefone" name="phone" value={form.phone}
        onChange={handle} placeholder="(00) 00000-0000"
      />
      <div className="form-row-actions">
        <button type="button" onClick={onCancel} className="btn btn--secondary">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="btn btn--primary">
          {loading ? "Salvando..." : "Salvar"}
        </button>
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
      alert(err.response?.data?.error || "Erro ao criar aluno.");
    } finally { setSaving(false); }
  };

  const handleEdit = async (form) => {
    setSaving(true);
    try {
      await api.put(`/students/${selected.id}`, form);
      setModal(null);
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao atualizar aluno.");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/students/${selected.id}`);
      setModal(null);
      setPage(1);
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao excluir aluno.");
    } finally { setSaving(false); }
  };

  const columns = [
    { key: "name",       label: "Nome"      },
    { key: "email",      label: "E-mail"    },
    { key: "enrollment", label: "Matrícula" },
    { key: "course",     label: "Curso"     },
    {
      key: "status",
      label: "Status",
      render: () => (
        <span className="status-badge status-badge--active">Ativo</span>
      ),
    },
  ];

  return (
    <div className="page-wrapper">

      {/* ── Top bar ── */}
      <div className="page-topbar">
        <div className="page-header">
          <h1 className="page-title">Alunos</h1>
          <p className="page-subtitle">Gerencie os alunos cadastrados na plataforma.</p>
        </div>
        <button onClick={() => setModal("create")} className="btn btn--primary">
          + Novo Aluno
        </button>
      </div>

      {/* ── Search ── */}
      <div className="page-search">
        <Input
          name="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome..."
          icon="🔍"
        />
      </div>

      {/* ── Table ── */}
      <Table
        columns={columns}
        data={students}
        loading={loading}
        onEdit={(row) => { setSelected(row); setModal("edit"); }}
        onDelete={(row) => { setSelected(row); setModal("delete"); }}
        emptyMessage="Nenhum aluno encontrado."
      />

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`pagination-btn${p === page ? " active" : ""}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* ── Modals ── */}
      <Modal isOpen={modal === "create"} onClose={() => setModal(null)} title="Novo Aluno">
        <StudentForm
          onSubmit={handleCreate}
          onCancel={() => setModal(null)}
          loading={saving}
        />
      </Modal>

      <Modal isOpen={modal === "edit"} onClose={() => setModal(null)} title="Editar Aluno">
        <StudentForm
          initial={{
            userId:     selected?.userId     ?? "",
            enrollment: selected?.enrollment ?? "",
            course:     selected?.course     ?? "",
            birthDate:  selected?.birthDate  ?? "",
            phone:      selected?.phone      ?? "",
          }}
          onSubmit={handleEdit}
          onCancel={() => setModal(null)}
          loading={saving}
        />
      </Modal>

      <Modal isOpen={modal === "delete"} onClose={() => setModal(null)} title="Excluir Aluno" size="sm">
        <p className="delete-confirm-text">
          Tem certeza que deseja excluir <strong>{selected?.name}</strong>?
        </p>
        <div className="form-row-actions">
          <button onClick={() => setModal(null)} className="btn btn--secondary">
            Cancelar
          </button>
          <button onClick={handleDelete} disabled={saving} className="btn btn--danger">
            {saving ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </Modal>

    </div>
  );
};

export default Students;