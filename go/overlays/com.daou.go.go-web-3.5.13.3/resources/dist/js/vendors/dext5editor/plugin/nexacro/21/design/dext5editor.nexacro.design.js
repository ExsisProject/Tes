//==============================================================================
//  RAONWIZ Co., Ltd.
//  Copyright 2018 RAONWIZ Co., Ltd.
//  All Rights Reserved.
//==============================================================================

if(nexacro.DEXT5Editor){var _pDEXT5Editor=nexacro.DEXT5Editor.prototype;_pDEXT5Editor.on_create_contents=function(){var e=this.getElement();if(e){var t=new nexacro.TextBoxElement(e,"icontext");this._cell_elem=t,t.setElementSize(e.client_width,e.client_height),t.setElementTextAlign("center"),t.setElementVerticalAlign("middle"),this.on_apply_text(this.name),this.set_border("1px solid #cccccc")}},_pDEXT5Editor.on_created_contents=function(e){var t=this._cell_elem;t&&t.create(e)},_pDEXT5Editor.on_destroy_contents=function(){var e=this._cell_elem;e&&(e.destroy(),this._cell_elem=null)},_pDEXT5Editor.on_change_containerRect=function(e,t){if(this._is_created_contents){var n=this._cell_elem;n.setElementSize(e,t)}},_pDEXT5Editor.on_apply_text=function(e){var t=this._cell_elem;t&&t.setElementText(e)},_pDEXT5Editor.createCssDesignContents=function(){this.set_text("DEXT5Editor")},delete _pDEXT5Editor};