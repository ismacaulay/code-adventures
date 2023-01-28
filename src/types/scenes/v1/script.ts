export enum ScriptComponentTypeV1 {
  Script = 'script',
}

interface BaseScriptComponentV1 {
  type: ScriptComponentTypeV1;
  base?: string;
}

export interface ScriptComponentV1 extends BaseScriptComponentV1 {
  type: ScriptComponentTypeV1.Script;

  location: string;
}
