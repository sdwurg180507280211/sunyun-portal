"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {Button, Card, Form, Input, Label, TextField} from "@heroui/react";

export function LoginForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: {"content-type": "application/json"},
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });
    const data = (await response.json()) as {ok: boolean; message?: string};
    setSubmitting(false);
    if (!response.ok || !data.ok) {
      setMessage(data.message || "登录失败");
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md" variant="tertiary">
      <Card.Header><Card.Title className="text-2xl">软件项目线索后台</Card.Title><Card.Description>使用管理员账号登录，Cookie 仅由服务端读取。</Card.Description></Card.Header>
      <Card.Content>
        <Form className="grid gap-4" onSubmit={onSubmit}>
          <TextField isRequired name="username"><Label>用户名</Label><Input autoComplete="username" /></TextField>
          <TextField isRequired name="password" type="password"><Label>密码</Label><Input autoComplete="current-password" /></TextField>
          <Button className="mt-2" isPending={submitting} type="submit" variant="primary">{submitting ? "登录中" : "登录"}</Button>
          <p aria-live="polite" className="text-sm text-red-700">{message}</p>
        </Form>
      </Card.Content>
    </Card>
  );
}
