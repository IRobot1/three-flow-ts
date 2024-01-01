import { BaseEvent, Mesh, Object3DEventMap } from "three"
import { UIKeyboardEvent } from "./keyboard";

export type InputFieldType = 'text' | 'number' | string

export enum InputFieldEventType {
  ACTIVE_CHANGED = 'active_changed',
  DISABLE_CHANGED = 'disable_changed',
  TEXT_CHANGED = 'text_changed',
  KEYDOWN = 'keydown',
}

export interface InputField extends Mesh {
  inputtype: InputFieldType
  text: string
  active: boolean
  disabled: boolean
}
