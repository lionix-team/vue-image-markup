import {fabric} from 'fabric';
import CanvasHistory from "./canvasHistory";

let params;
fabric.LineArrow = fabric.util.createClass(fabric.Line, {

    type: 'lineArrow',
    initialize: function (element, options) {
        params = options;
        options || (options = {});
        this.callSuper('initialize', element, options);
    },

    toObject: function () {
        return fabric.util.object.extend(this.callSuper('toObject'));
    },

    _render: function (ctx) {
        this.ctx = ctx;
        this.callSuper('_render', ctx);
        let p = this.calcLinePoints();
        let xDiff = this.x2 - this.x1;
        let yDiff = this.y2 - this.y1;
        let angle = Math.atan2(yDiff, xDiff);
        this.drawArrow(angle, p.x2, p.y2, this.heads[0]);
        ctx.save();
        xDiff = -this.x2 + this.x1;
        yDiff = -this.y2 + this.y1;
        angle = Math.atan2(yDiff, xDiff);
        this.drawArrow(angle, p.x1, p.y1, this.heads[1]);
    },

    drawArrow: function (angle, xPos, yPos, head) {
        this.ctx.save();
        if (head) {
            this.ctx.translate(xPos, yPos);
            this.ctx.rotate(angle);
            this.ctx.beginPath();
            this.ctx.moveTo(10, 0);
            let width = params.strokeWidth < 2 ? params.strokeWidth * 6 : params.strokeWidth * 2;
            this.ctx.lineTo(-(width - 2), width);
            this.ctx.lineTo(-(width - 2), -width);
            this.ctx.closePath();
        }

        this.ctx.fillStyle = this.stroke;
        this.ctx.fill();
        this.ctx.restore();
    }
});


fabric.LineArrow.fromObject = function (object, callback) {
    callback && callback(new fabric.LineArrow([object.x1, object.y1, object.x2, object.y2], object));
};
fabric.LineArrow.async = true;
fabric.LineArrow.fromObject = function (object, callback) {
    callback && callback(new fabric.LineArrow([object.x1, object.y1, object.x2, object.y2], object));
};
fabric.LineArrow.async = true;

export default (function () {
    let drag;
    let color;
    let lineWidth;
    let fillArrow;
    let strokeDashArray;
    let arrowId;
    let properties;

    function Arrow(canvas, draggable = false, params) {

        if (!draggable) {
            drag = false;
            return Arrow;
        }

        if (color && color !== params.stroke) {
            color = params.stroke;
            new Arrow(canvas, draggable, params)
            return Arrow;
        }

        properties = params;
        if (properties) {
            fillArrow = params.fill;
            color = params.stroke;
            lineWidth = params.strokeWidth;
            strokeDashArray = params.strokeDashArray;
            arrowId = params.id;
        }
        this.canvas = canvas;
        this.className = 'Arrow';
        this.isDrawing = false;
        this.bindEvents();
        drag = draggable;

    }

    Arrow.prototype.bindEvents = function () {
        let inst = this;
        document.onkeydown = (e) => {
            if (e.which === 46 || e.keycode === 46) {
                inst.canvas.getActiveObjects().forEach((obj) => {
                    inst.canvas.remove(obj)
                });
            }
            inst.canvas.renderAll()
        };
        inst.selectable = true;

        inst.canvas.off('mouse:down');
        inst.canvas.on('mouse:down', function (o) {
            inst.onMouseDown(o);
        });
        inst.canvas.on('mouse:move', function (o) {
            inst.onMouseMove(o);
        });
        inst.canvas.on('mouse:up', function (o) {
            inst.onMouseUp(o);

        });
        inst.canvas.on('object:moving', function () {
            inst.disable();
        });
    };
    Arrow.prototype.onMouseUp = function () {
        let inst = this;
        if (!inst.isEnable()) {
            return;
        }
        if (drag) {
            this.line.set({
                dirty: true,
                objectCaching: true
            });
            if (inst.canvas.getActiveObject()) {
                inst.canvas.getActiveObject().hasControls = false;
                inst.canvas.getActiveObject().hasBorders = false;
                inst.canvas.getActiveObject().lockMovementX = true;
                inst.canvas.getActiveObject().lockMovementY = true;
                inst.canvas.getActiveObject().lockUniScaling = true;
            }
            inst.canvas.renderAll();
            let canvasProperties = {width:inst.canvas.width,height:inst.canvas.height}
            let currentCanvas = { json: inst.canvas.toJSON(),canvas: canvasProperties};
            new CanvasHistory(inst.canvas,currentCanvas)
        }
        inst.disable();
    };
    Arrow.prototype.onMouseMove = function (o) {
        let inst = this;
        inst.canvas.selection = false;
        if (!inst.isEnable()) {
            return;
        }
        let pointer = inst.canvas.getPointer(o.e);
        let activeObj = inst.canvas.getActiveObject();
        activeObj.set({
            x2: pointer.x,
            y2: pointer.y
        });
        activeObj.setCoords();
        inst.canvas.renderAll();
    };

    Arrow.prototype.onMouseDown = function (o) {

        let inst = this;
        if (!drag) {
            if (inst.canvas.getActiveObject()) {
                inst.canvas.getActiveObject().hasControls = true;
                inst.canvas.getActiveObject().hasBorders = true;
                inst.canvas.getActiveObject().lockMovementX = false;
                inst.canvas.getActiveObject().lockMovementY = false;
                inst.canvas.getActiveObject().lockUniScaling = false;
                inst.canvas.renderAll();
            }
            inst.disable();
            return;
        }
        inst.enable();
        if (inst.canvas.getActiveObject()) {
            inst.canvas.getActiveObject().hasControls = false;
            inst.canvas.getActiveObject().hasBorders = false;
            inst.canvas.getActiveObject().lockMovementX = true;
            inst.canvas.getActiveObject().lockMovementY = true;
            inst.canvas.getActiveObject().lockUniScaling = true;
            inst.canvas.renderAll();
        }
        let pointer = inst.canvas.getPointer(o.e);
        let points = [pointer.x, pointer.y, pointer.x, pointer.y];
        this.line = new fabric.LineArrow(points, {
            strokeWidth: lineWidth,
            strokeDashArray: strokeDashArray,
            fill: color,
            stroke: color,
            originX: 'center',
            originY: 'center',
            hasBorders: false,
            hasControls: false,
            objectCaching: false,
            perPixelTargetFind: true,
            heads: [1, 0],
            id: arrowId ? arrowId : 'arrow'

        });
        inst.canvas.add(this.line).setActiveObject(this.line);

    };

    Arrow.prototype.isEnable = function () {
        return this.isDrawing;
    };

    Arrow.prototype.enable = function () {
        this.isDrawing = true;
    };

    Arrow.prototype.disable = function () {
        this.isDrawing = false;
    };

    return Arrow;
}());

