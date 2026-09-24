import { ACADEMIC_YEARS, SECTIONS, isEndAfterStart } from '../utils/format';

export default function ExamForm({ values, errors, onChange, onSubmit, submitLabel, disabled }) {
  return (
    <form className="card form" onSubmit={onSubmit}>
      <label>
        Subject
        <input name="subject" value={values.subject} onChange={onChange} placeholder="Database Management Systems" />
        {errors.subject && <span className="field-error">{errors.subject}</span>}
      </label>
      <div className="form-row">
        <label>
          Academic Year
          <select name="academicYear" value={values.academicYear} onChange={onChange}>
            <option value="">Select year</option>
            {ACADEMIC_YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          {errors.academicYear && <span className="field-error">{errors.academicYear}</span>}
        </label>
        <label>
          Section
          <select name="section" value={values.section} onChange={onChange}>
            <option value="">Select section</option>
            {SECTIONS.map((section) => (
              <option key={section} value={section}>
                {section}
              </option>
            ))}
          </select>
          {errors.section && <span className="field-error">{errors.section}</span>}
        </label>
      </div>
      <label>
        Exam Date
        <input type="date" name="examDate" value={values.examDate} onChange={onChange} />
        {errors.examDate && <span className="field-error">{errors.examDate}</span>}
      </label>
      <div className="form-row">
        <label>
          Start Time
          <input type="time" name="startTime" value={values.startTime} onChange={onChange} />
          {errors.startTime && <span className="field-error">{errors.startTime}</span>}
        </label>
        <label>
          End Time
          <input type="time" name="endTime" value={values.endTime} onChange={onChange} />
          {errors.endTime && <span className="field-error">{errors.endTime}</span>}
        </label>
      </div>
      {errors.time && <p className="field-error">{errors.time}</p>}
      <button type="submit" className="btn btn-primary" disabled={disabled}>
        {submitLabel}
      </button>
    </form>
  );
}

export function validateExamForm(values) {
  const errors = {};
  if (!values.subject?.trim()) errors.subject = 'Subject is required';
  if (!values.academicYear) errors.academicYear = 'Academic year is required';
  if (!values.section) errors.section = 'Section is required';
  if (!values.examDate) errors.examDate = 'Exam date is required';
  if (!values.startTime) errors.startTime = 'Start time is required';
  if (!values.endTime) errors.endTime = 'End time is required';
  if (values.startTime && values.endTime && !isEndAfterStart(values.startTime, values.endTime)) {
    errors.time = 'End time must be later than start time';
  }
  return errors;
}
