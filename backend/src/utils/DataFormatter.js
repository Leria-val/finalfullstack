const { format } = require("sequelize/lib/utils");

const formatStudentResponse = (student) => {
    const s = student.toJSON ? student.toJSON() : { ...student };
    return {
        id: s.id,
        userId: s.userId,
        name: s.user?.name ?? null,
        email: s.user?.name ?? null,
        enrollment: s.enrollment,
        course: s.course,
        birtDate: s.birtDate ? formatDate(s.birtDate) : null,
        phone: s.phone ?? null,
        createdAt: formatDateTime(s.createdAt),
        updateAt: formatDateTime(s.update),
    };
};

const formatGradeResponse = (grade) => {
    const g = grade.toJSON ? grade.toJSON() : { ...grade };
    const enrollment = g.enrollment ?? {};
    const student = enrollment.student ?? {};
    const klass = enrollment.class ?? {};

    return {
        id: g.id,
        enrollmentId: g.enrollmentId,
        teacherId: g.teacherId,

        student: student.id
          ? {
             id: student.id,
             name: student.user?.name ?? null,
             enrollment: student.enrollment ?? null,
            }
        :   undefined,

        class: klass.id
          ? { id: klass.id, name: klass.name, subject: klass.subject }
          : undefined,

        value: parseFloat(g.value),
        formattedValue: formatGradeValue(g.value),
        status: gradeStatus(g.value),

        period: g.period,
        description: g.description ?? null,
        createdAt: formatDateTime(g.createdAt),
        updatedAt: formatDateTime(g.updateAt),
    };
};

const formatDate = (date) =>
    new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

const formatDateTime = (date) => {
    if (!date) return null;
    return new Date(date). toLocaleDateString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
    });
};

const formatGradeValue = (value) =>
    parseFloat(value). toFixed(2).replace('.', ',');

const gradeStatus = (value) => {
    const v = parseFloat(value);
    if (v >= 7) return 'Aprovado';
    if (v >= 5) return 'Recuperacao';
    return 'Reprovado';
};

module.exports = {
    formatStudentResponse,
    formatGradeResponse,
    formatDate,
    formatDateTime,
    formatGradeValue,
    gradeStatus,
};
