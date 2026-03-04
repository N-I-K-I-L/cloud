import React from 'react';

export default function DarkTemplate({ data }) {
  return (
    <div className="space-y-8">
      <header className="border-b border-slate-700 pb-5">
        <h1 className="text-4xl font-bold tracking-tight">{data.name}</h1>
        <p className="mt-2 text-slate-300">{data.about}</p>
      </header>
      <section>
        <h2 className="text-xl font-semibold uppercase tracking-wide">Technologies</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(data.technologies || data.skills || []).map((skill, idx) => (
            <span key={idx} className="rounded-full bg-slate-800 px-3 py-1 text-sm">
              {skill}
            </span>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold uppercase tracking-wide">Experience</h2>
        <div className="mt-3 space-y-2">
          {(data.work_experience || []).map((exp, idx) => (
            <p key={idx} className="text-slate-300">{exp.role || exp.description}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
