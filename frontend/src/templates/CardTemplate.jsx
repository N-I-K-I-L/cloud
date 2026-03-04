import React from 'react';

export default function CardTemplate({ data }) {
  return (
    <div className="space-y-8">
      <header className="rounded-2xl bg-white/90 p-6 shadow-md">
        <h1 className="text-4xl font-bold text-primary">{data.name}</h1>
        <p className="mt-2 text-slate-700">{data.about}</p>
      </header>
      <section className="grid gap-4 md:grid-cols-2">
        {(data.projects || []).map((project, idx) => (
          <article key={idx} className="rounded-xl bg-white p-5 shadow">
            <h3 className="text-xl font-semibold">{project.title}</h3>
            <p className="mt-2 text-slate-600">{project.description}</p>
          </article>
        ))}
      </section>
      <section className="rounded-2xl bg-white p-5 shadow">
        <h2 className="text-2xl font-semibold">Education</h2>
        <ul className="mt-3 space-y-2">
          {(data.education || []).map((item, idx) => (
            <li key={idx}>{item.degree} {item.institution ? `- ${item.institution}` : ''}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
