"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Project, SiteContent } from "@/app/_components/portfolio-types";

export function AdminEditor({ initialContent }: { initialContent: SiteContent }) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [selectedSlug, setSelectedSlug] = useState(initialContent.projects[0]?.slug || "");
  const [draft, setDraft] = useState(() => JSON.stringify(initialContent.projects[0] || {}, null, 2));
  const [status, setStatus] = useState("Ready");
  const [assetPath, setAssetPath] = useState("");
  const selectedIndex = useMemo(() => content.projects.findIndex((project) => project.slug === selectedSlug), [content.projects, selectedSlug]);

  function select(project: Project) { setSelectedSlug(project.slug); setDraft(JSON.stringify(project, null, 2)); setStatus("Ready"); }
  function applyDraft() {
    try {
      const project = JSON.parse(draft) as Project;
      if (!project.slug?.trim() || !project.title?.trim()) throw new Error("A slug and title are required.");
      setContent((current) => ({ ...current, projects: current.projects.map((item, index) => index === selectedIndex ? project : item) }));
      setSelectedSlug(project.slug); setStatus("Changes applied locally—save to publish them.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Invalid JSON."); }
  }
  async function save() {
    let nextContent = content;
    try {
      const project = JSON.parse(draft) as Project;
      if (!project.slug?.trim() || !project.title?.trim()) throw new Error("A slug and title are required.");
      nextContent = { ...content, projects: content.projects.map((item, index) => index === selectedIndex ? project : item) };
    } catch (error) { setStatus(error instanceof Error ? error.message : "Invalid JSON."); return; }
    setStatus("Saving…"); setContent(nextContent);
    const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(nextContent) });
    const result = await response.json();
    setStatus(response.ok ? "Saved. The public portfolio is updated." : result.error || "Save failed.");
  }
  function addProject() {
    const project: Project = { slug: `new-project-${Date.now()}`, title: "New Project", subtitle: "", published: false, caseStudy: { title: "New Project", sections: [] }, products: { groups: [] }, otherAssets: { groups: [] } };
    setContent((current) => ({ ...current, projects: [...current.projects, project] })); select(project);
  }
  function move(offset: number) {
    if (selectedIndex < 0) return;
    const target = selectedIndex + offset;
    if (target < 0 || target >= content.projects.length) return;
    setContent((current) => { const projects = [...current.projects]; [projects[selectedIndex], projects[target]] = [projects[target], projects[selectedIndex]]; return { ...current, projects }; });
  }
  async function logout() { await fetch("/api/admin/logout", { method: "POST" }); router.replace("/admin/login"); router.refresh(); }
  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setStatus("Uploading…");
    const body = new FormData(); body.set("file", file);
    const response = await fetch("/api/admin/uploads", { method: "POST", body });
    const result = await response.json();
    if (!response.ok) { setStatus(result.error || "Upload failed."); return; }
    setAssetPath(result.path); setStatus("Asset uploaded. Copy its path into the project data.");
  }

  return <main className="adminShell">
    <header><div><span>Wild42</span><h1>Portfolio CMS</h1></div><nav><a href="/" target="_blank">View portfolio</a><button onClick={logout}>Sign out</button></nav></header>
    <div className="adminWorkspace">
      <aside><div className="adminAsideHeading"><h2>Case studies</h2><button onClick={addProject}>+ Add</button></div><ol>{content.projects.map((project) => <li key={project.slug}><button className={project.slug === selectedSlug ? "isSelected" : ""} onClick={() => select(project)}><strong>{project.title}</strong><span>{project.published === false ? "Draft" : "Published"}</span></button></li>)}</ol></aside>
      <section className="adminEditor"><div className="adminEditorToolbar"><div><button onClick={() => move(-1)}>Move up</button><button onClick={() => move(1)}>Move down</button></div><button className="adminSave" onClick={save}>Save all changes</button></div><div className="adminAssetTool"><label>Upload asset<input type="file" accept="image/*,.pdf" onChange={upload} /></label>{assetPath && <label>Uploaded path<input value={assetPath} readOnly onFocus={(event) => event.currentTarget.select()} /></label>}</div><label>Project data<textarea value={draft} onChange={(event) => setDraft(event.target.value)} spellCheck={false} /></label><div className="adminEditorFooter"><button onClick={applyDraft}>Apply project changes</button><output>{status}</output></div></section>
    </div>
  </main>;
}
