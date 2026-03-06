import React from 'react';

export function RoboticTemplate({ data }) {
  const name = data.name || 'CYBER_ENTITY';
  const role = data.about?.split('.')[0] || 'NEURAL_ARCHITECT';
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const tech = Array.isArray(data.technologies) ? data.technologies : [];
  const allSkills = [...new Set([...skills, ...tech])].map((s) => String(s).trim()).filter(Boolean);
  const projects = Array.isArray(data.projects) ? data.projects : [];
  const experience = Array.isArray(data.work_experience) ? data.work_experience : [];

  return (
    <div className="min-h-full bg-slate-950 text-cyan-50 p-4 sm:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="border-b-2 border-cyan-500/50 pb-6">
          <p className="font-mono text-xs tracking-[0.2em] text-cyan-400 mb-2">SYSTEM_ONLINE</p>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight uppercase">{name}</h1>
          <p className="text-cyan-400 font-mono tracking-widest text-sm mt-3">// {role}</p>
        </header>

        <section className="bg-slate-900/50 border border-cyan-900/50 p-6 rounded-br-3xl">
          <h2 className="text-cyan-400 font-mono text-sm mb-3">CORE_DIRECTIVE</h2>
          <p className="text-cyan-100/80 leading-relaxed">{data.about || 'Awaiting programming...'}</p>
        </section>

        <div className="grid md:grid-cols-12 gap-8">
          <div className="md:col-span-8 space-y-8">
            <section className="bg-slate-900/40 border border-slate-800 p-6">
              <h2 className="text-xl font-mono font-bold text-cyan-400 mb-5">&gt; EXECUTION_LOG</h2>
              <div className="space-y-5">
                {experience.length > 0 ? experience.map((exp, i) => {
                  const title = typeof exp === 'string' ? exp : (exp.role || exp.description);
                  return (
                    <div key={i}>
                      <h3 className="text-lg font-bold text-cyan-50">{title}</h3>
                      <p className="text-cyan-600/60 font-mono text-sm">Cycle 0{i + 1}</p>
                    </div>
                  );
                }) : <p className="text-cyan-700 font-mono">No data found.</p>}
              </div>
            </section>

            <section className="bg-slate-900/40 border border-slate-800 p-6">
              <h2 className="text-xl font-mono font-bold text-fuchsia-400 mb-5">&gt; CONSTRUCTS_DEPLOYED</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {projects.length > 0 ? projects.map((p, i) => {
                  const title = typeof p === 'string' ? p.split(':')[0] : (p.title || 'Untitled');
                  const desc = typeof p === 'string' ? p.split(':').slice(1).join(':') : (p.description || '');
                  return (
                    <div key={i} className="bg-slate-950 border border-fuchsia-900/30 p-4">
                      <h3 className="text-fuchsia-300 font-bold mb-1">{title}</h3>
                      <p className="text-cyan-100/60 text-sm">{desc}</p>
                    </div>
                  );
                }) : <p className="text-fuchsia-700 font-mono">No projects detected.</p>}
              </div>
            </section>
          </div>

          <div className="md:col-span-4 space-y-8">
            <section className="bg-slate-900/40 border border-slate-800 p-6">
              <h2 className="text-sm font-mono font-bold text-cyan-500 mb-4">// Hardware_Specs</h2>
              <div className="flex flex-wrap gap-2">
                {allSkills.map((skill, i) => (
                  <div key={i} className="bg-cyan-950/40 border border-cyan-800/50 text-cyan-200 text-xs px-3 py-1.5">
                    {skill}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
