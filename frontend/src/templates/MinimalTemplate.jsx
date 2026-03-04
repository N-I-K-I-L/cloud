import React from 'react';

export default function MinimalTemplate({ data }) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-bold">{data.name}</h1>
        <p className="mt-2 text-lg text-slate-600">{data.about}</p>
      </header>
      <section>
        <h2 className="text-2xl font-semibold">Skills</h2>
        <p className="mt-2">{(data.skills || []).join(', ')}</p>
      </section>
      <section>
        <h2 className="text-2xl font-semibold">Projects</h2>
        <div className="space-y-3 mt-2">
          {(data.projects || []).map((project, idx) => (
            <div key={idx}>
              <h3 className="font-semibold">{project.title}</h3>
              <p className="text-slate-700">{project.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
