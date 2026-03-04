import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <section className="grid gap-8 md:grid-cols-2 md:items-center">
        <div>
          <h1 className="text-5xl font-bold leading-tight">Turn Your Resume Into a Live Portfolio</h1>
          <p className="mt-4 text-lg text-slate-700">
            Upload your PDF resume, extract key developer details, pick a template, and publish a personal portfolio.
          </p>
          <div className="mt-6 flex gap-3">
            <Link to="/register"><button>Get Started</button></Link>
            <Link to="/login"><button className="!bg-accent">Login</button></Link>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <h3 className="text-xl font-semibold">Example Portfolio Preview</h3>
          <p className="mt-3 text-slate-700"><strong>Name:</strong> John Doe</p>
          <p className="text-slate-700"><strong>Skills:</strong> Python, React, Docker</p>
          <p className="text-slate-700"><strong>Project:</strong> AI Chatbot with NLP</p>
        </div>
      </section>
    </main>
  );
}
