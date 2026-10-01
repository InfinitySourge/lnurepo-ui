import Brand from '../components/Brand.jsx';
import Button from '../components/Button.jsx';
const errors = {
  404: ['Сторінку не знайдено', 'Можливо, адресу змінено або посилання застаріло.'],
  403: ['Доступ обмежено', 'У вас немає доступу до цієї сторінки.'],
  503: ['Сервер тимчасово недоступний', 'Не вдалося перевірити сесію. Спробуйте ще раз за мить.'],
  500: ['Щось пішло не так', 'Не вдалося відкрити сторінку. Спробуйте оновити її.'],
};
export default function ErrorPage({ code = 404, retry }) {
  const [title, description] = errors[code] || errors[500];
  return <main className="flex min-h-screen flex-col p-7 sm:p-10">
    <Brand /><section className="m-auto w-full max-w-lg py-16">
      <p className="text-6xl font-bold tracking-tight text-blue-800 dark:text-blue-300">{code}</p>
      <h1 className="mt-5 text-2xl font-bold">{title}</h1>
      <p className="mt-4 text-sm leading-7 text-slate-500 dark:text-slate-400">{description}</p>
      <div className="mt-8 flex flex-wrap gap-3"><Button to="/">На головну</Button>{retry && <Button variant="secondary" onClick={retry}>Спробувати знову</Button>}</div>
    </section>
  </main>;
}
