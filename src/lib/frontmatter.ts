import * as v from 'valibot';

// frontmatterのスキーマを定義
export const frontMatterSchema = v.object({
  title: v.string(),
  description: v.string(),
  publishedTime: v.string(),
  modifiedTime: v.optional(v.string()),
  tags: v.nullable(v.array(v.string())),
});

// frontmatterの型を推論
export type FrontMatter = v.InferOutput<typeof frontMatterSchema>;
