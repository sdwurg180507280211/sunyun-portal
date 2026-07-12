import {z} from "zod";

const text = (max: number) => z.string().trim().max(max).default("");
const requiredText = (max: number, message: string) =>
  z.preprocess(
    (value) => value ?? "",
    z.string().trim().min(1, message).max(max),
  );

export const leadSchema = z.object({
  serviceType: z.string().trim().min(1, "请选择项目类型").max(60),
  companyName: requiredText(80, "请填写单位名称"),
  contactName: z.string().trim().min(1, "请填写联系人").max(40),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{6,24}$/, "联系电话格式不正确"),
  wechat: text(60),
  city: text(60),
  expectedDate: text(40),
  scale: text(40),
  budget: text(40),
  description: z.string().trim().min(10, "请至少填写 10 个字的需求描述").max(1200),
  source: text(80).transform((value) => value || "homepage"),
  website: text(120),
  consent: z.union([z.literal(true), z.literal("on"), z.literal("true")]),
});

export type LeadInput = z.infer<typeof leadSchema>;

export function parseLeadInput(input: unknown) {
  return leadSchema.safeParse(input);
}
