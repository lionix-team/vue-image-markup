import {fabric} from "fabric";
import CanvasHistory from "./canvasHistory.js";

export default (function () {
    let activeObject = false;
    let drag, textColor, textFontFamily, textFontSize, customText, color, textFontStyle, textFontWeight,textId;

    function Text(canvas, draggable = false, params) {
        this.canvas = canvas;
        this.isDrawing = false;
        this.origX = 0;
        this.origY = 0;
        this.bindEvents();
        drag = draggable;
        if (color && color !== params.fill) {
            color = params.fill;
            return Text;
        }
        if (params) {
            textColor = params.fill;
            textFontFamily = params.fontFamily;
            textFontSize = params.fontSize;
            textFontStyle = params.fontStyle;
            textFontWeight = params.fontWeight;
            customText = params.placeholder;
            textId = params.id;
            if (canvas.getActiveObject() && canvas.getActiveObject().hasOwnProperty('text')) {
                canvas.getActiveObject().set({
                    fill: textColor,
                    fontFamily: textFontFamily,
                    fontSize: textFontSize,
                    fontStyle: textFontStyle,
                    fontWeight: textFontWeight,
                    id: textId
                });
                canvas.renderAll();
            }
        }
    }

    Text.prototype.bindEvents = function () {
        let inst = this;
        inst.selectable = true;
        inst.canvas.on("mouse:down", function (o) {
            inst.onMouseDown(o);
        });
        inst.canvas.on("mouse:move", function (o) {
            inst.onMouseMove(o);

        });
        inst.canvas.on("mouse:up", function (o) {
            inst.onMouseUp(o);
        });
        Text.prototype.onMouseUp = function () {
            return Text;
        };
        Text.prototype.onMouseMove = function () {
            let inst = this;
            if (!inst.isEnable()) {
                return;
            }
            activeObject = inst.canvas.getActiveObject();
            inst.canvas.renderAll();
        };
        Text.prototype.onMouseDown = function (o) {
            let inst = this;
            if (drag) {
                inst.enable();
                if (inst.canvas.getActiveObject() && !inst.canvas.getActiveObject().text) {
                    inst.canvas.getActiveObject().selectable = false;
                    inst.canvas.getActiveObject().evented = false;
                }
                if ((!inst.canvas.getActiveObject() && !activeObject) || (inst.canvas.getActiveObject() && !inst.canvas.getActiveObject().text)) {
                    let pointer = inst.canvas.getPointer(o.e);
                    this.origX = pointer.x;
                    this.origY = pointer.y;
                    let text = new fabric.IText(customText, {
                        fill: textColor,
                        fontFamily: textFontFamily,
                        left: this.origX,
                        top: this.origY,
                        fontSize: textFontSize,
                        fontStyle: textFontStyle ? textFontStyle : '',
                        fontWeight: textFontWeight,
                        hasBorders: false,
                        hasControls: false,
                        id: textId
                    });

                    text.selectionStart = 0;
                    text.selectionEnd = text.text.length;
                    inst.canvas.add(text).setActiveObject(text);
                    text.enterEditing();
                    text.hiddenTextarea.focus();
                    inst.canvas.requestRenderAll();
                    let canvasProperties = {width:inst.canvas.width,height:inst.canvas.height}
                    let currentCanvas = { json: inst.canvas.toJSON(),canvas: canvasProperties};
                    new CanvasHistory(inst.canvas,currentCanvas)
                }
                if (inst.canvas.getActiveObject() && activeObject && inst.canvas.getActiveObject().hiddenTextarea) {
                    inst.canvas.getActiveObject().hasControls = true;
                    inst.canvas.getActiveObject().hasBorders = true;
                    inst.canvas.getActiveObject().lockMovementX = true;
                    inst.canvas.getActiveObject().lockMovementY = true;
                    inst.canvas.getActiveObject().lockUniScaling = true;
                    inst.canvas.renderAll();
                }
            }
        };
    };
    Text.prototype.isEnable = function () {
        return this.isDrawing;
    };
    Text.prototype.enable = function () {
        this.isDrawing = true;
    };
    Text.prototype.disable = function () {
        this.isDrawing = false;
    };
    return Text;
}());
