import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth-context.js';
import Field from '../components/Field.jsx';
import Button from '../components/Button.jsx';
import Modal from '../components/Modal.jsx';
import Notice from '../components/Notice.jsx';
import ThemePicker from '../components/ThemePicker.jsx';
import { faculties } from '../data/faculties.js';
import { validateProfile } from '../profile.js';
import { API_ORIGIN, errorMessage } from '../api.js';
export default function ProfilePage() {
  const { user, profile, saveProfile } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState(() => {
    return profile || { first_name: user.first_name || '', last_name: user.last_name || '', role: '', faculty: '', group: '' };
  });
  const [errors, setErrors] = useState({});
  const [popup, setPopup] = useState(null);
  const [busy, setBusy] = useState(false);
  const focusAfterClose = useRef(null);
  function change(event) {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  }
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const cleaned = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim().normalize('NFC')]));
    const next = validateProfile(cleaned);
    setErrors(next);
    if (Object.keys(next).length) {
      setPopup({ title: 'Перевірте дані профілю', messages: [...new Set(Object.values(next))], field: Object.keys(next)[0] });
      return;
    }
    setBusy(true);
    try { await saveProfile(cleaned); navigate('/', { replace: true }); }
    catch (error) { setPopup({ title: 'Профіль не збережено', messages: [errorMessage(error)], sessionExpired: error.status === 401 }); }
    finally { setBusy(false); }
  }
  function close() {
    focusAfterClose.current = popup?.field;
    setPopup(null);
  }
  return <>
    <div className="max-w-3xl">
      <p className="mb-3 text-xs font-semibold tracking-widest text-slate-500 uppercase">Особистий кабінет</p>
      <h1 className="text-3xl font-bold">{profile ? 'Ваш профіль' : 'Завершіть реєстрацію'}</h1>
      <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">Перевірте ім’я та прізвище з Microsoft і заповніть дані для навчального простору.</p>
      {!profile && <div className="mt-4"><Notice title="Завершіть налаштування">Після збереження профілю стануть доступні каталог і збережені матеріали.</Notice></div>}
      <form onSubmit={submit} noValidate className="mt-8 space-y-6 rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <fieldset disabled={busy} className="space-y-6 disabled:opacity-70">
          <legend className="sr-only">Дані профілю</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Ім’я" name="first_name" autoComplete="given-name" required maxLength={80} value={values.first_name} onChange={change} error={errors.first_name} />
            <Field label="Прізвище" name="last_name" autoComplete="family-name" required maxLength={80} value={values.last_name} onChange={change} error={errors.last_name} />
          </div>
          <Field label="Ви студент чи викладач?" name="role" required value={values.role} onChange={change} error={errors.role}><option value="">Оберіть статус</option><option value="student">Студент</option><option value="teacher">Викладач</option></Field>
          <Field label="Факультет" name="faculty" required value={values.faculty} onChange={change} error={errors.faculty}><option value="">Оберіть факультет</option>{faculties.map((faculty) => <option key={faculty}>{faculty}</option>)}</Field>
          <Field label={values.role === 'teacher' ? 'Група (необов’язково)' : 'Група'} name="group" autoComplete="off" required={values.role === 'student'} maxLength={32} placeholder="Наприклад, ПМА-32" value={values.group} onChange={change} error={errors.group} />
          <Notice title="Про статус у профілі">Вибір статусу не надає прав на редагування матеріалів або адміністрування.</Notice>
        </fieldset>
        <div className="flex flex-wrap items-center gap-3"><Button type="submit" busy={busy}>Зберегти профіль</Button>{profile && !busy && <Button to="/" variant="secondary">Скасувати</Button>}</div>
      </form>
      <ThemePicker />
    </div>
    <Modal open={Boolean(popup)} title={popup?.title || ''} onClose={close} onClosed={() => {
      if (focusAfterClose.current) document.getElementsByName(focusAfterClose.current)[0]?.focus();
      focusAfterClose.current = null;
    }}>
      <ul className="list-disc space-y-2 pl-5">{popup?.messages.map((message) => <li key={message}>{message}</li>)}</ul>
      {popup?.sessionExpired && <Button href={API_ORIGIN + '/auth/login'} className="mt-4">Увійти знову</Button>}
    </Modal>
  </>;
}
