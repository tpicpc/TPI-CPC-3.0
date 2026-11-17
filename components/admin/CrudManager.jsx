"use client";

import PageHeader from "@/components/admin/PageHeader";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/lib/api-client";
import { Edit, LoaderCircle, Plus, Save, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const pad = (n) => String(n).padStart(2, "0");
const toLocalInput = (v) => {
  if (!v) return "";
  const d = new Date(v);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

function formFromItem(item, fields, defaults) {
  const f = { ...defaults };
  // non-field keys present in defaults (e.g. nested arrays) are copied as-is
  for (const k of Object.keys(defaults)) if (!fields.some((fd) => fd.name === k) && item?.[k] !== undefined) f[k] = item[k];
  for (const fd of fields) {
    const v = item?.[fd.name];
    if (v === undefined || v === null) continue;
    if (fd.type === "datetime") f[fd.name] = toLocalInput(v);
    else if (fd.type === "date") f[fd.name] = String(v).slice(0, 10);
    else if (fd.type === "tags") f[fd.name] = Array.isArray(v) ? v.join(", ") : v;
    else f[fd.name] = v;
  }
  return f;
}

function payloadFromForm(form, fields) {
  const out = { ...form };
  for (const fd of fields) {
    const v = form[fd.name];
    if (fd.type === "datetime") out[fd.name] = v ? new Date(v).toISOString() : null;
    if (fd.type === "number") out[fd.name] = v === "" || v === null ? null : Number(v);
    if (fd.type === "tags") out[fd.name] = String(v || "").split(",").map((s) => s.trim()).filter(Boolean);
    if (fd.type === "date") out[fd.name] = v || null;
  }
  return out;
}

/** Field renderer shared with custom editors. */
export function Field({ fd, value, onChange }) {
  const common = { id: fd.name, required: fd.required, placeholder: fd.placeholder, value: value ?? "" };
  let input;
  if (fd.type === "textarea") input = <Textarea rows={fd.rows || 4} {...common} onChange={(e) => onChange(e.target.value)} />;
  else if (fd.type === "select")
    input = (
      <select {...common} onChange={(e) => onChange(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
        {fd.options.map((o) => (typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>))}
      </select>
    );
  else if (fd.type === "checkbox")
    return (
      <label className={`flex items-center gap-2 text-sm ${fd.span === 3 ? "md:col-span-3" : ""}`}>
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="rounded" /> {fd.label}
      </label>
    );
  else
    input = (
      <Input
        {...common}
        type={fd.type === "datetime" ? "datetime-local" : fd.type === "tags" ? "text" : fd.type || "text"}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  return (
    <div className={`space-y-1.5 ${fd.span === 3 ? "md:col-span-3" : fd.span === 2 ? "md:col-span-2" : ""}`}>
      <Label htmlFor={fd.name}>{fd.label}{fd.required ? " *" : ""}</Label>
      {input}
      {fd.help && <p className="text-xs text-muted-foreground">{fd.help}</p>}
    </div>
  );
}

/**
 * Generic admin list + create/edit form for the club collections.
 * Endpoints: GET/POST `${endpoint}`, PUT/DELETE `${endpoint}/:id`.
 */
export default function CrudManager({
  title, description, endpoint, listKey, fields, defaults, newLabel = "New",
  renderItem, tabs, extraForm, onSaved, emptyText = "Nothing here yet.", headerExtra,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaults);
  const [extra, setExtra] = useState({});
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState(0);
  const { confirm, Dialog } = useConfirm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi().get(endpoint);
      if (data.success) setItems(data[listKey] || []);
    } catch { toast.error("Couldn't load"); }
    finally { setLoading(false); }
  }, [endpoint, listKey]);
  useEffect(() => { load(); }, [load]);

  const startNew = () => { setEditing("new"); setForm(defaults); setExtra({}); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const startEdit = (item) => { setEditing(item._id); setForm(formFromItem(item, fields, defaults)); setExtra({}); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const cancel = () => { setEditing(null); setForm(defaults); setExtra({}); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isNew = editing === "new";
      const payload = { ...payloadFromForm(form, fields), ...extra };
      const { data } = isNew ? await adminApi().post(endpoint, payload) : await adminApi().put(`${endpoint}/${editing}`, payload);
      if (!data.success) throw new Error(data.message);
      toast.success(isNew ? "Created" : "Saved");
      onSaved?.(data);
      cancel();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Save failed");
    } finally { setSaving(false); }
  };

  const update = async (item, patch, msg = "Updated") => {
    try {
      const { data } = await adminApi().put(`${endpoint}/${item._id}`, patch);
      if (!data.success) throw new Error(data.message);
      toast.success(msg);
      load();
    } catch (err) { toast.error(err.response?.data?.message || "Update failed"); }
  };
  const remove = async (item) => {
    if (!(await confirm({ title: "Delete this item?", description: "This can't be undone." }))) return;
    try {
      await adminApi().delete(`${endpoint}/${item._id}`);
      toast.success("Deleted");
      load();
    } catch (err) { toast.error(err.response?.data?.message || "Delete failed"); }
  };

  const visible = useMemo(() => (tabs ? items.filter(tabs[tab].filter) : items), [items, tabs, tab]);

  return (
    <div>
      <PageHeader title={title} description={description} action={!editing && <Button onClick={startNew}><Plus size={16} className="mr-1" /> {newLabel}</Button>} />
      {headerExtra}

      {editing && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">{editing === "new" ? newLabel : "Edit"}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={save} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {fields.map((fd) => <Field key={fd.name} fd={fd} value={form[fd.name]} onChange={(v) => setForm((f) => ({ ...f, [fd.name]: v }))} />)}
              </div>
              {extraForm?.({ form, setForm, extra, setExtra, isNew: editing === "new" })}
              <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={saving}>{saving ? <LoaderCircle className="animate-spin" size={18} /> : <><Save size={16} className="mr-1" /> Save</>}</Button>
                <Button type="button" variant="outline" onClick={cancel}><X size={16} className="mr-1" /> Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {tabs && (
        <div className="flex gap-1 mb-4 border-b">
          {tabs.map((t, i) => {
            const n = items.filter(t.filter).length;
            return (
              <button key={t.label} onClick={() => setTab(i)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${tab === i ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                {t.label} <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${t.alert && n ? "bg-red-500 text-white" : "bg-gray-100 dark:bg-gray-800"}`}>{n}</span>
              </button>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoaderCircle className="animate-spin" /></div>
      ) : visible.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">{emptyText}</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {visible.map((item) => (
            <Card key={item._id}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex-1 min-w-0">{renderItem(item, { update, reload: load })}</div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => startEdit(item)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Edit"><Edit size={16} /></button>
                  <button onClick={() => remove(item)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950 text-red-600" aria-label="Delete"><Trash2 size={16} /></button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog />
    </div>
  );
}

export function Pill({ tone = "gray", children }) {
  const t = {
    gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    green: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    amber: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  }[tone];
  return <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${t}`}>{children}</span>;
}
