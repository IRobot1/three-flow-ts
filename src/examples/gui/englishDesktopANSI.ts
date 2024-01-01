import { KeyboardLayoutParameters, KeyboardRowParameters } from "./keyboard-model"

const functionDesktopANSI: KeyboardRowParameters = {
  fontsize: 0.03,
  keys: [
    { keycode: 'Escape', text: 'Esc' },
    { keycode: '', text: '' },
    { keycode: 'F1', text: 'F1' },
    { keycode: 'F2', text: 'F2' },
    { keycode: 'F3', text: 'F3' },
    { keycode: 'F4', text: 'F4' },
    { keycode: '', text: '', keywidth: 0.06 },
    { keycode: 'F5', text: 'F5' },
    { keycode: 'F6', text: 'F6' },
    { keycode: 'F7', text: 'F7' },
    { keycode: 'F8', text: 'F8' },
    { keycode: '', text: '', keywidth: 0.06 },
    { keycode: 'F9', text: 'F9' },
    { keycode: 'F10', text: 'F10' },
    { keycode: 'F11', text: 'F11' },
    { keycode: 'F12', text: 'F12' },
  ]
}

const row1DesktopANSI: KeyboardRowParameters = {
  keys: [
    { keycode: 'Backquote', keys: ['`', '~'] },
    { keycode: 'Digit1', keys: ['1', '!'] },
    { keycode: 'Digit2', keys: ['2', '@'] },
    { keycode: 'Digit3', keys: ['3', '#'] },
    { keycode: 'Digit4', keys: ['4', '$'] },
    { keycode: 'Digit5', keys: ['5', '%'] },
    { keycode: 'Digit6', keys: ['6', '^'] },
    { keycode: 'Digit7', keys: ['7', '&'] },
    { keycode: 'Digit8', keys: ['8', '*'] },
    { keycode: 'Digit9', keys: ['9', '('] },
    { keycode: 'Digit0', keys: ['0', ')'] },
    { keycode: 'Minus', keys: ['-', '_'] },
    { keycode: 'Equal', keys: ['=', '+'] },
    { keycode: 'Backspace', text: 'backspace', isicon: true, keywidth: 0.26 },
  ]
}

const row2DesktopANSI: KeyboardRowParameters = {
  keys: [
    { keycode: 'Tab', text: 'keyboard_tab', isicon: true, keywidth: 0.17 },
    { keycode: 'KeyQ', keys: ['q', 'Q'] },
    { keycode: 'KeyW', keys: ['w', 'W'] },
    { keycode: 'KeyE', keys: ['e', 'E'] },
    { keycode: 'KeyR', keys: ['r', 'R'] },
    { keycode: 'KeyT', keys: ['t', 'T'] },
    { keycode: 'KeyY', keys: ['y', 'Y'] },
    { keycode: 'KeyU', keys: ['u', 'U'] },
    { keycode: 'KeyI', keys: ['i', 'I'] },
    { keycode: 'KeyO', keys: ['o', 'O'] },
    { keycode: 'KeyP', keys: ['p', 'P'] },
    { keycode: 'BracketLeft', keys: ['[', '{'] },
    { keycode: 'BracketRight', keys: [']', '}'] },
    { keycode: 'Backslash', keys: ['\\', '|'], keywidth: 0.19 },
  ]
}

const row3DesktopANSI: KeyboardRowParameters = {
  keys: [
    { keycode: 'CapsLock', text: 'keyboard_capslock', isicon: true, keywidth: 0.17 },
    { keycode: 'KeyA', keys: ['a', 'A'] },
    { keycode: 'KeyS', keys: ['s', 'S'] },
    { keycode: 'KeyD', keys: ['d', 'D'] },
    { keycode: 'KeyF', keys: ['f', 'F'] },
    { keycode: 'KeyG', keys: ['g', 'G'] },
    { keycode: 'KeyH', keys: ['h', 'H'] },
    { keycode: 'KeyJ', keys: ['j', 'J'] },
    { keycode: 'KeyK', keys: ['k', 'K'] },
    { keycode: 'KeyL', keys: ['l', 'L'] },
    { keycode: 'Semicolon', keys: [';', ':'] },
    { keycode: 'Quote', keys: ["'", '"'] },
    { keycode: 'Enter', text: 'keyboard_return', isicon: true, keywidth: 0.31 },
  ]
}

const row4DesktopANSI: KeyboardRowParameters = {
  keys: [
    { keycode: 'ShiftLeft', text: 'keyboard_double_arrow_up', isicon: true, keywidth: 0.25 },
    { keycode: 'KeyZ', keys: ['z', 'Z'] },
    { keycode: 'KeyX', keys: ['x', 'X'] },
    { keycode: 'KeyC', keys: ['c', 'C'] },
    { keycode: 'KeyV', keys: ['v', 'V'] },
    { keycode: 'KeyB', keys: ['b', 'B'] },
    { keycode: 'KeyN', keys: ['n', 'N'] },
    { keycode: 'KeyM', keys: ['m', 'M'] },
    { keycode: 'Comma', keys: [',', '<'] },
    { keycode: 'Period', keys: ['.', '>'] },
    { keycode: 'Slash', keys: ['/', '?'] },
    { keycode: 'ShiftRight', text: 'keyboard_double_arrow_up', isicon: true, keywidth: 0.35 },
  ]
}
const row5DesktopANSI: KeyboardRowParameters = {
  keys: [
    { keycode: 'ControlLeft', text: 'keyboard_control_key', isicon: true, keywidth: 0.17 },
    { keycode: 'MetaLeft', text: 'desktop_windows', isicon: true, keywidth: 0.13 },
    { keycode: 'AltLeft', text: 'keyboard_option_key', isicon: true, keywidth: 0.15 },
    { keycode: 'Space', text: ' ', keys: [' '], keywidth: 0.69 },
    { keycode: 'AltRight', text: 'keyboard_option_key', isicon: true, keywidth: 0.13 },
    { keycode: 'MetaRight', text: 'desktop_windows', isicon: true, keywidth: 0.13 },
    { keycode: 'ContextMenu', text: 'menu_open', isicon: true, keywidth: 0.13 },
    { keycode: 'ControlRight', text: 'keyboard_control_key', isicon: true, keywidth: 0.15 },
  ]
}

export const englishDesktopANSI: KeyboardLayoutParameters = {
  rows: [
    functionDesktopANSI,
    row1DesktopANSI,
    row2DesktopANSI,
    row3DesktopANSI,
    row4DesktopANSI,
    row5DesktopANSI
  ]
}
