export interface SkillSummary {
  name: string;
  description: string;
  skillMdPath: string;
}

export type SkillLoadResult =
  | { kind: 'ok'; skill: SkillSummary }
  | { kind: 'malformed'; name: string; reason: string };
