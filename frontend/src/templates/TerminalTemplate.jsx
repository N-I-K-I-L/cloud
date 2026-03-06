import React, { useEffect, useState } from 'react';

export default function TerminalTemplate({ data }) {
  const [typedLines, setTypedLines] = useState([]);
  const [isTyping, setIsTyping] = useState(true);

  const name = data.name || 'GUEST USER';
  const role = data.about?.split('.')[0] || 'SYSTEM OPERATOR';
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const tech = Array.isArray(data.technologies) ? data.technologies : [];
  const allSkills = [...new Set([...skills, ...tech])].map((s) => String(s).trim()).filter(Boolean);
  const projects = Array.isArray(data.projects) ? data.projects : [];
  const experience = Array.isArray(data.work_experience) ? data.work_experience : [];

  const bootSequence = [
    `Initializing system for ${name}...`,
    'Loading modules...',
    'Mounting resources...',
    '[OK] Network interface active',
    '[OK] User authenticated',
    `Welcome, ${role}.`,
  ];

  useEffect(() => {
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < bootSequence.length) {
        setTypedLines((prev) => [...prev, bootSequence[currentLine]]);
        currentLine += 1;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 160);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-full bg-black text-green-500 font-mono p-4 sm:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="border-b border-green-500/30 pb-4">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-2">
            ~/{name.toLowerCase().replace(/\s+/g, '_')}
          </h1>
          <p className="text-green-400/70 text-sm">OS: Portfolio v2.0</p>
        </header>

        <section className="space-y-1 opacity-80 text-sm">
          {typedLines.map((line, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-green-700">[{new Date().toISOString().split('T')[1].slice(0, 8)}]</span>
              <span>{line}</span>
            </div>
          ))}
          {isTyping && <span className="inline-block w-2 h-4 bg-green-500 animate-pulse ml-2" />}
        </section>

        {!isTyping && (
          <div className="space-y-8">
            <section>
              <div className="text-green-400 mb-2">$ cat about.txt</div>
              <div className="pl-4 border-l-2 border-green-900 text-green-300">
                {data.about || 'No description found.'}
              </div>
            </section>

            <section>
              <div className="text-green-400 mb-2">$ ls /skills</div>
              <div className="pl-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-green-300">
                {allSkills.length > 0 ? allSkills.map((skill, i) => <div key={i}>- {skill}</div>) : <p className="text-green-700">Empty</p>}
              </div>
            </section>

            <section>
              <div className="text-green-400 mb-2">$ ./run_projects.sh</div>
              <div className="pl-4 space-y-4">
                {projects.length > 0 ? projects.map((p, i) => {
                  const title = typeof p === 'string' ? p.split(':')[0] : (p.title || 'Untitled');
                  const desc = typeof p === 'string' ? p.split(':').slice(1).join(':') : (p.description || '');
                  return (
                    <div key={i} className="border border-green-900 bg-green-950/20 p-4">
                      <h3 className="text-lg font-bold text-green-400">[{title}]</h3>
                      <p className="text-green-500/80 text-sm">{desc}</p>
                    </div>
                  );
                }) : <p className="text-green-700">No projects found.</p>}
              </div>
            </section>

            <section>
              <div className="text-green-400 mb-2">$ tail -f /var/log/experience.log</div>
              <div className="pl-4 space-y-2 text-sm">
                {experience.length > 0 ? experience.map((exp, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-green-700 shrink-0">ENTRY {String(i + 1).padStart(3, '0')}:</span>
                    <span className="text-green-300">{typeof exp === 'string' ? exp : (exp.role || exp.description)}</span>
                  </div>
                )) : <p className="text-green-700">No logs.</p>}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
