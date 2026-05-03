export const formatDate = (date) => 
  date ? new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : null;

export const formatDateTime = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
};

export const formatGradeValue = (value) => 
  value !== undefined ? parseFloat(value).toFixed(2).replace('.', ',') : "0,00";

export const gradeStatus = (value) => {
  const v = parseFloat(value);
  if (v >= 7) return 'APROVADO';
  if (v >= 5) return 'RECUPERACAO';
  return 'REPROVADO';
};



export const formatStudentResponse = (student) => {
  // O Sequelize usa objetos complexos, o toJSON() limpa para um objeto JS simples
  const s = student.toJSON ? student.toJSON() : { ...student };
  
  return {
    id: s.id,
    user_id: s.user_id,
    name: s.authInfo?.name ?? null, 
    email: s.authInfo?.email ?? null,
    registration_number: s.registration_number,
    instrument: s.instrument ?? "Não definido",
    musical_level: s.musical_level ?? "Iniciante",
    phone: s.phone ?? null,
    birth_date: formatDate(s.birth_date),
    status: s.status,
    created_at: formatDateTime(s.created_at),
    updated_at: formatDateTime(s.updated_at),
  };
};

export const formatGradeResponse = (grade) => {
  const g = grade.toJSON ? grade.toJSON() : { ...grade };
  
  return {
    id: g.id,
    value: parseFloat(g.value),
    formatted_value: formatGradeValue(g.value),
    status: gradeStatus(g.value),
    student: g.enrollment?.student?.authInfo?.name ?? "N/A",
    class: g.enrollment?.class?.name ?? "N/A",
    created_at: formatDateTime(g.created_at)
  };
};