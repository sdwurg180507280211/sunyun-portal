"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {Button, Card, Chip, Input} from "@heroui/react";

type Status = "new" | "contacted" | "qualified" | "won" | "closed";
type Lead = {
  id: string; createdAt: string; serviceType: string; companyName: string; contactName: string;
  phone: string; wechat: string; city: string; expectedDate: string; scale: string; budget: string;
  description: string; source: string; status: Status; updatedAt: string;
};

const statusText: Record<Status, string> = {new: "新线索", contacted: "已联系", qualified: "已确认", won: "已成交", closed: "已关闭"};
const statusColor: Record<Status, "accent" | "warning" | "success" | "danger" | undefined> = {new: "accent", contacted: "warning", qualified: "success", won: "success", closed: undefined};

export function AdminDashboard({username}: {username: string}) {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({q: query, status, limit: "200"});
    const response = await fetch(`/api/leads?${params}`, {cache: "no-store"});
    if (response.status === 401) {
      router.replace("/admin/login");
      router.refresh();
      return;
    }
    const data = (await response.json()) as {ok: boolean; leads?: Lead[]; stats?: Record<string, number>; total?: number; message?: string};
    setLoading(false);
    if (!response.ok || !data.ok) {
      setMessage(data.message || "加载失败");
      return;
    }
    setLeads(data.leads || []); setStats(data.stats || {}); setTotal(data.total || 0); setMessage("");
  }, [query, status, router]);

  useEffect(() => {void load();}, [load]);

  async function changeStatus(id: string, nextStatus: Status) {
    const response = await fetch(`/api/leads/${encodeURIComponent(id)}`, {method: "PATCH", headers: {"content-type": "application/json"}, body: JSON.stringify({status: nextStatus})});
    if (!response.ok) {setMessage("状态更新失败"); return;}
    setLeads((current) => current.map((lead) => lead.id === id ? {...lead, status: nextStatus} : lead));
    setMessage("状态已更新");
  }

  async function logout() {
    await fetch("/api/admin/session", {method: "DELETE"});
    router.replace("/admin/login"); router.refresh();
  }

  const csv = useMemo(() => {
    const headers = ["编号", "创建时间", "项目类型", "客户单位", "联系人", "电话", "微信", "城市", "期望上线", "规模", "预算", "状态", "需求描述"];
    const rows = leads.map((lead) => [lead.id, lead.createdAt, lead.serviceType, lead.companyName, lead.contactName, lead.phone, lead.wechat, lead.city, lead.expectedDate, lead.scale, lead.budget, statusText[lead.status], lead.description]);
    return [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  }, [leads]);

  function exportCsv() {
    const blob = new Blob(["\uFEFF", csv], {type: "text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `sunyun-leads-${new Date().toISOString().slice(0, 10)}.csv`; anchor.click(); URL.revokeObjectURL(url);
  }

  return (
    <main className="site-shell min-h-screen py-10">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div><p className="section-kicker">Lead workspace</p><h1 className="mt-2 text-4xl font-bold tracking-tight">软件项目线索后台</h1><p className="mt-2 text-sm text-[var(--muted)]">当前管理员：{username}</p></div>
        <div className="flex gap-2"><Button onPress={exportCsv} variant="outline">导出 CSV</Button><Button onPress={logout} variant="tertiary">退出</Button></div>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[['全部', total], ['新线索', stats.new || 0], ['已联系', stats.contacted || 0], ['已确认', stats.qualified || 0], ['已成交', stats.won || 0]].map(([label, value]) => <Card key={String(label)}><Card.Header><Card.Description>{label}</Card.Description><Card.Title className="text-3xl">{value}</Card.Title></Card.Header></Card>)}
      </section>

      <Card className="mt-6" variant="default">
        <Card.Content>
          <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
            <Input aria-label="搜索线索" onChange={(event) => setQuery(event.target.value)} placeholder="搜索单位、联系人、电话、需求" value={query} />
            <select className="native-control" onChange={(event) => setStatus(event.target.value)} value={status}><option value="">全部状态</option>{Object.entries(statusText).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
            <Button onPress={() => void load()} variant="primary">刷新</Button>
          </div>
          <p aria-live="polite" className="mt-3 text-sm text-[var(--muted)]">{loading ? "正在加载…" : message || `当前显示 ${leads.length} 条`}</p>
        </Card.Content>
      </Card>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--border)] bg-white">
        <table className="admin-table">
          <thead><tr><th>时间 / 编号</th><th>客户</th><th>项目与需求</th><th>预算 / 时间</th><th>状态</th></tr></thead>
          <tbody>{leads.map((lead) => <tr key={lead.id}>
            <td className="min-w-44"><strong>{new Date(lead.createdAt).toLocaleString("zh-CN")}</strong><br /><span className="text-xs text-[var(--muted)]">{lead.id}</span></td>
            <td className="min-w-48"><strong>{lead.companyName || "未填写单位"}</strong><br />{lead.contactName} · {lead.phone}<br /><span className="text-xs text-[var(--muted)]">{lead.wechat || "无微信"} · {lead.city || "未填城市"}</span></td>
            <td className="min-w-80"><Chip color="accent">{lead.serviceType}</Chip><p className="mt-2 max-w-xl leading-6">{lead.description}</p></td>
            <td className="min-w-40">{lead.budget || "待评估"}<br /><span className="text-xs text-[var(--muted)]">{lead.expectedDate || "时间待沟通"} · {lead.scale || "规模待沟通"}</span></td>
            <td className="min-w-36"><Chip color={statusColor[lead.status]}>{statusText[lead.status]}</Chip><select aria-label={`更新 ${lead.id} 状态`} className="native-control mt-2 min-h-9 py-1 text-xs" onChange={(event) => void changeStatus(lead.id, event.target.value as Status)} value={lead.status}>{Object.entries(statusText).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></td>
          </tr>)}</tbody>
        </table>
        {!loading && !leads.length ? <p className="p-10 text-center text-[var(--muted)]">暂无符合条件的线索</p> : null}
      </div>
    </main>
  );
}
