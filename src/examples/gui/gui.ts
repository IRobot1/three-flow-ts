// adapted from https://lil-gui.georgealways.com/
// removed all the HTML and CSS.  Its just the configuration
export class Controller {
  title!: string;
  _decimals: number | undefined;
  enabled = true;
  rgbscale = 1
  private initialValue: any;

  constructor(
    public parent: GUI,
    public object: any,
    public property: string,
    public classname: string,
    public _min?: number | any | any[],
    public _max?: number,
    public _step?: number
  ) {
    this.title = property;
    this.initialValue = this.getValue();
  }

  getValue(): any { return this.object[this.property] }
  setValue(newvalue: any): Controller {
    if (this.object[this.property] != newvalue) {
      this.object[this.property] = newvalue
      this._callOnChange();
    }
    return this;
  }

  execute() {
    const func = this.object[this.property];
    func.call(this.object)
    this._callOnChange()
  }

  name(newvalue: string): Controller { this.title = newvalue; return this; }
  max(newvalue: number): Controller { this._max = newvalue; return this; }
  min(newvalue: number): Controller { this._min = newvalue; return this; }
  step(newvalue: number): Controller { this._step = newvalue; return this; }
  decimals(newvalue: number) { this._decimals = newvalue; return this; }

  private _listening = false
  private _listenCallbackID: any

  listen(listen = true) {

    /**
     * Used to determine if the controller is currently listening. Don't modify this value
     * directly. Use the `controller.listen( true|false )` method instead.
     * @type {boolean}
     */
    this._listening = listen;

    if (this._listenCallbackID !== undefined) {
      clearInterval(this._listenCallbackID);
      this._listenCallbackID = undefined;
    }

    if (this._listening) {
      this._listenCallback();
    }

    return this;

  }

  public updateDisplay = () => { }

  private _listenCallback() {
    this._listenCallback.bind(this)

    this._listenCallbackID = setInterval(() => {
      this.updateDisplay();
    }, 500);

  }


  disable(): Controller { this.enabled = false; return this; }
  enable(): Controller { this.enabled = true; return this; }
  reset(): Controller {
    this.setValue(this.initialValue);
    this._callOnFinishChange();
    return this;
  }

  public _changeCallback!: (event: any) => void;
  onChange(callback: (e: any) => void): Controller { this._changeCallback = callback; return this; }
  protected _callOnChange() {
    this.parent._callOnChange(this);

    if (this._changeCallback !== undefined) {
      this._changeCallback.call(this, this);
    }
    this._changed = true;
  }

  public _finishCallback!: (event: any) => void;
  onFinishChange(callback: (e: any) => void): Controller { this._finishCallback = callback; return this; }

  _changed = false;
  _callOnFinishChange() {

    if (this._changed) {

      this.parent._callOnFinishChange(this);

      if (this._finishCallback !== undefined) {
        this._finishCallback.call(this, this.getValue());
      }

    }
    this._changed = false;
  }

}

export class GUI {
  list: Array<Controller> = [];

  parent?: GUI;
  root!: GUI;
  title = '';
  width = 150;
  height = 150;

  constructor({
    parent,
    title = 'Controls',
    width = 150,
    height = 150,
  }: {
    parent?: GUI,
    title?: string,
    width?: number,
    height?: number,
  }) {
    this.parent = parent;
    this.title = title;
    this.width = width / 150;
    this.height = height / 150;
    this.root = parent ? parent.root : this;
  }

  add(object: any, property: string, min?: number | object | any[], max?: number, step?: number): Controller {
    let classname = ''

    if (Object(min) === min) {
      classname = 'options';
    }
    else {
      const initialValue = object[property];
      classname = typeof initialValue;
    }
    const controller = new Controller(this, object, property, classname, min, max, step);
    this.list.push(controller);
    return controller;
  }

  addFolder(title: string): GUI {
    const gui = new GUI({ parent: this, title, width: this.width * 150, height: this.height * 150 });
    const controller = new Controller(this, gui, title, 'folder');
    this.list.push(controller);
    return gui;
  }


  addColor(object: any, property: string, rgbScale = 1): Controller {
    const controller = new Controller(this, object, property, 'color');
    controller.rgbscale = rgbScale
    this.list.push(controller);
    return controller;
  }

  addTextArea(object: any, property: string, width: number, height: number): Controller {
    const controller = new Controller(this, object, property, 'textarea', width, height);
    this.list.push(controller);
    return controller;
  }

  reset(recursive = true) {
    this.list.forEach(c => c.reset());
    return this;
  }
  settitle(newvalue: string): GUI { this.title = newvalue; return this; }

  expanded = true;
  open(): GUI { this.expanded = true; return this; }
  close(): GUI { this.expanded = false; return this; }

  public _changeCallback!: (event: any) => void;
  onChange(callback: (e: any) => void): GUI { this._changeCallback = callback; return this; }

  _callOnChange(controller: { object: any; property: any; getValue: () => any; }) {
    if (this.parent) {
      this.parent?._callOnChange(controller);
    }

    if (this._changeCallback !== undefined) {
      this._changeCallback.call(this, {
        object: controller.object,
        property: controller.property,
        value: controller.getValue(),
        controller
      });
    }
  }

  public _finishCallback!: (event: any) => void;
  onFinishChange(callback: (e: any) => void): GUI { this._finishCallback = callback; return this; }


  _changed = false;

  _callOnFinishChange(controller: Controller) {

    if (this._changed) {

      this.parent?._callOnFinishChange(controller);

      if (this._finishCallback !== undefined) {
        this._finishCallback.call(this, {
          object: controller.object,
          property: controller.property,
          value: controller.getValue(),
          controller
        });
      }

    }
    this._changed = false;
  }
}
