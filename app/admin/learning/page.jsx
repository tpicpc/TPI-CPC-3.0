"use client";

import CrudManager, { Pill } from "@/components/admin/CrudManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowDown, ArrowUp, ExternalLink, Plus, Trash2 } from "lucide-react";

const fields = [
  { name: "title", label: "Topic title", required: true },
  { name: "level", label: "Level", type: "select", options: ["Beginner", "Intermediate", "Advanced"] },
  { name: "order", label: "Order within level", type: "number" },
  { name: "slug", label: "URL slug (auto from title)", placeholder: "binary-search" },
  { name: "published", label: "Published", type: "checkbox", span: 2 },
  { name: "description", label: "Description", type: "textarea", rows: 3, span: 3 },
];
const defaults = { title: "", level: "Beginner", order: 0, slug: "", published: true, description: "", items: [] };
const KINDS = ["problem", "practice", "article", "video", "course"];
const blank = { title: "", url: "", kind: "problem", platform: "", difficulty: "", note: "" };

function ItemsEditor({ form, setForm }) {
  const items = form.items || [];
  const set = (i, patch) => setForm((f) => ({ ...f, items: f.items.map((it, j) => (j === i ? { ...it, ...patch } : it)) }));
  const move = (i, d) => setForm((f) => {
    const a = [...f.items];
    const j = i + d;
    if (j < 0 || j >= a.length) return f;
    [a[i], a[j]] = [a[j], a[i]];
    return { ...f, items: a };
  });
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Curated problems & resources <span className="text-muted-foreground font-normal">({items.length})</span></p>
        <Button type="button" size="sm" variant="outline" onClick={() => setForm((f) => ({ ...f, items: [...(f.items || []), { ...blank }] }))}><Plus size={14} className="mr-1" /> Add item</Button>
      </div>
      {items.length === 0 && <p className="text-xs text-muted-foreground">Add problems (Codeforces, AtCoder, CSES…) and learning resources (articles, videos).</p>}
      {items.map((it, i) => (
        <div key={it._id || i} className="grid grid-cols-12 gap-2 items-center rounded-lg border p-2">
          <select value={it.kind} onChange={(e) => set(i, { kind: e.target.value })} className="col-span-4 md:col-span-2 h-9 rounded-md border border-input bg-background px-2 text-sm">
            {KINDS.map((k) => <option key={k}>{k}</option>)}
          </select>
          <Input className="col-span-8 md:col-span-3 h-9" placeholder="Title *" value={it.title} onChange={(e) => set(i, { title: e.target.value })} />
          <Input className="col-span-12 md:col-span-3 h-9" placeholder="URL" value={it.url} onChange={(e) => set(i, { url: e.target.value })} />
          <Input className="col-span-4 md:col-span-1 h-9" placeholder="Judge" value={it.platform} onChange={(e) => set(i, { platform: e.target.value })} />
          <Input className="col-span-4 md:col-span-1 h-9" placeholder="Diff." value={it.difficulty} onChange={(e) => set(i, { difficulty: e.target.value })} />
          <div className="col-span-4 md:col-span-2 flex justify-end gap-0.5">
            <button type="button" onClick={() => move(i, -1)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Move up"><ArrowUp size={14} /></button>
            <button type="button" onClick={() => move(i, 1)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Move down"><ArrowDown size={14} /></button>
            <button type="button" onClick={() => setForm((f) => ({ ...f, items: f.items.filter((_, j) => j !== i) }))} className="p-1.5 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-950" aria-label="Remove"><Trash2 size={14} /></button>
          </div>
        </div>
      ))}
    </div>
  );
}

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export default function AdminLearningPage() {
  return (
    <CrudManager
      title="Learning Path"
      description="Build the Beginner → Advanced roadmap. Each topic holds curated problems and resources; members tick items off as they go."
      endpoint="/api/v1/admin/learning"
      listKey="topics"
      fields={fields}
      defaults={defaults}
      newLabel="New topic"
      tabs={LEVELS.map((l) => ({ label: l, filter: (t) => t.level === l }))}
      extraForm={({ form, setForm }) => <ItemsEditor form={form} setForm={setForm} />}
      emptyText="No topics at this level yet."
      renderItem={(t) => (
        <div>
          <p className="font-semibold">{t.order}. {t.title} <a href={`/learn/${t.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex text-indigo-500 align-middle ml-1"><ExternalLink size={13} /></a></p>
          {t.description && <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{t.description}</p>}
          <div className="flex flex-wrap gap-2 mt-2 text-xs">
            <Pill tone="indigo">{t.items.filter((i) => ["problem", "practice"].includes(i.kind)).length} problems</Pill>
            <Pill>{t.items.filter((i) => !["problem", "practice"].includes(i.kind)).length} resources</Pill>
            <Pill tone={t.published ? "green" : "gray"}>{t.published ? "Published" : "Hidden"}</Pill>
          </div>
        </div>
      )}
    />
  );
}
