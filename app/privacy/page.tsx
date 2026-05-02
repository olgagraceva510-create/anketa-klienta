import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Политика обработки персональных данных",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-[var(--fg)]">
        Политика обработки персональных данных
      </h1>
      <div className="mt-10 max-w-none space-y-10">
        <p className="text-base leading-relaxed text-[var(--fg)]">
          Настоящая политика описывает, какие персональные данные собираются при
          отправке заявки через форму на сайте и как они используются.
        </p>
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-[var(--fg)]">
            Какие данные собираются
          </h2>
          <p className="leading-relaxed">
            При заполнении анкеты вы можете указать: имя и фамилию, номер
            телефона, адрес электронной почты, а также сведения о проекте —
            краткое описание задачи, техническое задание или пожелания, ссылки
            на примеры сайтов и другую информацию, которую вы добровольно
            вносите в поля формы.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-[var(--fg)]">
            Цель обработки
          </h2>
          <p className="leading-relaxed">
            Указанные данные используются исключительно для рассмотрения вашей
            заявки, связи с вами по вопросам разработки сайта и подготовки
            предложения. Данные не публикуются в открытом доступе и не
            передаются третьим лицам, за исключением случаев, когда это
            требуется по закону.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-[var(--fg)]">
            Удаление данных
          </h2>
          <p className="leading-relaxed">
            Вы можете запросить удаление своих персональных данных, направив
            обращение на контактные реквизиты, указанные при обсуждении заявки
            (например, по email), с указанием данных, которые необходимо удалить.
          </p>
        </section>
      </div>
      <p className="mt-12">
        <Link
          href="/"
          className="text-sm font-medium text-[var(--fg)] underline underline-offset-4 hover:text-[var(--muted)]"
        >
          Вернуться на главную
        </Link>
      </p>
    </div>
  );
}
