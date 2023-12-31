import { KeyboardLayoutParameters, KeyboardRowParameters } from "./keyboard-model"

const functionDesktopANSI: KeyboardRowParameters = {
  fontsize:0.03,
  keys: [
    { keycode: 'Escape', text: ['Esc'] },
    { keycode: '', text: '' },
    { keycode: 'F1', text: ['F1'] },
    { keycode: 'F2', text: ['F2'] },
    { keycode: 'F3', text: ['F3'] },
    { keycode: 'F4', text: ['F4'] },
    { keycode: '', text: '', keywidth: 0.06 },
    { keycode: 'F5', text: ['F5'] },
    { keycode: 'F6', text: ['F6'] },
    { keycode: 'F7', text: ['F7'] },
    { keycode: 'F8', text: ['F8'] },
    { keycode: '', text: '', keywidth: 0.06 },
    { keycode: 'F9', text: ['F9'] },
    { keycode: 'F10', text: ['F10'] },
    { keycode: 'F11', text: ['F11'] },
    { keycode: 'F12', text: ['F12'] },
  ]
}

const row1DesktopANSI: KeyboardRowParameters = {
  keys: [
    { keycode: 'Backquote', text: ['`', '~'] },
    { keycode: 'Digit1', text: ['1', '!'] },
    { keycode: 'Digit2', text: ['2', '@'] },
    { keycode: 'Digit3', text: ['3', '#'] },
    { keycode: 'Digit4', text: ['4', '$'] },
    { keycode: 'Digit5', text: ['5', '%'] },
    { keycode: 'Digit6', text: ['6', '^'] },
    { keycode: 'Digit7', text: ['7', '&'] },
    { keycode: 'Digit8', text: ['8', '*'] },
    { keycode: 'Digit9', text: ['9', '('] },
    { keycode: 'Digit0', text: ['0', ')'] },
    { keycode: 'Minus', text: ['-', '_'] },
    { keycode: 'Equal', text: ['=', '+'] },
    { keycode: 'Backspace', text: 'backspace', keywidth:0.26 },
  ]
}

const row2DesktopANSI: KeyboardRowParameters = {
  keys: [
    { keycode: 'Tab', text: 'keyboard_tab', keywidth: 0.17 },
    { keycode: 'KeyQ', text: ['q', 'Q'] },
    { keycode: 'KeyW', text: ['w', 'W'] },
    { keycode: 'KeyE', text: ['e', 'E'] },
    { keycode: 'KeyR', text: ['r', 'R'] },
    { keycode: 'KeyT', text: ['t', 'T'] },
    { keycode: 'KeyY', text: ['y', 'Y'] },
    { keycode: 'KeyU', text: ['u', 'U'] },
    { keycode: 'KeyI', text: ['i', 'I'] },
    { keycode: 'KeyO', text: ['o', 'O'] },
    { keycode: 'KeyP', text: ['p', 'P'] },
    { keycode: 'BracketLeft', text: ['[', '{'] },
    { keycode: 'BracketRight', text: [']', '}'] },
    { keycode: 'Backslash', text: ['\\', '|'], keywidth: 0.19 },
  ]
}

const row3DesktopANSI: KeyboardRowParameters = {
  keys: [
    { keycode: 'CapsLock', text: 'keyboard_capslock', keywidth:0.17 },
    { keycode: 'KeyA', text: ['a', 'A'] },
    { keycode: 'KeyS', text: ['s', 'S'] },
    { keycode: 'KeyD', text: ['d', 'D'] },
    { keycode: 'KeyF', text: ['f', 'F'] },
    { keycode: 'KeyG', text: ['g', 'G'] },
    { keycode: 'KeyH', text: ['h', 'H'] },
    { keycode: 'KeyJ', text: ['j', 'J'] },
    { keycode: 'KeyK', text: ['k', 'K'] },
    { keycode: 'KeyL', text: ['l', 'L'] },
    { keycode: 'Semicolon', text: [';', ':'] },
    { keycode: 'Quote', text: ["'", '"'] },
    { keycode: 'Enter', text: 'keyboard_return', keywidth: 0.31 },
  ]
}

const row4DesktopANSI: KeyboardRowParameters = {
  keys: [
    { keycode: 'ShiftLeft', text: 'keyboard_double_arrow_up', keywidth: 0.25 },
    { keycode: 'KeyZ', text: ['z', 'Z'] },
    { keycode: 'KeyX', text: ['x', 'X'] },
    { keycode: 'KeyC', text: ['c', 'C'] },
    { keycode: 'KeyV', text: ['v', 'V'] },
    { keycode: 'KeyB', text: ['b', 'B'] },
    { keycode: 'KeyN', text: ['n', 'N'] },
    { keycode: 'KeyM', text: ['m', 'M'] },
    { keycode: 'Comma', text: [',', '<'] },
    { keycode: 'Period', text: ['.', '>'] },
    { keycode: 'Slash', text: ['/', '?'] },
    { keycode: 'ShiftRight', text: 'keyboard_double_arrow_up', keywidth: 0.35 },
  ]
}
const row5DesktopANSI: KeyboardRowParameters = {
  keys: [
    { keycode: 'ControlLeft', text: 'keyboard_control_key', keywidth: 0.17 },
    { keycode: 'MetaLeft', text: 'desktop_windows', keywidth: 0.13 },
    { keycode: 'AltLeft', text: 'keyboard_option_key', keywidth: 0.15 },
    { keycode: 'Space', text: [' '], keywidth: 0.69 },
    { keycode: 'AltRight', text: 'keyboard_option_key', keywidth: 0.13 },
    { keycode: 'MetaRight', text: 'desktop_windows', keywidth: 0.13 },
    { keycode: 'ContextMenu', text: 'menu_open', keywidth: 0.13 },
    { keycode: 'ControlRight', text: 'keyboard_control_key', keywidth: 0.15 },
  ]
}

export const englishDesktopANSI: KeyboardLayoutParameters = {
  rows: [functionDesktopANSI, row1DesktopANSI, row2DesktopANSI, row3DesktopANSI, row4DesktopANSI, row5DesktopANSI]
}
