import {fabric} from "fabric";
import CanvasHistory from "./canvasHistory";

export default (function () {

    let disabled = false;
    let object;
    let src;
    let drag;
    let clipRect, rect, rectRed;
    let overlay = {};
    let properties;
    let cropperWidth,cropperHeight;

    function CropImage(canvas, draggable = false, apply = false, cancel = false, params) {
        this.canvas = canvas;
        if (cancel) {
            this.canvas.remove(clipRect);
            this.canvas.remove(rect);
            this.canvas.remove(rectRed);
        }
        if (!draggable) {
            drag = false;
            return CropImage;
        }
        drag = draggable;
        disabled = false;
        properties = params;
        canvas.backgroundColor = "#fff";
        src = canvas.toDataURL('image/jpeg');
        fabric.util.loadImage(src, function (img) {
            object = new fabric.Image(img);
            object.selectable = false;
        })

        if (drag && apply) {
            canvas.clear();
            let overlayCropped = overlay.toDataURL();
            fabric.util.loadImage(overlayCropped, function (img) {

                let clippedImage = new fabric.Image(img);
                canvas.setBackgroundImage(clippedImage, canvas.renderAll.bind(canvas), {
                    top: -(clipRect.top),
                    left: -(clipRect.left),
                    originX: 'center',
                    originY: 'center',
                });
                canvas.setDimensions({
                    width: clipRect.width * clipRect.scaleX,
                    height: clipRect.height * clipRect.scaleY
                });
            })

            drag = false;
            apply = false;
            let canvasProperties = {width: clipRect.width * clipRect.scaleX, height: clipRect.height * clipRect.scaleY}
            let croppedImage = {
                json: this.canvas.toJSON(),
                croppedImage: overlayCropped,
                canvas: canvasProperties,
                imagePosition: clipRect
            };
            new CanvasHistory(this.canvas, croppedImage);
            return CropImage
        }
        if(canvas.width <= properties.width || canvas.height <= properties.height){
            cropperWidth =  canvas.width - 50;
            cropperHeight = canvas.height - 50;
        }
        else{
            cropperWidth =  properties.width;
            cropperHeight = properties.height;
        }
        this.bindEvents();
        this.canvas.selectable = false;
        this.canvas.renderAll();
        let inst = this;
        new fabric.Image.fromURL(src, function (oImg) {
            rect = new fabric.Rect({
                left: 0,
                top: 0,
                width: oImg.width,
                height: oImg.height,
                fill: properties.overlayColor,
                selectable: false,
                opacity: properties.overlayOpacity
            });
            inst.canvas.add(rect);
            fabric.Image.fromURL(src, function (oImg1) {
                rectRed = new fabric.Rect({
                    left: (oImg1.width - properties.width) / 2,
                    top: (oImg1.height - properties.height) / 2,
                    width: cropperWidth,
                    height: cropperHeight,
                    fill: '',
                    imageWidth: oImg1.width,
                    imageHeight: oImg1.height,
                    cornerSize: properties.cornerSize,
                    hasControls: properties.hasControls,
                    borderColor: properties.borderColor,
                    cornerColor: properties.cornerColor,
                    cornerStyle: properties.cornerStyle,
                    transparentCorners: properties.transparentCorners,
                    hasRotatingPoint: properties.hasRotatingPoint,
                    lockUniScaling: JSON.parse(properties.lockUniScaling),
                    noScaleCache: JSON.parse(properties.noScaleCache),
                    strokeUniform: JSON.parse(properties.strokeUniform),
                    clipTo: function (context) {
                        context.translate(-this.width / 2, -this.height / 2);
                        for (let x = 0; x <= this.width; x += this.width / 3) {
                            context.moveTo(x, 0);
                            context.lineTo(x, this.height);
                        }

                        for (let y = 0; y <= this.height; y += this.height / 3) {
                            context.moveTo(0, y);
                            context.lineTo(this.width, y);
                        }
                        context.strokeStyle = properties && properties.strokeColor ? properties.strokeColor : '#000';
                        context.stroke();
                    }
                });
                clipRect = new fabric.Rect({
                    left: -(cropperWidth / 2),
                    top: -(cropperHeight / 2),
                    width: cropperWidth,
                    height: cropperHeight,
                    fill: '',
                    selectable: false,
                });
                oImg1.set({clipPath: clipRect, selectable: false})

                inst.canvas.add(oImg1);
                overlay = inst.canvas._objects[inst.canvas._objects.length - 1];
                inst.canvas.add(rectRed);
                inst.canvas.bringToFront(rectRed)
                inst.canvas.setActiveObject(rectRed)
            });
        });
        this.canvas.renderAll();
    };
    CropImage.prototype.bindEvents = function () {
        let inst = this;
        inst.canvas.on("mouse:down", function (o) {
            inst.onMouseDown(o);
        });
        inst.canvas.on("object:scaling", function (e) {
            let target = e.target;
            clipRect = new fabric.Rect({
                left: target.left - (overlay.width / 2),
                top: target.top - (overlay.height / 2),
                width: target.width,
                height: target.height,
                fill: '',
                scaleX: target.scaleX,
                scaleY: target.scaleY,
            });
            overlay.set("clipPath", clipRect)
            inst.canvas.renderAll()

        });
        inst.canvas.on('object:moving', function (e) {
            let target = e.target;
            clipRect = new fabric.Rect({
                left: target.left - (overlay.width / 2),
                top: target.top - (overlay.height / 2),
                width: target.width,
                height: target.height,
                fill: '',
                scaleX: target.scaleX,
                scaleY: target.scaleY,
            });
            overlay.set("clipPath", clipRect)
            inst.canvas.renderAll()
        });

        CropImage.prototype.onMouseDown = function (event) {
            let inst = this;
            if (disabled || !drag) {
                return CropImage
            }
            inst.canvas.setActiveObject(rectRed);
        };
    };

    return CropImage;
}());
