import { Group, Mesh, Object3D, PlaneGeometry, Vector3 } from "three";
import { InputFieldEventType, UIEntry } from "./input-field";
import { LabelParameters, UIOrientationType, ListParameters, UIEventType } from "./model";
import { ThreeInteractive } from "three-flow";
import { PanelOptions } from "./panel";
import { ButtonEventType, UIButton } from "./button";
import { UITextButton } from "./button-text";
import { UILabel } from "./label";
import { UIKeyboardEvent } from "./keyboard";

export interface ListOptions extends PanelOptions {
}

export enum ListEventType {
  LIST_SET_EMPTY = 'list_set_empty',
  LIST_SET_SELECTED = 'list_set_selected',
  LIST_SET_SIZE = 'list_set_size',
  LIST_SHOW_ITEM = 'list_show_item',
  LIST_SELECT_CHANGE = 'list_select_change',
  LIST_DISPOSE = 'list_dispose',
  LIST_DATA_REFRESH = 'list_data_refresh',
  LIST_RENDER_COMPLETE = 'list_render_complete',
}

export class UIList extends UIEntry {
  inputtype: string = 'list'

  private _field: string | undefined
  get field() { return this._field }
  set field(newvalue: string | undefined) {
    if (this._field != newvalue) {
      this._field = newvalue
      if (newvalue)
        this.refresh()
    }
  }

  private _data: Array<any>
  get data() { return this._data }
  set data(newvalue: Array<any>) {
    if (this._data != newvalue) {
      this._data = newvalue
      this.refresh()
    }
  }

  private selectedindex = -1  // index in list of selected item
  private _selectedtext = ''; // text of selected index
  get selectedtext(): string { return this._selectedtext }
  set selectedtext(newvalue: string) {
    if (this._selectedtext != newvalue) {
      this._selectedtext = newvalue

      const index = this.data.findIndex(item => {
        let value = item
        if (this.field) value = item[this.field]
        return value == newvalue
      });
      this.selectedindex = index
    }
  }

  private _spacing
  get spacing(): number { return this._spacing }
  set spacing(newvalue: number) {
    if (this._spacing != newvalue) {
      this._spacing = newvalue
      // TODO: change layout
    }
  }

  private _orientation: UIOrientationType
  get orientation(): UIOrientationType { return this._orientation }
  set orientation(newvalue: UIOrientationType) {
    if (this._orientation != newvalue) {
      this._orientation = newvalue
      // TODO: change layout
    }
  }

  private empty: UILabel
  private selected: Mesh
  private visuals: Array<UIButton> = []
  private itemcount: number
  //private highlightindex = -1

  constructor(parameters: ListParameters, interactive: ThreeInteractive, options: ListOptions = {}) {
    const itemCount = parameters.itemcount != undefined ? parameters.itemcount : 6
    const itemHeight = parameters.itemheight != undefined ? parameters.itemheight : 0.1
    const spacing = parameters.spacing != undefined ? parameters.spacing : 0.02
    const totalHeight = itemCount * (itemHeight + spacing) + spacing

    const panelwidth = parameters.width != undefined ? parameters.width : 1
    const itemWidth = panelwidth - spacing * 4
    const totalWidth = itemCount * (itemWidth + spacing) + spacing

    const orientation = parameters.orientation != undefined ? parameters.orientation : 'vertical'
    if (orientation == 'vertical')
      parameters.height = totalHeight
    else {
      parameters.width = totalWidth
      parameters.height = itemHeight + spacing * 2
    }

    super(parameters, interactive, options)

    this.name = parameters.id != undefined ? parameters.id : 'list'

    this._data = parameters.data != undefined ? parameters.data : []
    if (parameters.field) this._field = parameters.field
    if (parameters.selected) this.selectedtext = parameters.selected
    this._spacing = spacing
    this._orientation = orientation
    this.itemcount = itemCount

    this.empty = this.createEmpty(parameters.emptyText ? parameters.emptyText : 'List is empty')
    this.add(this.empty)
    //this.empty.visible = true

    this.selected = this.createSelected()
    this.add(this.selected)
    const matparams = parameters.selectedMaterial ? parameters.selectedMaterial : { color: 'black' }
    this.selected.material = this.materialCache.getMaterial('geometry', this.name, matparams)!;

    //const handleKeyDown = (e: KeyboardEvent) => {
    //  const keyboard: UIKeyboardEvent = { code: e.code, key: e.key, shiftKey: e.shiftKey, ctrlKey: e.ctrlKey, altKey: e.altKey }
    //  this.selected.dispatchEvent<any>({ type: InputFieldEventType.KEYDOWN, keyboard })
    //}

    //const handleKeyUp = (e: KeyboardEvent) => {
    //  if (this.selected) {
    //    const keyboard: UIKeyboardEvent = { code: e.code, key: e.key, shiftKey: e.shiftKey, ctrlKey: e.ctrlKey, altKey: e.altKey }
    //    this.selected.dispatchEvent<any>({ type: InputFieldEventType.KEYUP, keyboard })
    //  }
    //}

    //document.addEventListener('keydown', handleKeyDown);
    //document.addEventListener('keyup', handleKeyUp);

    //this.dispose = () => {
    //  document.removeEventListener('keydown', handleKeyDown)
    //  document.removeEventListener('keyup', handleKeyUp)
    //}

    // layout
    const position = new Vector3(0, 0, 0.001)

    if (this.orientation == 'vertical')
      position.y = totalHeight / 2 - itemHeight / 2 - spacing
    else
      position.x = -totalWidth / 2 + itemWidth / 2 + spacing

    this.empty.position.copy(position)

    for (let i = 0; i < itemCount; i++) {
      const button = this.createItem(itemWidth, itemHeight)
      button.position.copy(position)

      button.addEventListener(ButtonEventType.BUTTON_DOWN, (e: any) => { button.buttonDown() })
      button.addEventListener(ButtonEventType.BUTTON_UP, (e: any) => { button.buttonUp() })

      if (this.orientation == 'vertical')
        position.y -= (itemHeight + spacing)
      else
        position.x += (itemWidth + spacing)

      this.add(button)
      this.visuals.push(button)
    }

    // prevent these events from hitting anything behind
    //const block = (e: any) => { if (this.visible) e.stop = true }
    //this.addEventListener('pointermove', block)
    //this.addEventListener('pointerdown', block)
    //this.addEventListener('pointerup', block)
    //this.addEventListener('pointerenter', block)
    //this.addEventListener('pointerleave', block)
    //this.addEventListener('click', block)

    this.refresh()
  }


