import {leadCopy} from "@/lib/brand";

export type SubmitState = {type: "success" | "error"; message: string};
type Requester = (url: string, init: RequestInit) => Promise<Response>;
type LeadResponse = {ok: boolean; id?: string; message?: string; nextStep?: string};

export async function submitLead(
  payload: Record<string, FormDataEntryValue>,
  request: Requester = fetch,
): Promise<SubmitState> {
  try {
    const response = await request("/api/leads", {
      method: "POST",
      headers: {"content-type": "application/json"},
      body: JSON.stringify(payload),
    });
    if (!response.headers.get("content-type")?.includes("application/json")) {
      return {type: "error", message: leadCopy.networkError};
    }
    const data = (await response.json()) as LeadResponse;
    if (!response.ok || !data.ok) {
      return {type: "error", message: data.message || leadCopy.networkError};
    }
    const id = data.id ? `（编号 ${data.id}）` : "";
    const nextStep = data.nextStep ? `。${data.nextStep}` : "";
    return {
      type: "success",
      message: `${data.message || leadCopy.accepted}${id}${nextStep}`,
    };
  } catch {
    return {type: "error", message: leadCopy.networkError};
  }
}
