import {fabric} from 'fabric';
export default (function () {
    let drag;
    let shape;
    let color;
    let lineWidth,fillCircle,angle;
    let properties;
    function Shape(canvas,draggable = false,type,params) {
        if(!draggable){
            drag = false;
            return Shape;
        }
        if(color && color !== params.stroke){
            color = params.stroke;
            shape = type;
            new Shape(canvas,true,shape,params)
            return Shape;
        }
        if((shape && shape !== type)){
            shape = type;
            drag = true;
            new Shape(canvas,true,shape,params)
            return Shape;
        }
        properties = params;
        if(properties){
            fillCircle = properties.fill;
            color = properties.stroke;
            lineWidth = properties.strokeWidth;
            angle = properties.angle;
        }
        this.canvas = canvas;
        this.className = 'Shape';
        this.isDrawing = false;
        this.origX = 0;
        this.origY = 0;

        drag = draggable;
        shape = type;

        this.bindEvents();


    }

    Shape.prototype.bindEvents = function () {
        let inst = this;
        document.onkeydown=(e)=>{
            if(e.which === 46 || e.keycode === 46){
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
    Shape.prototype.onMouseUp = function () {

        let inst = this;
        if (!inst.isEnable()) {
            return;
        }
        if(drag){
            inst.canvas.getObjects().forEach(function(object,index,array) {
                if (index === (array.length -1)) {
                    if(inst.canvas.getActiveObject() && inst.canvas.getActiveObject()._objects && inst.canvas.getActiveObject()._objects.length > 1){
                        inst.canvas.setActiveObject(object);

                    }
                }
            });
            if(inst.canvas.getActiveObject()){
                inst.canvas.getActiveObject().hasControls = false;
                inst.canvas.getActiveObject().hasBorders = false;
                inst.canvas.getActiveObject().lockMovementX = true;
                inst.canvas.getActiveObject().lockMovementY = true;
                inst.canvas.getActiveObject().lockUniScaling = true;
            }
            inst.canvas.renderAll();
        }
        inst.disable();

    };
    Shape.prototype.onMouseMove = function (o) {
        let inst = this;
        if (!inst.isEnable()) {
            return;
        }
        inst.canvas.selection = false;
        let pointer = inst.canvas.getPointer(o.e);
        let activeObj;
        if(inst.canvas.getActiveObject()){
            activeObj = inst.canvas.getActiveObject();
            activeObj.stroke = color;
            activeObj.strokeWidth = lineWidth;
            activeObj.fill = fillCircle;
            activeObj.noScaleCache = false;
            activeObj.strokeUniform = true;
        }

        if (this.origX > pointer.x) {
            activeObj.set({
                left: Math.abs(pointer.x)
            });
        }
        if (this.origY > pointer.y) {
            activeObj.set({
                top: Math.abs(pointer.y)
            });
        }
        if(shape == "rect"){
            activeObj.set({
                width: Math.abs(this.origX - pointer.x)
            });
            activeObj.set({
                height: Math.abs(this.origY - pointer.y)
            });
        }
        if(shape == "circle"){
            activeObj.set({
                rx: Math.abs(this.origX - pointer.x) / 2
            });
            activeObj.set({
                ry: Math.abs(this.origY - pointer.y) / 2
            });
        }
        activeObj.setCoords();
        inst.canvas.renderAll();
    };

    Shape.prototype.onMouseDown = function (o) {
        
        let inst = this;
        if(!drag){
            
            if( inst.canvas.getActiveObject()){
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
            
            if(inst.canvas.getActiveObject()){
                inst.canvas.getActiveObject().hasControls = false;
                inst.canvas.getActiveObject().hasBorders = false;
                inst.canvas.getActiveObject().lockMovementX = true;
                inst.canvas.getActiveObject().lockMovementY = true;
                inst.canvas.getActiveObject().lockUniScaling = true;
                inst.canvas.renderAll();
            }
            let pointer = inst.canvas.getPointer(o.e);
            this.origX = pointer.x;
            this.origY = pointer.y;
            if(shape === "rect"){
                let rect = new fabric.Rect({
                    left: this.origX,
                    top: this.origY,
                    originX: 'left',
                    originY: 'top',
                    width: pointer.x - this.origX,
                    height: pointer.y - this.origY,
                    angle: angle,
                    fill: fillCircle,
                    transparentCorners: false,
                    stroke: color,
                    strokeWidth: lineWidth
                });
                inst.canvas.add(rect).setActiveObject(rect);
            }
            if(shape === "circle"){
                let circle = new fabric.Ellipse({
                    top: this.origY,
                    left: this.origX,
                    rx: 0,
                    ry: 0,
                    transparentCorners: false,
                    hasBorders: true,
                    hasControls: true,
                });
                inst.canvas.add(circle).setActiveObject(circle);
            }
        

       
    };

    Shape.prototype.isEnable = function () {
        return this.isDrawing;
    }

    Shape.prototype.enable = function () {
        this.isDrawing = true;
    }

    Shape.prototype.disable = function () {
        this.isDrawing = false;
    }

    return Shape;
}());
