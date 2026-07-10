"use client";

import {useState} from "react";
import {Button, Form, Input, Label, TextArea, TextField} from "@heroui/react";

type SubmitState = {type: "idle" | "success" | "error"; message: string};

export function LeadForm() {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitState>({type: "idle", message: ""});

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setResult({type: "idle", message: ""});

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {"content-type": "application/json"},
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as {ok: boolean; message?: string; id?: string; nextStep?: string};
      if (!response.ok || !data.ok) throw new Error(data.message || "提交失败");

      setResult({
        type: "success",
        message: `${data.message || "提交成功"}${data.id ? `（编号 ${data.id}）` : ""}。${data.nextStep || ""}`,
      });
      form.reset();
    } catch (error) {
      setResult({type: "error", message: error instanceof Error ? error.message : "提交失败，请稍后重试"});
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form className="grid gap-4" onSubmit={onSubmit}>
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="serviceType">项目类型 *</label>
          <select className="native-control" id="serviceType" name="serviceType" required defaultValue="">
            <option value="" disabled>请选择项目类型</option>
            <option>软件定制开发</option>
            <option>业务后台 / 内部工具</option>
            <option>官网 / 小程序 / 落地页</option>
            <option>数据看板与报表</option>
            <option>IT 咨询与工具选型</option>
            <option>活动数字化支持</option>
          </select>
        </div>
        <TextField name="companyName">
          <Label>客户单位</Label>
          <Input placeholder="公司或团队名称" />
        </TextField>
        <TextField isRequired name="contactName">
          <Label>联系人</Label>
          <Input placeholder="怎么称呼您" />
        </TextField>
        <TextField isRequired name="phone">
          <Label>联系电话</Label>
          <Input inputMode="tel" placeholder="手机或座机" />
        </TextField>
        <TextField name="wechat">
          <Label>微信</Label>
          <Input placeholder="便于进一步沟通" />
        </TextField>
        <TextField name="city">
          <Label>所在城市</Label>
          <Input placeholder="北京 / 上海 / 远程" />
        </TextField>
        <TextField name="expectedDate">
          <Label>期望上线时间</Label>
          <Input placeholder="例如：两个月内" />
        </TextField>
        <TextField name="scale">
          <Label>使用人数 / 数据规模</Label>
          <Input placeholder="例如：50 人内部使用" />
        </TextField>
      </div>

      <TextField name="budget">
        <Label>预算范围</Label>
        <Input placeholder="可填写预算，也可写待评估" />
      </TextField>
      <TextField isRequired minLength={10} name="description">
        <Label>需求描述</Label>
        <TextArea rows={6} placeholder="请说明业务目标、主要使用者、希望解决的问题以及已有资料。" />
      </TextField>

      <input aria-hidden="true" autoComplete="off" className="hidden" name="website" tabIndex={-1} />
      <input name="source" type="hidden" value="homepage-heroui" />
      <label className="flex items-start gap-3 text-sm text-[var(--muted)]">
        <input className="mt-1 size-4" name="consent" required type="checkbox" />
        <span>同意榫合云为沟通本次项目需求保存并使用以上信息。</span>
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <Button isPending={submitting} type="submit" variant="primary">
          {submitting ? "正在提交" : "提交项目需求"}
        </Button>
        <span aria-live="polite" className={result.type === "error" ? "text-sm text-red-700" : "text-sm text-emerald-700"}>
          {result.message}
        </span>
      </div>
    </Form>
  );
}
