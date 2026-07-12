"use client";

import {useState} from "react";
import {Button, Form, Input, Label, TextArea, TextField} from "@heroui/react";
import {submitLead, type SubmitState} from "@/components/lead-form/submit-lead";
import {brand} from "@/lib/brand";

const consultationOptions = [
  "医药业务系统",
  "数据平台与分析",
  "AI 工作流工具",
  "系统集成",
  "数字化咨询与原型",
  "隐私与个人信息",
] as const;

type FormState = {type: "idle" | SubmitState["type"]; message: string};

export function LeadForm() {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<FormState>({type: "idle", message: ""});

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setResult({type: "idle", message: ""});
    const form = event.currentTarget;
    try {
      const outcome = await submitLead(Object.fromEntries(new FormData(form).entries()));
      setResult(outcome);
      if (outcome.type === "success") form.reset();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form className="grid gap-4" onSubmit={onSubmit}>
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="serviceType">咨询方向 *</label>
          <select className="native-control" defaultValue="" id="serviceType" name="serviceType" required>
            <option disabled value="">请选择咨询方向</option>
            {consultationOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </div>
        <TextField isRequired name="companyName">
          <Label className="text-slate-200">单位名称</Label>
          <Input className="min-h-11" placeholder="公司或机构名称" />
        </TextField>
        <TextField isRequired name="contactName">
          <Label className="text-slate-200">联系人</Label>
          <Input className="min-h-11" placeholder="怎么称呼您" />
        </TextField>
        <TextField isRequired name="phone">
          <Label className="text-slate-200">联系电话</Label>
          <Input className="min-h-11" inputMode="tel" placeholder="手机或座机" />
        </TextField>
      </div>
      <TextField isRequired minLength={10} name="description">
        <Label className="text-slate-200">业务场景与目标</Label>
        <TextArea rows={6} placeholder="请简要说明当前流程、主要使用角色、已有系统或数据条件，以及希望改善的环节。" />
      </TextField>
      <p className="rounded-lg border border-blue-200/25 bg-blue-400/10 p-3 text-sm leading-6 text-slate-200">请勿填写患者、受试者、病历、处方、身份证件或其他敏感个人信息。</p>
      <details className="rounded-xl border border-white/15 bg-white/5 p-4">
        <summary className="flex min-h-11 cursor-pointer items-center font-bold">补充信息（选填）</summary>
        <div className="form-grid mt-4">
          <TextField name="wechat"><Label className="text-slate-200">微信</Label><Input className="min-h-11" /></TextField>
          <TextField name="city"><Label className="text-slate-200">所在地区</Label><Input className="min-h-11" /></TextField>
          <TextField name="expectedDate"><Label className="text-slate-200">期望启动时间</Label><Input className="min-h-11" /></TextField>
          <TextField name="scale"><Label className="text-slate-200">预期使用范围</Label><Input className="min-h-11" /></TextField>
          <TextField name="budget"><Label className="text-slate-200">预算情况</Label><Input className="min-h-11" /></TextField>
        </div>
      </details>
      <input aria-hidden="true" autoComplete="off" className="hidden" name="website" tabIndex={-1} />
      <input name="source" type="hidden" value={brand.consultationSource} />
      <label className="flex items-start gap-3 text-sm leading-6 text-slate-300">
        <input className="mt-1 size-4" name="consent" required type="checkbox" />
        <span>我已阅读并同意 <a className="font-bold text-blue-200 underline" href="/privacy">《隐私说明》</a>，同意{brand.legalName}为回复本次商务咨询处理上述信息。</span>
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <Button className="min-h-11" isPending={submitting} type="submit" variant="primary">{submitting ? "正在提交" : "提交商务咨询"}</Button>
        <span aria-live="polite" className={result.type === "error" ? "text-sm text-red-300" : "text-sm text-emerald-200"} role={result.type === "error" ? "alert" : undefined}>{result.message}</span>
      </div>
    </Form>
  );
}
