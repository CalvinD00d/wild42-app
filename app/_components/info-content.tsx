"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import type { NavItem } from "./portfolio-types";

const certifications = [
  ["Google UX Design Certification", "02/22/2025", "gUX1"],
  ["Build Dynamic User Interfaces (UI) for Websites", "02/21/2025", "gUX2"],
  ["Create High-Fidelity Designs and Prototypes in Figma", "12/01/2022", "gUX3"],
  ["Conduct UX Research and Test Early Concepts", "11/10/2022", "gUX4"],
  ["Build Wireframes and Low-Fidelity Prototypes", "11/05/2022", "gUX5"],
  ["Start the UX Design Process: Empathize, Define, and Ideate", "11/03/2022", "gUX6"],
  ["Foundations of User Experience (UX) Design", "11/03/2022", "gUX7"],
] as const;

const skillItems = [
  ["UX & Interaction Design", "User journeys, information architecture, task flows, wireframes, interactive prototypes, design systems, UI architecture, responsive patterns"],
  ["Prototyping & Tools", "Figma (components/variants, Auto Layout, interactive prototypes), Adobe XD, Adobe CC (Photoshop/Illustrator/InDesign)"],
  ["Accessibility", "WCAG 2.x/Section 508 alignment, semantic structure, keyboard navigation, focus management, color/contrast"],
  ["Research & Testing", "Usability test planning, testable prototypes, moderated feedback loops, iteration cycles"],
  ["Client Collaboration and Facilitation", "Client-facing design facilitation, discovery workshops, cross-functional collaboration, stakeholder alignment, requirements capture, backlog refinement"],
  ["Technical Fluency (enables better handoff)", "React, JavaScript (ES6+), HTML5, CSS3, REST APIs, Axios, Node.js/Express (basic), Supabase (PostgreSQL)"],
] as const;

const experience = [
  { company: "AMD", position: "UX/UI Engineer (contract)", date: "October 2025 – February 2026", bullets: [
    "Designed a user interface for highly complex internal software used for mixed-workload server, chip, and processor testing.",
    "Designed, prototyped, and connected multiple interface boards in Figma around user and engineering requirements.",
    "Reduced cognitive overload, clarified dense data, simplified navigation, established an accessible dark-mode design system, and created reusable components.",
  ] },
  { company: "Accenture", position: "UX/UI Engineer / Web / Automation Developer", date: "June 2021 – February 2025", bullets: [
    "Designed and shipped reusable UI patterns and component libraries in Figma for internal enterprise tools, then partnered with engineers on equivalent React components.",
    "Translated complex requirements into flows, wireframes, interactive prototypes, and high-fidelity designs grounded in user needs and platform constraints.",
    "Improved accessibility, planned usability evaluations, worked in Agile/Scrum teams, and created tools adopted by high-impact internal teams.",
  ] },
  { company: "Independent Web Design and Development", position: "UX/UI Engineer / Web Developer", date: "April 2025 – present", bullets: [
    "Finding Function: led end-to-end Figma-driven UX and built the responsive React frontend with a Node/Express and Supabase backend.",
    "R&S Nurse Call Parts: led end-to-end UX from Figma to production and built the responsive React frontend.",
  ] },
] as const;

function AboutContent() {
  return <div className="aboutLayout"><div className="aboutCopy">
    <p><strong>Wild42Media</strong></p><p>This is the official portfolio and creative hub of Calvin McWilliams — UX/UI designer, UX engineer, web developer, and multi-disciplinary creative. Calvin designs and builds intentional digital systems where aesthetics, functionality, and human behavior align to create clear, intuitive experiences. He specializes in crafting high-impact solutions that balance visual design, usability, and user psychology.</p>
    <p><strong>UX/UI Designer/Developer</strong></p><p>Backed by a Google UX Design Certification, I specialize in creating user-centered experiences for web and mobile platforms. My process is driven by in-depth UX research, usability testing, and iterative prototyping, ensuring designs are both functional and engaging.</p>
    <p><strong>Frontend Web Designer/Developer</strong></p><p>I design and engineer responsive web experiences using HTML5, CSS, JavaScript, Google Apps Script, and React. Grounded in UX principles and accessibility standards, I translate product logic and human behavior into clear, intuitive interfaces.</p>
    <p><strong>Overall</strong></p><p>With six years of independent UX and web design experience, four years at Accenture, and contract work with AMD, I bring a broad talent stack that bridges user experience, design, and front-end development.</p>
  </div><aside className="aboutStack"><img src="/assets/roto1.png" alt="Calvin McWilliams" /><div><strong>Talent Stack</strong><span>UX/UI{"\n"}Frontend Web{"\n"}React{"\n"}Facilitation{"\n"}Graphic Design</span></div></aside></div>;
}

function CertificationsContent() {
  return <ul className="certificationList">{certifications.map(([name, date, key]) => <li key={key}><div className="certificationCopy"><strong>{name}</strong><span>Coursera</span><span>{date}</span></div><a href={`/assets/Certs/imageFiles/${key}.pdf`} target="_blank" rel="noreferrer" aria-label={`Open ${name}`}><img src={`/assets/Certs/imageFiles/${key}.jpg`} alt={`${name} certificate`} /></a></li>)}</ul>;
}

function ResumeContent() {
  return <div className="resumeDocument"><h2>Calvin McWilliams</h2>
    <details open><summary>Skills</summary><ul>{skillItems.map(([label, detail]) => <li key={label}><strong>{label}</strong><span>{detail}</span></li>)}</ul></details>
    <details open><summary>Experience</summary><ul>{experience.map((job) => <li className="resumeJob" key={job.company}><strong>{job.company}</strong><em>{job.position}</em><span>{job.date}</span><ul>{job.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul></li>)}</ul></details>
    <details open><summary>Certifications</summary><ul><li className="resumeJob"><strong>Google UX Design Certificate</strong><span>February 2025</span><ul><li>Training in journey mapping, wireframing, prototyping, and usability testing with Figma and Adobe XD.</li></ul></li></ul></details>
    <details open><summary>Military</summary><ul><li className="resumeJob"><strong>United States Army</strong><span>September 1995 – September 2003</span></li></ul></details>
  </div>;
}

function ContactContent({ onSent }: { onSent: () => void }) {
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus("sending"); setError("");
    const formElement = event.currentTarget; const form = new FormData(formElement);
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: String(form.get("name") || ""), email: String(form.get("email") || ""), phone: String(form.get("phone") || ""), message: String(form.get("message") || "") }) });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "Message could not be sent.");
      formElement.reset(); onSent();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Message could not be sent."); setStatus("error");
    }
  }
  return <div className="contactSheetContent"><p>Send me a message and it’ll land directly in my inbox.</p><form onSubmit={handleSubmit}>
    <input name="name" placeholder="Name" required autoFocus /><div className="contactMethodRow"><input name="email" type="email" placeholder="Email" required /><input name="phone" type="tel" placeholder="Phone (optional)" /></div><textarea name="message" placeholder="Message" rows={6} required /><button type="submit" className="sendButton" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Send"}</button>{status === "error" && <span className="contactError" role="alert">{error}</span>}
  </form><a className="contactLinkedin" href="https://www.linkedin.com/in/calvin-mcwilliams/" target="_blank" rel="noreferrer">LinkedIn</a></div>;
}

export function InfoContent({ item, onSent }: { item: NavItem; onSent: () => void }) {
  if (item === "About") return <AboutContent />;
  if (item === "Certifications") return <CertificationsContent />;
  if (item === "Resume") return <ResumeContent />;
  return <ContactContent onSent={onSent} />;
}
