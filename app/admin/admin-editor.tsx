"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_MEDIA, NAV_ITEMS, type MediaPhoto, type PortfolioMedia, type Project, type SiteContent } from "@/app/_components/portfolio-types";

import { mediaCategories } from "@/app/_components/media-categories";

type EditorTab = "details" | "ux" | "design" | "products" | "assets";
type BodyItem = string | { text?: string; sub?: string[] };
type ContentSection = { heading?: string; body?: BodyItem[] };
type AssetItem = Record<string, string>;
type AssetGroup = {
  key?: string;
  title?: string;
  desc?: string;
  label?: string;
  items?: AssetItem[];
};

const TABS: { id: EditorTab; label: string }[] = [
  { id: "details", label: "Project" },
  { id: "ux", label: "UX Case Study" },
  { id: "design", label: "Design Thinking" },
  { id: "products", label: "Products" },
  { id: "assets", label: "Other Assets" },
];

function moveItem<T>(items: T[], index: number, offset: number) {
  const target = index + offset;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function Field({
  label,
  value,
  onChange,
  multiline = false,
  placeholder = "",
  list,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
  list?: string;
}) {
  return (
    <label className={multiline ? "adminField adminFieldWide" : "adminField"}>
      <span>{label}</span>
      {multiline ? (
        <textarea
          value={value || ""}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          list={list}
          value={value || ""}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
}

function RowControls({
  index,
  count,
  onMove,
  onRemove,
}: {
  index: number;
  count: number;
  onMove: (offset: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="adminRowControls">
      <button
        type="button"
        disabled={index === 0}
        onClick={() => onMove(-1)}
        // aria-label="Move up"
      >
        <span className="material-symbols-outlined">
keyboard_control_key
</span>
        ↑
      </button>
      <button
        type="button"
        disabled={index === count - 1}
        onClick={() => onMove(1)}
        aria-label="Move down"
      >
        ↓
      </button>
      <button type="button" className="adminDanger" onClick={onRemove}>
        Remove
      </button>
    </div>
  );
}

function BodyEditor({
  items,
  onChange,
}: {
  items: BodyItem[];
  onChange: (items: BodyItem[]) => void;
}) {
  return (
    <div className="adminBodyList">
      {items.map((item, index) => {
        const structured = typeof item !== "string";
        const text = structured ? item.text || "" : item;
        const bullets = structured ? item.sub || [] : [];
        return (
          <article className="adminBodyItem" key={index}>
            <div className="adminBodyItemHeader">
              <strong>{structured ? "Titled content" : "Paragraph"}</strong>
              <RowControls
                index={index}
                count={items.length}
                onMove={(offset) => onChange(moveItem(items, index, offset))}
                onRemove={() =>
                  onChange(items.filter((_, itemIndex) => itemIndex !== index))
                }
              />
            </div>
            <Field
              label={structured ? "Title / text" : "Text"}
              value={text}
              multiline
              onChange={(value) => {
                const next = [...items];
                next[index] = structured ? { ...item, text: value } : value;
                onChange(next);
              }}
            />
            {structured && (
              <div className="adminSubList">
                {bullets.map((bullet, bulletIndex) => (
                  <div className="adminInlineRow" key={bulletIndex}>
                    <input
                      value={bullet}
                      aria-label={`Bullet ${bulletIndex + 1}`}
                      onChange={(event) => {
                        const sub = [...bullets];
                        sub[bulletIndex] = event.target.value;
                        const next = [...items];
                        next[index] = { ...item, sub };
                        onChange(next);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const sub = bullets.filter(
                          (_, current) => current !== bulletIndex,
                        );
                        const next = [...items];
                        next[index] = { ...item, sub };
                        onChange(next);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="adminAddSmall"
                  onClick={() => {
                    const next = [...items];
                    next[index] = { ...item, sub: [...bullets, ""] };
                    onChange(next);
                  }}
                >
                  + Add bullet
                </button>
              </div>
            )}
          </article>
        );
      })}
      <div className="adminAddRow">
        <button type="button" onClick={() => onChange([...items, ""])}>
          + Paragraph
        </button>
        <button
          type="button"
          onClick={() => onChange([...items, { text: "", sub: [""] }])}
        >
          + Titled content
        </button>
      </div>
    </div>
  );
}

function SectionsEditor({
  sections,
  onChange,
}: {
  sections: ContentSection[];
  onChange: (sections: ContentSection[]) => void;
}) {
  const [activeSection, setActiveSection] = useState(0);
  const safeActiveSection = Math.min(
    activeSection,
    Math.max(sections.length - 1, 0),
  );
  const section = sections[safeActiveSection];

  function removeSection() {
    const next = sections.filter((_, index) => index !== safeActiveSection);
    setActiveSection(Math.min(safeActiveSection, Math.max(next.length - 1, 0)));
    onChange(next);
  }

  function moveSection(offset: number) {
    const next = moveItem(sections, safeActiveSection, offset);
    if (next === sections) return;
    setActiveSection(safeActiveSection + offset);
    onChange(next);
  }

  function addSection() {
    const next = [...sections, { heading: "New Section", body: [""] }];
    onChange(next);
    setActiveSection(next.length - 1);
  }

  return (
    <div className="adminSectionEditor">
      <nav
        className="adminSectionTabs"
        aria-label="Case study sections"
        role="tablist"
      >
        {sections.map((item, index) => (
          <button
            type="button"
            key={index}
            role="tab"
            className={safeActiveSection === index ? "isActive" : ""}
            aria-selected={safeActiveSection === index}
            onClick={() => setActiveSection(index)}
          >
            {item.heading || `Untitled section ${index + 1}`}
          </button>
        ))}
        <button
          type="button"
          className="adminAddSectionTab"
          onClick={addSection}
        >
          + Add section
        </button>
      </nav>

      {section && (
        <div className="adminSectionPanel">
          <div className="adminModuleContent">
            <div className="adminModuleToolbar">
              <Field
                label="Section heading"
                value={section.heading}
                onChange={(value) => {
                  const next = [...sections];
                  next[safeActiveSection] = { ...section, heading: value };
                  onChange(next);
                }}
              />
              <RowControls
                index={safeActiveSection}
                count={sections.length}
                onMove={moveSection}
                onRemove={removeSection}
              />
            </div>
            <BodyEditor
              items={section.body || []}
              onChange={(body) => {
                const next = [...sections];
                next[safeActiveSection] = { ...section, body };
                onChange(next);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function CaseStudyEditor({
  value,
  onChange,
  designThinking = false,
}: {
  value: any;
  onChange: (value: any) => void;
  designThinking?: boolean;
}) {
  const data = value || {};
  return (
    <div className="adminTabPanel">
      <div className="adminPanelHeading">
        <div>
          <h2>{designThinking ? "Design Thinking" : "UX Case Study"}</h2>
          <p>Organize the story into focused, reorderable sections.</p>
        </div>
        {designThinking && !value && (
          <button
            type="button"
            onClick={() =>
              onChange({ heading: "Design Thinking", sections: [] })
            }
          >
            Enable section
          </button>
        )}
      </div>
      {(!designThinking || value) && (
        <>
          <Field
            label={designThinking ? "Tab heading" : "Case study title"}
            value={designThinking ? data.heading : data.title}
            onChange={(text) =>
              onChange({
                ...data,
                [designThinking ? "heading" : "title"]: text,
              })
            }
          />
          <SectionsEditor
            sections={data.sections || []}
            onChange={(sections) => onChange({ ...data, sections })}
          />
          {designThinking && (
            <button
              type="button"
              className="adminDanger adminRemoveModule"
              onClick={() => onChange(undefined)}
            >
              Remove Design Thinking section
            </button>
          )}
        </>
      )}
    </div>
  );
}

function AssetField({
  label,
  value,
  onChange,
  onUpload,
  imagesOnly = false,
}: {
  label: string;
  imagesOnly?: boolean;
  value?: string;
  onChange: (value: string) => void;
  onUpload: (file: File) => Promise<string | null>;
}) {
  const [uploading, setUploading] = useState(false);
  const isImage = value && /\.(avif|gif|jpe?g|png|svg|webp)$/i.test(value);
  return (
    <div className="adminAssetField">
      {/* Uploaded paths are runtime content, so this preview intentionally bypasses Next image optimization. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {isImage && <img src={value} alt="Asset preview" />}
      <Field
        label={label}
        value={value}
        onChange={onChange}
        placeholder="/uploads/filename.png"
      />
      <label className="adminUploadButton">
        {uploading ? "Uploading…" : value ? "Replace" : "Upload"}
        <input
          type="file"
          accept={imagesOnly ? "image/jpeg,image/png,image/webp,image/gif,image/svg+xml" : "image/*,.pdf"}
          disabled={uploading}
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setUploading(true);
            const path = await onUpload(file);
            if (path) onChange(path);
            setUploading(false);
            event.target.value = "";
          }}
        />
      </label>
    </div>
  );
}

function CollectionEditor({
  title,
  value,
  onChange,
  onUpload,
}: {
  title: string;
  value: any;
  onChange: (value: any) => void;
  onUpload: (file: File) => Promise<string | null>;
}) {
  const data = value || { title, heading: title, groups: [] };
  const groups: AssetGroup[] = data.groups || [];
  return (
    <div className="adminTabPanel">
      <div className="adminPanelHeading">
        <div>
          <h2>{title}</h2>
          <p>
            Manage linked prototypes, documents, images, and supporting work.
          </p>
        </div>
      </div>
      <div className="adminFieldGrid">
        <Field
          label="Title"
          value={data.title}
          onChange={(text) => onChange({ ...data, title: text })}
        />
        <Field
          label="Heading"
          value={data.heading}
          onChange={(text) => onChange({ ...data, heading: text })}
        />
      </div>
      <div className="adminSectionList">
        {groups.map((group, groupIndex) => (
          <details
            className="adminModule"
            key={groupIndex}
            open={groupIndex === 0}
          >
            <summary>
              <span>
                {group.title || group.label || `Group ${groupIndex + 1}`}
              </span>
              <small>{(group.items || []).length} assets</small>
            </summary>
            <div className="adminModuleContent">
              <div className="adminModuleToolbar">
                <div className="adminFieldGrid">
                  <Field
                    label="Group title"
                    value={group.title}
                    onChange={(text) => {
                      const next = [...groups];
                      next[groupIndex] = { ...group, title: text };
                      onChange({ ...data, groups: next });
                    }}
                  />
                  <Field
                    label="Key"
                    value={group.key}
                    onChange={(text) => {
                      const next = [...groups];
                      next[groupIndex] = { ...group, key: text };
                      onChange({ ...data, groups: next });
                    }}
                  />
                  <Field
                    label="Description"
                    value={group.desc}
                    onChange={(text) => {
                      const next = [...groups];
                      next[groupIndex] = { ...group, desc: text };
                      onChange({ ...data, groups: next });
                    }}
                  />
                </div>
                <RowControls
                  index={groupIndex}
                  count={groups.length}
                  onMove={(offset) =>
                    onChange({
                      ...data,
                      groups: moveItem(groups, groupIndex, offset),
                    })
                  }
                  onRemove={() =>
                    onChange({
                      ...data,
                      groups: groups.filter(
                        (_, current) => current !== groupIndex,
                      ),
                    })
                  }
                />
              </div>
              <div className="adminAssetList">
                {(group.items || []).map((item, itemIndex) => {
                  function updateAsset(field: string, text: string) {
                    const next = [...groups];
                    const items = [...(group.items || [])];
                    items[itemIndex] = { ...item, [field]: text };
                    next[groupIndex] = { ...group, items };
                    onChange({ ...data, groups: next });
                  }
                  return (
                    <article className="adminAssetCard" key={itemIndex}>
                      <div className="adminBodyItemHeader">
                        <strong>
                          {item.label || item.desc || `Asset ${itemIndex + 1}`}
                        </strong>
                        <RowControls
                          index={itemIndex}
                          count={(group.items || []).length}
                          onMove={(offset) => {
                            const next = [...groups];
                            next[groupIndex] = {
                              ...group,
                              items: moveItem(
                                group.items || [],
                                itemIndex,
                                offset,
                              ),
                            };
                            onChange({ ...data, groups: next });
                          }}
                          onRemove={() => {
                            const next = [...groups];
                            next[groupIndex] = {
                              ...group,
                              items: (group.items || []).filter(
                                (_, current) => current !== itemIndex,
                              ),
                            };
                            onChange({ ...data, groups: next });
                          }}
                        />
                      </div>
                      <div className="adminFieldGrid">
                        <Field
                          label="Label"
                          value={item.label}
                          onChange={(text) => updateAsset("label", text)}
                        />
                        <Field
                          label="Description"
                          value={item.desc}
                          onChange={(text) => updateAsset("desc", text)}
                        />
                        <Field
                          label="Platform"
                          value={item.platform}
                          onChange={(text) => updateAsset("platform", text)}
                        />
                        <Field
                          label="Link"
                          value={item.href}
                          onChange={(text) => updateAsset("href", text)}
                        />
                        <Field
                          label="Alt text"
                          value={item.alt}
                          onChange={(text) => updateAsset("alt", text)}
                        />
                      </div>
                      <AssetField
                        label="Image or file path"
                        value={item.thumbKey}
                        onChange={(text) => updateAsset("thumbKey", text)}
                        onUpload={onUpload}
                      />
                    </article>
                  );
                })}
              </div>
              <button
                type="button"
                className="adminAddSmall"
                onClick={() => {
                  const next = [...groups];
                  next[groupIndex] = {
                    ...group,
                    items: [
                      ...(group.items || []),
                      {
                        type: "image",
                        label: "New Asset",
                        platform: "",
                        desc: "",
                        href: "",
                        thumbKey: "",
                        alt: "",
                      },
                    ],
                  };
                  onChange({ ...data, groups: next });
                }}
              >
                + Add asset
              </button>
            </div>
          </details>
        ))}
        <button
          type="button"
          className="adminAddModule"
          onClick={() =>
            onChange({
              ...data,
              groups: [
                ...groups,
                { key: `group-${Date.now()}`, title: "New Group", items: [] },
              ],
            })
          }
        >
          + Add group
        </button>
      </div>
    </div>
  );
}

export function AdminEditor({
  initialContent,
}: {
  initialContent: SiteContent;
}) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [selectedSlug, setSelectedSlug] = useState(
    initialContent.projects[0]?.slug || "",
  );
  const [editingMedia, setEditingMedia] = useState(false);
  const [activeTab, setActiveTab] = useState<EditorTab>("details");
  const [status, setStatus] = useState("Ready");
  const [dirty, setDirty] = useState(false);
  const selectedIndex = useMemo(
    () =>
      content.projects.findIndex((project) => project.slug === selectedSlug),
    [content.projects, selectedSlug],
  );
  const project = content.projects[selectedIndex];

  function select(next: Project) {
    setSelectedSlug(next.slug);
    setActiveTab("details");
    setStatus(dirty ? "Unsaved changes remain." : "Ready");
  }
  function updateProject(update: Partial<Project>) {
    setContent((current) => ({
      ...current,
      projects: current.projects.map((item, index) =>
        index === selectedIndex ? { ...item, ...update } : item,
      ),
    }));
    if (update.slug) setSelectedSlug(update.slug);
    setDirty(true);
    setStatus("Unsaved changes");
  }
  function addProject() {
    const next: Project = {
      slug: `new-project-${Date.now()}`,
      title: "New Project",
      subtitle: "",
      published: false,
      caseStudy: { title: "New Project", sections: [] },
      products: { title: "Products", heading: "Products", groups: [] },
      otherAssets: {
        title: "Other Assets",
        heading: "Other Assets",
        groups: [],
      },
    };
    setContent((current) => ({
      ...current,
      projects: [...current.projects, next],
    }));
    setSelectedSlug(next.slug);
    setActiveTab("details");
    setDirty(true);
    setStatus("New draft created—save when ready.");
  }
  function moveProject(offset: number) {
    const projects = moveItem(content.projects, selectedIndex, offset);
    if (projects === content.projects) return;
    setContent({ ...content, projects });
    setDirty(true);
    setStatus("Project order changed");
  }
  function removeProject() {
    if (
      !project ||
      !window.confirm(
        `Remove “${project.title}”? This is not permanent until you save.`,
      )
    )
      return;
    const projects = content.projects.filter(
      (_, index) => index !== selectedIndex,
    );
    setContent({ ...content, projects });
    setSelectedSlug(projects[Math.max(0, selectedIndex - 1)]?.slug || "");
    setDirty(true);
    setStatus("Project removed locally—save to confirm.");
  }
  function updateMedia(update: (media: PortfolioMedia) => PortfolioMedia) {
    setContent((current) => ({ ...current, media: update(current.media ?? DEFAULT_MEDIA) }));
    setDirty(true);
  }

  function updatePhoto(id: string, changes: Partial<MediaPhoto>) {
    updateMedia((media) => ({
      ...media,
      photos: media.photos.map((photo) => photo.id === id ? { ...photo, ...changes } : photo),
    }));
  }

  const navigation = content.navigation ?? [...NAV_ITEMS];
  const media = content.media ?? DEFAULT_MEDIA;
  const categories = mediaCategories([...media.videos, ...media.photos]);

  async function save() {
    if (content.projects.some((item) => !item.slug.trim() || !item.title.trim())) {
      setStatus("Every project needs a slug and title.");
      return;
    }
    setStatus("Saving…");
    const response = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });
    const result = await response.json();
    if (response.ok) setDirty(false);
    setStatus(
      response.ok
        ? "Saved. The public portfolio is updated."
        : result.error || "Save failed.",
    );
  }
  async function upload(file: File) {
    setStatus("Uploading asset…");
    const body = new FormData();
    body.set("file", file);
    const response = await fetch("/api/admin/uploads", {
      method: "POST",
      body,
    });
    const result = await response.json();
    setStatus(
      response.ok
        ? "Asset uploaded and attached—save to publish."
        : result.error || "Upload failed.",
    );
    return response.ok ? (result.path as string) : null;
  }
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <main className="adminShell">
      <div className="adminWorkspace">
        <aside>
          <header>
            <div>
              <span>Wild42</span>
              <h1>Portfolio CMS</h1>
            </div>
            <nav>
              <a href="/" target="_blank">
                View portfolio
              </a>
              <button type="button" onClick={logout}>
                Sign out
              </button>
            </nav>
          </header>
          <div className="adminEditorToolbar">
            <button type="button" aria-pressed={editingMedia} onClick={() => setEditingMedia(!editingMedia)}>
              Navigation and Video/Photo
            </button>
          </div>
          <div className="adminEditorToolbar">
            <div>
              <button
                type="button"
                disabled={selectedIndex <= 0}
                onClick={() => moveProject(-1)}
              >
                Move up
              </button>
              <button
                type="button"
                disabled={
                  selectedIndex < 0 ||
                  selectedIndex === content.projects.length - 1
                }
                onClick={() => moveProject(1)}
              >
                Move down
              </button>
            <button type="button" onClick={addProject}>
              + Add
            </button>
            </div>
          </div>
          <ol>
            <h2>Case studies</h2>
            {content.projects.map((item) => (
              <li key={item.slug}>
                <button
                  type="button"
                  className={item.slug === selectedSlug ? "isSelected" : ""}
                  onClick={() => { select(item); setEditingMedia(false); }}
                >
                  <strong>{item.title}</strong>
                  <span>
                    {item.published === false ? "Draft" : "Published"}
                  </span>
                </button>
              </li>
            ))}
          </ol>
            <div className="asideStatus">
              <output className={dirty ? "isDirty" : ""}>{status}</output>
              <button
                type="button"
                className="adminSave"
                disabled={!dirty}
                onClick={save}
              >
                Save all changes
              </button>
            </div>
        </aside>
        <section className="adminEditor">
          {editingMedia ? (
            <div className="adminTabPanel">
              <h2>Navigation and Video/Photo</h2>
              <datalist id="portfolio-media-categories">
                {categories.map(({ key, label }) => <option key={key} value={label} />)}
              </datalist>
              <section aria-label="Menu order">
                <h2>Menu order</h2>
                <ol>
                  {navigation.map((item, index) => (
                    <li key={item} className="adminRowControls">
                      <span>{item}</span>
                      {([-1, 1] as const).map((offset) => (
                        <button
                          key={offset}
                          type="button"
                          aria-label={`Move ${item} ${offset === -1 ? "up" : "down"}`}
                          disabled={index + offset < 0 || index + offset >= navigation.length}
                          onClick={() => {
                            setContent((current) => ({
                              ...current,
                              navigation: moveItem(current.navigation ?? [...NAV_ITEMS], index, offset),
                            }));
                            setDirty(true);
                          }}
                        >
                          {offset === -1 ? "↑" : "↓"}
                        </button>
                      ))}
                    </li>
                  ))}
                </ol>
              </section>
              <section aria-label="Videos">
                <h2>Videos</h2>
                {media.videos.map((video, index) => (
                  <div key={index}>
                    <Field label="Title" value={video.title} onChange={(title) => updateMedia((current) => ({
                      ...current, videos: current.videos.map((item, row) => row === index ? { ...item, title } : item),
                    }))} />
                    <Field label="YouTube video URL" value={video.url} onChange={(url) => updateMedia((current) => ({
                      ...current, videos: current.videos.map((item, row) => row === index ? { ...item, url } : item),
                    }))} />
                    <Field label="Category" list="portfolio-media-categories" value={video.category}
                      onChange={(category) => updateMedia((current) => ({
                        ...current, videos: current.videos.map((item, row) => row === index ? { ...item, category } : item),
                      }))}
                    />
                    <RowControls index={index} count={media.videos.length}
                      onMove={(offset) => updateMedia((current) => ({ ...current, videos: moveItem(current.videos, index, offset) }))}
                      onRemove={() => updateMedia((current) => ({ ...current, videos: current.videos.filter((_, row) => row !== index) }))}
                    />
                  </div>
                ))}
                <button type="button" onClick={() => updateMedia((current) => ({
                  ...current, videos: [...current.videos, { url: "", title: "" }],
                }))}>Add video</button>
              </section>
              <section aria-label="Photos">
                <h2>Photos</h2>
                {media.photos.map((photo, index) => (
                  <div key={photo.id}>
                    <AssetField imagesOnly label="Image path" value={photo.src} onUpload={upload}
                      onChange={(src) => updatePhoto(photo.id, { src })}
                    />
                    <Field label="Alt text" value={photo.alt} onChange={(alt) => updatePhoto(photo.id, { alt })} />
                    <Field label="Category" list="portfolio-media-categories" value={photo.category}
                      onChange={(category) => updatePhoto(photo.id, { category })}
                    />
                    <RowControls index={index} count={media.photos.length}
                      onMove={(offset) => updateMedia((current) => ({ ...current, photos: moveItem(current.photos, index, offset) }))}
                      onRemove={() => updateMedia((current) => ({ ...current, photos: current.photos.filter((item) => item.id !== photo.id) }))}
                    />
                  </div>
                ))}
                <button type="button" onClick={() => {
                  const id = crypto.randomUUID();
                  updateMedia((current) => ({ ...current, photos: [...current.photos, { id, src: "", alt: "" }] }));
                }}>Add photo</button>
              </section>
            </div>
          ) : project ? (
            <>
              <nav className="adminTabs" aria-label="Project editor">
                {TABS.map((tab) => (
                  <button
                    type="button"
                    key={tab.id}
                    className={activeTab === tab.id ? "isActive" : ""}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
              {activeTab === "details" && (
                <div className="adminTabPanel">
                  <div className="adminPanelHeading">
                    <div>
                      <h2>Project details</h2>
                      <p>
                        Control how this case study appears in the portfolio.
                      </p>
                    </div>
                    <label className="adminPublish">
                      <input
                        type="checkbox"
                        checked={project.published !== false}
                        onChange={(event) =>
                          updateProject({ published: event.target.checked })
                        }
                      />
                      <span>
                        {project.published === false ? "Draft" : "Published"}
                      </span>
                    </label>
                  </div>
                  <div className="adminFieldGrid">
                    <Field
                      label="Project title"
                      value={project.title}
                      onChange={(title) => updateProject({ title })}
                    />
                    <Field
                      label="Subtitle"
                      value={project.subtitle}
                      onChange={(subtitle) => updateProject({ subtitle })}
                    />
                    <Field
                      label="Slug"
                      value={project.slug}
                      onChange={(slug) =>
                        updateProject({
                          slug: slug.replace(/\s+/g, "-").toLowerCase(),
                        })
                      }
                    />
                  </div>
                  <button
                    type="button"
                    className="adminDanger adminRemoveProject"
                    onClick={removeProject}
                  >
                    Remove project
                  </button>
                </div>
              )}
              {activeTab === "ux" && (
                <CaseStudyEditor
                  value={project.caseStudy}
                  onChange={(caseStudy) => updateProject({ caseStudy })}
                />
              )}
              {activeTab === "design" && (
                <CaseStudyEditor
                  designThinking
                  value={project.designThinking}
                  onChange={(designThinking) =>
                    updateProject({ designThinking })
                  }
                />
              )}
              {activeTab === "products" && (
                <CollectionEditor
                  title="Products"
                  value={project.products}
                  onChange={(products) => updateProject({ products })}
                  onUpload={upload}
                />
              )}
              {activeTab === "assets" && (
                <CollectionEditor
                  title="Other Assets"
                  value={project.otherAssets}
                  onChange={(otherAssets) => updateProject({ otherAssets })}
                  onUpload={upload}
                />
              )}
            </>
          ) : (
            <div className="adminEmpty">
              <h2>No case studies yet</h2>
              <button type="button" onClick={addProject}>
                Create the first one
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
