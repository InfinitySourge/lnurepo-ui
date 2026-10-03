import { useAuth } from '../auth-context.js';
export default function SupportCard() {
  const { user, profile } = useAuth();
  const name = profile ? `${profile.first_name} ${profile.last_name}` : user?.name || '';
  const body = `Вітаю!\n\nІм’я: ${name}\nОбліковий запис: ${user?.email || ''}\n\nОпис питання:\n\nКроки відтворення (якщо є помилка):\n`;
  const href = `mailto:support@lnurepo.info?${new URLSearchParams({subject:'LNUrepo — звернення до підтримки',body}).toString().replaceAll('+','%20')}`;
  return <section className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/40"><h2 className="text-xl font-semibold">Не знайшли відповіді?</h2><p className="mt-3 text-sm leading-6">Напишіть команді LNUrepo. Відкриється ваш поштовий клієнт із чернеткою звернення та даними профілю — нічого не надсилається автоматично.</p><a className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white" href={href}>Написати підтримці</a><p className="mt-3 text-xs text-slate-500 dark:text-slate-400">support@lnurepo.info · Не додавайте паролі, токени або конфіденційні файли.</p></section>;
}
