import {fabric} from "fabric";
import CanvasHistory from "./canvasHistory";
export default (function () {

    let disabled = false;
    let object, bgImage;
    let src;
    let drag;
    let clipRect, rect, rectRed;
    let overlay = {};
    let properties;
    let cropperWidth, cropperHeight;
    let clip, clipOverlay;

    function CropImage(canvas, draggable = false, apply = false, cancel = false, params) {
        this.canvas = canvas;
        if (cancel) {
            this.canvas.remove(clipOverlay);
            // this.canvas.remove(rect);
            this.canvas.remove(rectRed);
            let inst = this;
            this.canvas.getObjects().forEach(function (object) {
                if (object.id === 'clonedCanvasImage') {
                    inst.canvas.remove(object);
                }
            })
        }
        if (!draggable) {
            drag = false;
            return CropImage;
        }
        drag = draggable;
        disabled = false;
        properties = params;
        canvas.backgroundColor = "#fff";


        if (drag && apply) {
            canvas.clear();
            let image;
            let backgroundImage = new Promise((resolve => {
                fabric.util.loadImage(src, function (img) {

                    image = new fabric.Image(img);
                    image.set({
                        top: (rectRed.height / 2 - rectRed.top + clip.top),
                        left: (rectRed.width / 2 - rectRed.left + clip.left),
                        originX: 'center',
                        originY: 'center',
                    })
                    canvas.setBackgroundImage(image, canvas.renderAll.bind(canvas));
                    canvas.setHeight(rectRed.height * rectRed.scaleY)
                    canvas.setWidth(rectRed.width * rectRed.scaleX)
                    canvas.calcOffset();
                    bgImage = canvas.toDataURL("image/jpeg", 1)
                    resolve()
                })
            }))

            drag = false;
            apply = false;

            return backgroundImage.then(() => {
                canvas.setBackgroundImage(bgImage, canvas.renderAll(canvas))
                let canvasProperties = {width: rectRed.width * rectRed.scaleX, height: rectRed.height * rectRed.scaleY}
                let croppedImage = {
                    json: this.canvas.toJSON(),
                    canvas: canvasProperties,
                    croppedImage: bgImage,
                    imagePosition: {top: 0, left: 0}
                };
                new CanvasHistory(this.canvas, croppedImage);
                return CropImage

            })
        }
        if (canvas.width <= properties.width || canvas.height <= properties.height) {
            cropperWidth = canvas.width - 50;
            cropperHeight = canvas.height - 50;
        } else {
            cropperWidth = properties.width;
            cropperHeight = properties.height;
        }
        this.bindEvents();
        this.canvas.selectable = false;
        this.canvas.uniScaleTransform = true;
        this.canvas.renderAll();
        let inst = this;
        src = this.canvas.toDataURL('image/jpeg', 1);
        new fabric.Image.fromURL(src, function (oImg) {
            rectRed = new fabric.Rect({
                left: (oImg.width - cropperWidth) / 2,
                top: (oImg.height - cropperHeight) / 2,
                width: cropperWidth,
                height: cropperHeight,
                fill: '',
                imageWidth: oImg.width,
                imageHeight: oImg.height,
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
            rectRed.setControlsVisibility({
                tl: true,
                mt: false,
                tr: true,
                ml: false,
                mr: false,
                bl: true,
                mb: false,
                br: true
            }),
                inst.canvas.add(rectRed);
            inst.canvas.bringToFront(rectRed);
            inst.canvas.setActiveObject(rectRed)

            clip = {
                left: rectRed.left,
                top: rectRed.top,
                right: rectRed.width + rectRed.left,
                bottom: rectRed.height + rectRed.top
            }

            clipOverlay = new fabric.Path('M 0 0 H ' + inst.canvas.width + ' V ' + clip.top + ' H ' + clip.left + ' V '
                + clip.bottom + ' H ' + clip.right + ' V ' + clip.top + ' H ' + inst.canvas.width + ' V ' + inst.canvas.height + ' H 0 Z', {
                left: 0,
                top: 0,
                fill: properties.overlayColor,
                opacity: properties.overlayOpacity,
                selectable: false
            });
            inst.canvas.add(clipOverlay);

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
            let newClip = {
                left: target.left,
                top: target.top,
                right: inst.canvas.width - target.left + (target.left - clip.left) * 2 + (target.width * target.scaleX) - target.width,
                bottom: inst.canvas.height - target.top + (target.top - clip.top) * 2 + (target.height * target.scaleY) - target.height
            }
            let updatedPath = new fabric.Path('M 0 0 H ' + inst.canvas.width + ' V ' + newClip.top + ' H ' + newClip.left + ' V '
                + newClip.bottom + ' H ' + newClip.right + ' V ' + newClip.top + ' H ' + inst.canvas.width + ' V ' + inst.canvas.height + ' H 0 Z');

            clipOverlay.set({
                path: updatedPath.path,
            });
            clipOverlay.setCoords();

            inst.canvas.renderAll()

        });
        inst.canvas.on('object:moving', function (e) {
            let target = e.target;
            let newClip = {
                left: target.left,
                top: target.top,
                right: inst.canvas.width - target.left + (target.left - clip.left) * 2 + (target.width * target.scaleX) - target.width,
                bottom: inst.canvas.height - target.top + (target.top - clip.top) * 2 + (target.height * target.scaleY) - target.height
            }
            let updatedPath = new fabric.Path('M 0 0 H ' + inst.canvas.width + ' V ' + newClip.top + ' H ' + newClip.left + ' V '
                + newClip.bottom + ' H ' + newClip.right + ' V ' + newClip.top + ' H ' + inst.canvas.width + ' V ' + inst.canvas.height + ' H 0 Z');

            clipOverlay.set({
                path: updatedPath.path,
            });
            clipOverlay.setCoords();
            inst.canvas.renderAll();
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
