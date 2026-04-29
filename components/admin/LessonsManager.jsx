"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { youtubeEmbedUrl, youtubeThumbnail } from "@/lib/youtube";
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export default function LessonsManager({ lessons, onChange }) {
  const [openIdx, setOpenIdx] = useState(null);

  const update = (i, key, value) => {
    const next = lessons.map((l, idx) => (idx === i ? { ...l, [key]: value } : l));
    onChange(next);
  };

  const updateResource = (lessonIdx, resIdx, key, value) => {
    const next = lessons.map((l, idx) => {
      if (idx !== lessonIdx) return l;
      const resources = (l.resources || []).map((r, ri) => (ri === resIdx ? { ...r, [key]: value } : r));
      return { ...l, resources };
    });
    onChange(next);
  };

  const addResource = (i) => {
    const next = lessons.map((l, idx) => idx === i ? { ...l, resources: [...(l.resources || []), { label: "", url: "" }] } : l);
    onChange(next);
  };

  const removeResource = (lessonIdx, resIdx) => {
    const next = lessons.map((l, idx) => idx === lessonIdx ? { ...l, resources: (l.resources || []).filter((_, ri) => ri !== resIdx) } : l);
    onChange(next);
  };

  const add = () => {
    onChange([...lessons, { title: "", videoUrl: "", duration: "", description: "", resources: [], order: lessons.length }]);
    setOpenIdx(lessons.length);
  };

  const remove = (i) => {
    onChange(lessons.filter((_, idx) => idx !== i).map((l, idx) => ({ ...l, order: idx })));
  };

  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= lessons.length) return;
    const next = [...lessons];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next.map((l, idx) => ({ ...l, order: idx })));
  };

  return (
    <div className="space-y-3">
      {lessons.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground text-sm">
          No lessons yet. Add the first one below.
        </div>
      )}

      {lessons.map((l, i) => {
        const thumb = youtubeThumbnail(l.videoUrl);
        const isOpen = openIdx === i;
        return (
          <div key={i} className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900">
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50">
              <GripVertical size={16} className="text-gray-400 shrink-0" />
              <span className="text-xs font-bold w-6 text-center text-muted-foreground">{i + 1}</span>
              {thumb && <img src={thumb} alt="" className="w-12 h-8 object-cover rounded shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{l.title || `Lesson ${i + 1}`}</div>
                {l.duration && <div className="text-xs text-muted-foreground">{l.duration}</div>}
              </div>
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"><ArrowUp size={14} /></button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === lessons.length - 1} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"><ArrowDown size={14} /></button>
              <button type="button" onClick={() => setOpenIdx(isOpen ? null : i)} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              <button type="button" onClick={() => remove(i)} className="p-1.5 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-950"><Trash2 size={14} /></button>
            </div>

            {isOpen && (
              <div className="p-4 space-y-3 border-t">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2 space-y-1.5">
                    <Label className="text-xs">Lesson title *</Label>
                    <Input value={l.title} onChange={(e) => update(i, "title", e.target.value)} placeholder="e.g. Introduction to Python" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Duration</Label>
                    <Input value={l.duration} onChange={(e) => update(i, "duration", e.target.value)} placeholder="12:35" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">YouTube video URL *</Label>
                  <Input value={l.videoUrl} onChange={(e) => update(i, "videoUrl", e.target.value)} placeholder="https://youtu.be/..." />
                </div>

                {youtubeEmbedUrl(l.videoUrl) && (
                  <div className="aspect-video rounded-md overflow-hidden bg-black">
                    <iframe src={youtubeEmbedUrl(l.videoUrl)} title={l.title} allowFullScreen className="w-full h-full" />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-xs">Description</Label>
                  <Textarea rows={3} value={l.description} onChange={(e) => update(i, "description", e.target.value)} />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs">Resources</Label>
                    <button type="button" onClick={() => addResource(i)} className="text-xs text-indigo-500 hover:underline">+ Add resource</button>
                  </div>
                  {(l.resources || []).map((r, ri) => (
                    <div key={ri} className="flex items-center gap-2 mb-2">
                      <Input value={r.label} onChange={(e) => updateResource(i, ri, "label", e.target.value)} placeholder="Label" className="flex-1" />
                      <Input value={r.url} onChange={(e) => updateResource(i, ri, "url", e.target.value)} placeholder="https://..." className="flex-1" />
                      <button type="button" onClick={() => removeResource(i, ri)} className="p-1.5 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-950"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      <Button type="button" variant="outline" onClick={add} className="w-full">
        <Plus size={16} className="mr-1" /> Add lesson
      </Button>
    </div>
  );
}