  override handleKeyDown(e: UIKeyboardEvent) {
    if (!this.data.length) return
    //console.warn(e)
    switch (e.code) {
      case 'Home':
        this.moveFirst()
        break;
      case 'End':
        this.moveLast()
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        this.moveNext()
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        this.movePrevious()
        break;
      case 'PageUp':
        this.movePreviousPage()
        break;
      case 'PageDown':
        this.moveNextPage()
        break;
      case 'Enter':
      case 'Space':
        let index = this.visuals.findIndex(button => button.isHighlighted())
        if (index != -1)
          this.visuals[index].dispatchEvent<any>({ type: UIEventType.BUTTON_PRESSED })
        break;
    }
  }

  public firstdrawindex = 0  // index in list of first item to render

  public refresh() {

    const display = (this.data.length == 0)
    this.empty.visible = display

    let drawindex = this.firstdrawindex;

    // if the whole list is shorter than what can be displayed, start from the first item in the list
    if (this.data.length <= this.itemcount) {
      this.firstdrawindex = drawindex = 0;
    }

    this.selected.visible = false

    this.visuals.forEach((visual, index) => {
      visual.visible = (drawindex < this.data.length)
      if (visual.visible) {
        let dataitem = this.data[drawindex]
        if (this.field) dataitem = dataitem[this.field]
        this.showItem(visual, dataitem)
      }

      if (this.selectedindex == drawindex) {
        this.selected.visible = true
        if (this.orientation == 'vertical')
          this.selected.position.set(-this.width / 2 + 0.02, visual.position.y, 0.005)
        //else
        // TODO: horizontal
      }

      //if (this.highlightindex == index) visual.highlight()

      drawindex++
    })
  }

  dispose() { }

  moveFirst() {
    if (this.selectedindex == 0) return
    this.selectedindex = 0
    this.refresh()
  }

  moveLast() {
    const index = Math.max(this.data.length - this.itemcount, 0);
    if (index != this.firstdrawindex) {
      this.firstdrawindex = index;
      this.refresh()
    }
  }

  movePrevious() {
    if (this.firstdrawindex) {
      this.firstdrawindex--
      this.refresh()
    }
  }

  movePreviousPage() {
    if (this.firstdrawindex) {
      if (this.firstdrawindex - this.itemcount < 0)
        this.firstdrawindex = 0;
      else
        this.firstdrawindex -= this.itemcount;
      this.refresh()
    }

  }

  moveNext() {
    if (this.firstdrawindex < this.data.length - 1) {
      this.firstdrawindex++
      this.refresh()
    }
  }

  moveNextPage() {
    if (this.firstdrawindex + this.itemcount < this.data.length) {
      this.firstdrawindex += this.itemcount;
      this.refresh()
    }
  }

  // overridables

  public showItem(button: UIButton, data: any) {
    const text = data as string
    const textbutton = button as UITextButton
    textbutton.text = text
  }

  public createItem(width: number, height: number): UIButton {
    const label: LabelParameters = {
      alignX: 'left',
      maxwidth: width - this.spacing * 2,
      overflow: 'clip'
    }

    const button = new UITextButton({ width, height, label }, this.interactive, this.options);

    button.addEventListener(UIEventType.BUTTON_PRESSED, () => {
      if (this.disabled || !this.visible) return
      this.selectedtext = button.text
      this.refresh()
      this.dispatchEvent<any>({ type: UIEventType.LIST_SELECTED_CHANGED })
    })

    return button
  }

  public createEmpty(emptyText: string): UILabel {
    const label = new UILabel({ text: emptyText }, this.options)
    label.position.z = 0.001
    return label
  }

  public createSelected(): Mesh {
    const geometry = new PlaneGeometry(0.02, 0.1)
    const mesh = new Mesh(geometry)
    //    mesh.position.set(-this.width / 2 + 0.02, 0, 0.001)
    return mesh
  }
}

