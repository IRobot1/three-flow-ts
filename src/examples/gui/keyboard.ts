import { Mesh, Vector3 } from "three";
import { ThreeInteractive } from "three-flow";

import { UIButton } from "./button";
import { ButtonParameters, PositionParameters, UIOptions } from "./model";

export interface KeyboardParameters {

}
export interface KeyboardOptions extends UIOptions {

}

class KeySetting {
  constructor(public position: Vector3, public lower: string,
    public upper?: string, public alpha?: string,
    public size = 0.1, public fontsize = 0.15) { }
}

type KeyCase = 'lower' | 'upper' | 'numbers';


export class UIKeyboard extends Mesh {
  keys: Array<KeySetting> = []

  allowenter = true
  constructor(private parameters: KeyboardParameters, private interactive: ThreeInteractive, private options: KeyboardOptions = {}) {
    super()

    const keys: Array<KeySetting> = []

    const top = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']
    const topalpha = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
    const middle = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l']
    const middlealpha = ['#', '$', '_', '&', '-', '+', '(', ')', '`']
    const bottom = ['z', 'x', 'c', 'v', 'b', 'n', 'm']
    const bottomalpha = ['*', '"', "'", '<', ';', '!', '~']

    const buttonwidth = 0.11
    const z = 0.001;
    const ytop = 0.17
    const ymiddle = 0.06
    const ybottom = -0.05
    const yspace = -0.16

    let width = (top.length - 1) * buttonwidth;
    top.forEach((lower, index) => {
      keys.push(new KeySetting(new Vector3((-width / 2 + index * buttonwidth), ytop, z), lower, lower.toUpperCase(), topalpha[index]));
    })
    keys.push(new KeySetting(new Vector3((width / 2 + 0.35), 0.16, z), 'content_copy', 'icon', 'ctrl+c'));
    keys.push(new KeySetting(new Vector3((width / 2 + 0.35), 0, z), 'content_cut', 'icon', 'ctrl+x'));
    keys.push(new KeySetting(new Vector3((width / 2 + 0.35), -0.16, z), 'content_paste', 'icon', 'ctrl+v'));

    width = (middle.length - 1) * (buttonwidth + 0.01);
    middle.forEach((lower, index) => {
      keys.push(new KeySetting(new Vector3((-width / 2 + index * buttonwidth + 0.12), ymiddle, z), lower, lower.toUpperCase(), middlealpha[index]));
    })
    keys.push(new KeySetting(new Vector3((-width / 2 + middle.length * buttonwidth + 0.15), ymiddle, z), 'backspace', 'icon', 'Backspace'));
    keys.push(new KeySetting(new Vector3((-width / 2 - 0.09), ymiddle, z), 'ABC', 'abc', 'ABC', 0.3, 0.1));

    width = (bottom.length - 1) * buttonwidth;
    bottom.forEach((lower, index) => {
      keys.push(new KeySetting(new Vector3((-width / 2 + index * buttonwidth), ybottom, z), lower, lower.toUpperCase(), bottomalpha[index]));
    })

    if (this.allowenter) {
      keys.push(new KeySetting(new Vector3((-width / 2 + bottom.length * buttonwidth + 0.05), ybottom, z), 'keyboard_return', 'icon', 'Enter'));
    }

    keys.push(new KeySetting(new Vector3(-0.56, yspace, z), '123', '123', 'abc', 0.3, 0.1));
    keys.push(new KeySetting(new Vector3(0, yspace, z), ' ', ' ', ' ', 0.8));
    keys.push(new KeySetting(new Vector3(0.51, yspace, z), '.', ',', ':'));
    keys.push(new KeySetting(new Vector3(0.62, yspace, z), '@', '?', '/'));

    this.addKeys(keys)

    this.keys = keys
  }

  public text = ''
  private keycase: KeyCase = 'lower';

  protected keycode(keys: KeySetting): string {
    if (this.keycase == 'lower')
      return keys.lower;
    else if (this.keycase == 'upper')
      return keys.upper ? keys.upper : keys.lower;
    else
      return keys.alpha ? keys.alpha : keys.lower;
  }

  protected iconcode(icons: KeySetting): string {
    return icons.alpha!;
  }

  private onKeyDown(event: KeyboardEvent) {
    let keycode = event.key;
    if (event.key == 'Backspace' || event.key == 'Enter')
      this.pressed(event.key);
    else if (event.key == 'Shift') {
      if (this.keycase == 'lower') {
        keycode = 'ABC';
      } else if (this.keycase == 'upper') {
        keycode = '123';
      } else if (this.keycase == 'numbers') {
        keycode = 'abc';
      }
    }
    if (event.ctrlKey) {
      const key = event.key.toLowerCase();
      if (key == 'v' || key == 'c' || key == 'x') {
        this.clicked("ctrl+" + key);
      }
    }
    else {
      const key = this.keys.find(x => x.lower == keycode || x.upper == keycode || x.alpha == keycode);
      if (key)
        this.clicked(keycode);
    }
  }

  private onKeyUp(event: KeyboardEvent) {
    let keycode = event.key;
    if (event.key == 'Shift') {
      if (this.keycase == 'lower') {
        keycode = 'ABC';
      } else if (this.keycase == 'upper') {
        keycode = 'abc';
      }
      this.clicked(keycode);
    }
  }
  protected clicked(keycode: string) {
    if (!this.visible) return;

    if (keycode == 'ABC') {
      this.keycase = 'upper'
    } else if (keycode == 'abc') {
      this.keycase = 'lower';
    } else if (keycode == '123') {
      this.keycase = 'numbers'
    }
    else if (keycode == 'ctrl+v') {
      navigator.clipboard.readText().then(text => {
        this.text += text;
        this.change(this.text);
      });
    }
    else if (keycode == 'ctrl+c' || keycode == 'ctrl+x') {
      navigator.clipboard.writeText(this.text).then(() => {
        console.log(this.text, 'saved to clipboard');
        if (keycode == 'ctrl+x') {
          this.text = '';
          this.change(this.text);
        }
      });
    }
    else {
      this.pressed(keycode);
      if (keycode == 'Enter') {
        if (this.allowenter) {
          this.change(this.text);
          this.text = '';
        }
      }
      else if (keycode == 'Backspace') {
        if (this.text.length > 0) {
          this.text = this.text.slice(0, this.text.length - 1);
          this.change(this.text);
        }
      }
      else {
        this.text += keycode;
        this.change(this.text);
      }
    }
  }


  private addKeys(keys: Array<KeySetting>) {
    keys.forEach((key) => {
      this.createKey(key)
    })
  }

  // override
  createKey(setting: KeySetting): Mesh {
    const { x, y, z } = setting.position

    const params: ButtonParameters = {
      position: { x, y, z },
      width: setting.size, height: 0.2,
      material: { color: 'gray' },
      label: {
        text: setting.lower, material: { color: 'black' }, isicon: setting.upper == 'icon',
      }
    }

    const button = new UIButton(params, this.interactive, this.options)
    if (params.label?.isicon) console.warn(params)

    button.position.copy(setting.position)
    this.add(button)
    return button
  }

  pressed(keycode: string) { }
  change(text: string) { }
}
