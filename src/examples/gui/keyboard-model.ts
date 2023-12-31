export interface KeyOptions {
  keywidth?: number // default is 0.1
  hspacing?: number // default is 0.02
  keyheight?: number // default is 0.1
  vspacing?: number // defautl is 0.02
  fontsize?: number // default is 0.05
}

export interface KeyParameters {
  keywidth?: number  // option to override default width for this row
  fontsize?: number // option to override default font size for this key
  keycode: string    // keyboard event code or key (if code is blank)
  text: Array<string> | string  // when string icon name, when array character index depends on state - lower, upper, other
}

// option to override layout defaults
export interface KeyboardRowParameters extends KeyOptions {
  keys: Array<KeyParameters>
}

export interface KeyboardLayoutParameters extends KeyOptions {
  rows: Array<KeyboardRowParameters>
}
