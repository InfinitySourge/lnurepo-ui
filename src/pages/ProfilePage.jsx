import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/useI18n.js';
import { facultyLabel } from '../i18n/faculties.js';
import { useAuth } from '../auth-context.js';
import Field from '../components/Field.jsx';
import Button from '../components/Button.jsx';
import Modal from '../components/Modal.jsx';
import Notice from '../components/Notice.jsx';
import ThemePicker from '../components/ThemePicker.jsx';
import LanguagePicker from '../components/LanguagePicker.jsx';
import SupportCard from '../components/SupportCard.jsx';
import { initialProfile, validateProfile } from '../profile.js';
import { API_ORIGIN, errorMessage } from '../api.js';

export default function ProfilePage() {
  const { t, language } = useI18n();
  const { user, profile, saveProfile, profileDraft, setProfileDraft } = useAuth();
  const navigate = useNavigate();
  const values = { ...initialProfile(user, profile), group: profileDraft ?? profile?.group ?? '' };
  const [errors, setErrors] = useState({});
  const [popup, setPopup] = useState(null);
  const [busy, setBusy] = useState(false);
  const focusAfterClose = useRef(null);
  const missingFields = Object.keys(validateProfile(values)).filter((key) => key !== 'group');
  const metadataMissing = missingFields.length > 0;
  const missingLabels = missingFields.map((key) => t({ first_name: 'profile.firstName', last_name: 'profile.lastName', role: 'common.status', faculty: 'common.faculty' }[key])).join(', ');
  function change(event) {
    const group = event.target.value;
    setProfileDraft(group);
    setErrors({});
  }
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const cleaned = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim().normalize('NFC')]));
    const next = validateProfile(cleaned);
    setErrors(next);
    if (Object.keys(next).length) {
      setPopup({ title: 'profile.check', messages: metadataMissing ? ['profile.accountMissing'] : ['validation.group'], field: 'group' });
      return;
    }
    setBusy(true);
    try { await saveProfile(cleaned); navigate('/', { replace: true }); }
    catch (error) {
      if (error.fields?.includes('group')) setErrors({ group: 'validation.group' });
      const accountIssue = error.fields?.some((field) => ['first_name', 'last_name', 'role', 'faculty'].includes(field));
      setPopup({ title: 'profile.saveFailed', error: accountIssue ? null : error, messages: accountIssue ? ['profile.accountMissing'] : [], accountIssue, field: error.fields?.includes('group') ? 'group' : undefined, sessionExpired: error.status === 401 });
    }
    finally { setBusy(false); }
  }
  function close() {
    focusAfterClose.current = popup?.field;
    setPopup(null);
  }
  return <>
    <div className="max-w-3xl">
      <p className="mb-3 text-xs font-semibold tracking-widest text-slate-500 uppercase">{t('profile.eyebrow')}</p>
      <h1 className="text-2xl font-bold sm:text-3xl">{profile ? t('profile.title') : t('profile.setupTitle')}</h1>
      <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{t('profile.description')}</p>
      <dl className="mt-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-4 text-sm min-[360px]:grid-cols-2 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div><dt className="text-slate-500 dark:text-slate-400">{t('profile.firstName')}</dt><dd className="mt-1 font-medium wrap-anywhere">{values.first_name || t('common.notFilled')}</dd></div>
        <div><dt className="text-slate-500 dark:text-slate-400">{t('profile.lastName')}</dt><dd className="mt-1 font-medium wrap-anywhere">{values.last_name || t('common.notFilled')}</dd></div>
        <div><dt className="text-slate-500 dark:text-slate-400">{t('common.faculty')}</dt><dd className="mt-1 font-medium wrap-anywhere">{values.faculty ? facultyLabel(values.faculty, language) : t('common.notFilled')}</dd></div>
        <div><dt className="text-slate-500 dark:text-slate-400">{t('common.status')}</dt><dd className="mt-1 font-medium">{values.role ? t('common.' + values.role) : t('common.notFilled')}</dd></div>
      </dl>
      {metadataMissing && <div className="mt-4 space-y-3"><Notice variant="error" title={t('profile.accountMissingTitle')}>{t('profile.accountMissing')}</Notice><Button href={API_ORIGIN + '/auth/login'} variant="secondary">{t('common.loginAgain')}</Button><SupportCard titleKey="profile.accountSupportTitle" descriptionKey="profile.accountSupportDescription" bodyKey="support.accountBody" values={{ missing: missingLabels }} /></div>}
      <form onSubmit={submit} noValidate className="mt-4 space-y-5 rounded-xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <fieldset disabled={busy || metadataMissing}>
          <legend className="sr-only">{t('profile.legend')}</legend>
          <Field label={values.role === 'teacher' ? t('profile.optionalGroup') : t('common.group')} name="group" autoComplete="off" required={values.role === 'student'} maxLength={32} placeholder={t('profile.groupExample')} value={values.group} onChange={change} error={errors.group && t(errors.group)} />
        </fieldset>
        <div className="flex flex-wrap items-center gap-3"><Button type="submit" busy={busy} disabled={metadataMissing} className="w-full sm:w-auto">{t('profile.save')}</Button>{profile && !busy && <Button to="/" onClick={() => setProfileDraft(null)} variant="secondary" className="w-full sm:w-auto">{t('common.cancel')}</Button>}</div>
      </form>
      <ThemePicker />
      <section aria-label={t('language.label')} className="mt-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900"><LanguagePicker /></section>
    </div>
    <Modal open={Boolean(popup)} title={popup ? t(popup.title) : ''} onClose={close} onClosed={() => {
      if (focusAfterClose.current) document.getElementsByName(focusAfterClose.current)[0]?.focus();
      focusAfterClose.current = null;
    }}>
      <ul className="list-disc space-y-2 pl-5">{popup?.error ? <li>{errorMessage(popup.error)}</li> : popup?.messages.map((message) => <li key={message}>{t(message)}</li>)}</ul>
      {(popup?.sessionExpired || popup?.accountIssue) && <Button href={API_ORIGIN + '/auth/login'} className="mt-4">{t('common.loginAgain')}</Button>}
      {popup?.accountIssue && <a href="mailto:support@lnurepo.info" className="mt-3 block py-2 text-blue-700 underline dark:text-blue-300">support@lnurepo.info</a>}
    </Modal>
  </>;
}
