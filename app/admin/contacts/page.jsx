"use client";

import PageHeader from "@/components/admin/PageHeader";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { adminApi } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils";
import {
  CheckCircle2,
  Inbox,
  LoaderCircle,
  Mail,
  MailOpen,
  Reply,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const TABS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "read", label: "Read" },
];

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const { confirm, Dialog } = useConfirm();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi().get(`/api/v1/contact?filter=${tab}`);
      if (data.success) {
        setMessages(data.messages);
        setUnread(data.unread);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [tab]);

  const counts = useMemo(() => {
    const c = { all: messages.length, unread: 0, read: 0 };
    messages.forEach((m) => (m.read ? c.read++ : c.unread++));
    return c;
  }, [messages]);

  const toggleRead = async (id, currentRead) => {
    try {
      const { data } = await adminApi().patch(`/api/v1/contact/${id}`, {
        read: !currentRead,
      });
      if (data.success) {
        toast.success(!currentRead ? "Marked as read" : "Marked as unread");
        load();
      }
    } catch {
      toast.error("Failed");
    }
  };

  const markReplied = async (id) => {
    try {
      const { data } = await adminApi().patch(`/api/v1/contact/${id}`, {
        read: true,
        replied: true,
      });
      if (data.success) {
        toast.success("Marked as replied");
        load();
      }
    } catch {
      toast.error("Failed");
    }
  };

  const onDelete = async (id) => {
    if (
      !(await confirm({
        title: "Delete message?",
        description: "This permanently removes the contact message.",
      }))
    )
      return;
    try {
      const { data } = await adminApi().delete(`/api/v1/contact/${id}`);
      if (data.success) {
        toast.success("Deleted");
        load();
      }
    } catch {
      toast.error("Failed");
    }
  };

  const openMessage = (m) => {
    setExpanded(expanded === m._id ? null : m._id);
    if (!m.read) toggleRead(m._id, false);
  };

  return (
    <div>
      <PageHeader
        title="Contact Messages"
        description={`Messages submitted from the public Get in Touch form. ${unread} unread.`}
      />

      <div className="flex flex-wrap items-center gap-2 mb-5 border-b border-gray-200 dark:border-white/10">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 -mb-px border-b-2 text-sm font-medium transition ${
              tab === t.key
                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {t.label}
            {t.key === "unread" && counts.unread > 0 && (
              <span className="ml-2 inline-flex items-center justify-center text-[10px] font-bold w-5 h-5 rounded-full bg-amber-500 text-white">
                {counts.unread}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoaderCircle className="animate-spin" />
        </div>
      ) : messages.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Inbox size={36} className="mx-auto mb-3 opacity-50" />
            <p>No messages in this view.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => {
            const isOpen = expanded === m._id;
            return (
              <Card
                key={m._id}
                className={!m.read ? "border-l-4 border-l-indigo-500" : ""}
              >
                <CardContent className="p-4">
                  <button
                    onClick={() => openMessage(m)}
                    className="w-full text-left flex items-start gap-3"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        m.read
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-500"
                          : "bg-indigo-500 text-white"
                      }`}
                    >
                      {m.read ? <MailOpen size={18} /> : <Mail size={18} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`truncate ${
                            m.read ? "font-medium" : "font-semibold"
                          }`}
                        >
                          {m.name}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          &lt;{m.email}&gt;
                        </span>
                        {m.repliedAt && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-green-500/15 text-green-700 dark:text-green-400">
                            <CheckCircle2 size={10} /> Replied
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-sm text-gray-600 dark:text-gray-300 mt-1 ${
                          isOpen ? "" : "line-clamp-1"
                        }`}
                      >
                        {m.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDateTime(m.createdAt)}
                      </p>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-white/5 flex-wrap">
                      <a
                        href={`mailto:${m.email}?subject=${encodeURIComponent(
                          `Re: TPI CPC contact from ${m.name}`
                        )}&body=${encodeURIComponent(
                          `Hi ${m.name},\n\nThanks for reaching out!\n\n— TPI CPC\n\n---\n> ${m.message.replace(/\n/g, "\n> ")}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => markReplied(m._id)}
                      >
                        <Button
                          size="sm"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          <Reply size={14} className="mr-1" /> Reply via email
                        </Button>
                      </a>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleRead(m._id, m.read)}
                      >
                        {m.read ? (
                          <>
                            <Mail size={14} className="mr-1" /> Mark unread
                          </>
                        ) : (
                          <>
                            <MailOpen size={14} className="mr-1" /> Mark read
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDelete(m._id)}
                        className="text-red-600 ml-auto"
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog />
    </div>
  );
}
