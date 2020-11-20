<template>
    <div class="custom-editor">
        <canvas :id="editorId"></canvas>
    </div>
</template>

<script>
    import {fabric} from 'fabric';
    import Shape from './assets/js/shape';
    import Text from './assets/js/text';
    import Arrow from './assets/js/arrow';
    import CropImage from './assets/js/crop';
    import CanvasHistory from './assets/js/canvasHistory';
    export default {
        name: 'Editor',
        props: {
            canvasWidth: {
                type: [String,Number],
                required: true
            },
            canvasHeight: {
                type: [String,Number],
                required: true
            },
            editorId: {
                type: String,
                default: 'c',
                required: false
            }
        },
        data() {
            return {
                canvas: null,
                pointerX: null,
                pointerY: null,
                createCircle: false,
                createRect: false,
                createArrow: false,
                createText: false,
                circle: null,
                currentActiveMethod: null,
                currentActiveTool: null,
                objects: [],
                width: null,
                height: null,
                params: {},
                color: '#000000',
                strokeWidth: 7,
                fontSize: 32,
                croppedImage: false,
                history: [],
            }

        },
        mounted() {
            this.canvas = new fabric.Canvas(this.editorId);
            this.canvas.setDimensions({width: this.canvasWidth, height: this.canvasHeight});
            this.canvas.backgroundColor = "#fff";
            let canvasProperties = {width: this.canvas.width, height: this.canvas.height}
            let currentCanvas = {json: this.canvas.toJSON(), canvas: canvasProperties};
            new CanvasHistory(this.canvas, currentCanvas);
        },
        methods: {
            getObjectsById(objectId){
                let objects = this.canvas.getObjects();
                let findedObject = [];
                objects.map((object) => {
                    if(object.id && object.id == objectId) {
                        findedObject.push(object);
                    }
                })
                return findedObject;
            },
            changeColor(colorProperty) {
                this.color = colorProperty;
                this.set(this.currentActiveTool)
            },
            setBackgroundImage(imageUrl, backgroundColor = "#fff") {
                let img = new Image();
                this.toDataUrl(imageUrl, (dataUri) => {
                    img.src = dataUri;
                    let inst = this;
                    img.onload = function () {
                        let image = new fabric.Image(img);
                        image.scaleToWidth(inst.canvasWidth);
                        image.scaleToHeight(inst.canvasHeight);
                        inst.canvas.setBackgroundImage(image, inst.canvas.renderAll.bind(inst.canvas));
                        let canvasProperties = {width: inst.canvas.width, height: inst.canvas.height};
                        let currentCanvas = {
                            json: inst.canvas.toJSON(),
                            canvas: canvasProperties
                        };
                        new CanvasHistory(inst.canvas, currentCanvas)
                        inst.canvas.renderAll();
                    }

                });
            },
            toDataUrl(url, callback) {
                let xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    let reader = new FileReader();
                    reader.onloadend = () => {
                        callback(reader.result);
                    };
                    reader.readAsDataURL(xhr.response);
                };
                xhr.open('GET', url);
                xhr.responseType = 'blob';
                xhr.send();
            },
            clear() {
                this.canvas.clear();
                this.cancelCroppingImage()
            },
            set(type, params) {
                switch (type) {
                    case "text":
                        this.currentActiveTool = type;
                        this.params = {
                            fill: (params && params.fill) ? params.fill : this.color,
                            fontFamily: (params && params.fontFamily) ? params.fontFamily : 'Arial',
                            fontSize: (params && params.fontSize) ? params.fontSize : this.fontSize,
                            fontStyle: (params && params.fontStyle) ? params.fontStyle : this.fontStyle,
                            fontWeight: (params && params.fontWeight) ? params.fontWeight : this.fontWeight,
                            placeholder: (params && params.placeholder) ? params.placeholder : 'Add Text',
                            id: (params && params.id) ? params.id : '',
                        };
                        this.addText(this.params);
                        break;

                    case "circle":
                        this.cancelCroppingImage();
                        this.currentActiveTool = type;
                        this.params = {
                            fill: (params && params.fill) ? params.fill : 'transparent',
                            stroke: (params && params.stroke) ? params.stroke : this.color,
                            strokeWidth: (params && params.strokeWidth) ? params.strokeWidth : this.strokeWidth,
                            disableCircleEditing: (params && params.disableCircleEditing) ? params.disableCircleEditing : false,
                            top: (params && params.top) ? params.top : 0,
                            left: (params && params.left) ? params.left : 0,
                            radius: (params && params.radius) ? params.radius : 20,
                            strokeUniform: (params && params.strokeUniform) ? params.strokeUniform : true,
                            noScaleCache: (params && params.noScaleCache) ? params.noScaleCache : false,
                            strokeDashArray: (params && params.strokeDashArray) ? params.strokeDashArray : false,
                            id: (params && params.id) ? params.id : '',
                        };
                        this.customCircle(type, this.params);
                        break;
                    case "rect":
                        this.cancelCroppingImage();
                        this.currentActiveTool = type;
                        this.params = {
                            fill: (params && params.fill) ? params.fill : 'transparent',
                            stroke: (params && params.stroke) ? params.stroke : this.color,
                            strokeWidth: (params && params.strokeWidth) ? params.strokeWidth : this.strokeWidth,
                            angle: (params && params.angle) ? params.angle : 0,
                            width: (params && params.width) ? params.width : null,
                            height: (params && params.height) ? params.height : null,
                            top: (params && params.top) ? params.top : 0,
                            left: (params && params.left) ? params.left : 0,
                            opacity: (params && params.opacity) ? params.opacity : 1,
                            strokeUniform: (params && params.strokeUniform) ? params.strokeUniform : true,
                            noScaleCache: (params && params.noScaleCache) ? params.noScaleCache : false,
                            strokeDashArray: (params && params.strokeDashArray) ? params.strokeDashArray : false,
                            borderRadius: (params && params.borderRadius) ? params.borderRadius : 0,
                            id: (params && params.id) ? params.id : '',
                        };
                        this.customRect(type, this.params);
                        break;
                    case "comment":
                        this.cancelCroppingImage();
                        this.currentActiveTool = type;
                        this.params = {
                            fill: (params && params.fill) ? params.fill : 'transparent',
                            stroke: (params && params.stroke) ? params.stroke : this.color,
                            strokeWidth: (params && params.strokeWidth) ? params.strokeWidth : this.strokeWidth,
                            angle: (params && params.angle) ? params.angle : 0,
                            width: (params && params.width) ? params.width : null,
                            height: (params && params.height) ? params.height : null,
                            top: (params && params.top) ? params.top : 0,
                            left: (params && params.left) ? params.left : 0,
                            opacity: (params && params.opacity) ? params.opacity : 1,
                            strokeUniform: (params && params.strokeUniform) ? params.strokeUniform : true,
                            noScaleCache: (params && params.noScaleCache) ? params.noScaleCache : false,
                            strokeDashArray: (params && params.strokeDashArray) ? params.strokeDashArray : false,
                            borderRadius: (params && params.borderRadius) ? params.borderRadius : 0,
                            id: (params && params.id) ? params.id : '',
                        };
                        this.customRect(type, this.params);
                        break;
                    case "line":
                        this.cancelCroppingImage();
                        this.currentActiveTool = type;
                        this.params = {
                            fill: (params && params.fill) ? params.fill : 'transparent',
                            stroke: (params && params.stroke) ? params.stroke : this.color,
                            strokeWidth: (params && params.strokeWidth) ? params.strokeWidth : this.strokeWidth,
                            angle: (params && params.angle) ? params.angle : 0,
                            width: (params && params.width) ? params.width : null,
                            height: (params && params.height) ? params.height : null,
                            top: (params && params.top) ? params.top : 0,
                            left: (params && params.left) ? params.left : 0,
                            opacity: (params && params.opacity) ? params.opacity : 1,
                            strokeUniform: (params && params.strokeUniform) ? params.strokeUniform : true,
                            noScaleCache: (params && params.noScaleCache) ? params.noScaleCache : false,
                            strokeDashArray: (params && params.strokeDashArray) ? params.strokeDashArray : false,
                            id: (params && params.id) ? params.id : '',
                        };
                        this.customRect(type, this.params);
                        break;
                    case 'selectMode':
                        this.currentActiveTool = type;
                        this.drag();
                        break;

                    case 'arrow':
                        this.currentActiveTool = type;
                        this.params = {
                            fill: (params && params.fill) ? params.fill : 'transparent',
                            stroke: (params && params.stroke) ? params.stroke : this.color,
                            strokeWidth: (params && params.strokeWidth) ? params.strokeWidth : this.strokeWidth,
                            strokeUniform: (params && params.strokeUniform) ? params.strokeUniform : true,
                            noScaleCache: (params && params.noScaleCache) ? params.noScaleCache : false,
                            strokeDashArray: (params && params.strokeDashArray) ? params.strokeDashArray : false,
                            id: (params && params.id) ? params.id : '',
                        };
                        this.drawArrow(this.params);
                        break;
                    case 'freeDrawing':
                        this.currentActiveTool = type;
                        this.params = {
                            stroke: (params && params.stroke) ? params.stroke : this.color,
                            strokeWidth: (params && params.strokeWidth) ? params.strokeWidth : this.strokeWidth,
                            drawingMode: (params && params.drawingMode) ? params.drawingMode : true,
                            id: (params && params.id) ? params.id : '',
                        };
                        this.drawing(this.params);
                        break;
                    case 'crop':
                        this.currentActiveTool = type;
                        this.params = {
                            width: (params && params.width) ? params.width : 200,
                            height: (params && params.height) ? params.height : 200,
                            overlayColor: (params && params.overlayColor) ? params.overlayColor : "#000",
                            overlayOpacity: (params && params.overlayOpacity) ? params.overlayOpacity : 0.7,
                            transparentCorner: (params && params.transparentCorner) ? params.transparentCorner : false,
                            hasRotatingPoint: (params && params.hasRotatingPoint) ? params.hasRotatingPoint : false,
                            hasControls: (params && params.hasControls) ? params.hasControls : true,
                            cornerSize: (params && params.cornerSize) ? params.cornerSize : 10,
                            borderColor: (params && params.borderColor) ? params.borderColor : "#000",
                            cornerColor: (params && params.cornerColor) ? params.cornerColor : "#000",
                            cornerStyle: (params && params.cornerStyle) ? params.cornerStyle : "circle",
                            strokeColor: (params && params.strokeColor) ? params.strokeColor : "#000",
                            lockUniScaling: (params && params.lockUniScaling) ? params.lockUniScaling : true,
                            noScaleCache: (params && params.noScaleCache) ? params.noScaleCache : false,
                            strokeUniform: (params && params.strokeUniform) ? params.strokeUniform : true
                        };
                        this.currentActiveMethod = this.cropImage;
                        this.drag();
                        this.croppedImage = true;
                        new CropImage(this.canvas, true, false, false, this.params);
                        break;
                    case 'eraser':
                        this.canvas.off('mouse:down');
                        this.currentActiveTool = type;
                        let inst = this;
                        this.canvas.isDrawingMode = false;
                        inst.selectable = true;
                        this.canvas.on("mouse:down", function () {
                            if (inst.canvas.getActiveObject()) {
                                inst.canvas.remove(inst.canvas.getActiveObject());
                                let canvasProperties = {width: inst.canvas.width, height: inst.canvas.height}
                                let currentCanvas = {json: inst.canvas.toJSON(), canvas: canvasProperties};
                                new CanvasHistory(inst.canvas, currentCanvas);
                            }
                        });
                        break;
                    default:
                }
            },
            saveImage() {
                this.cancelCroppingImage();
                return this.canvas.toDataURL('image/jpeg', 1);
            },
            uploadImage(e) {
                this.cancelCroppingImage();
                let inst = this;
                let reader = new FileReader();
                reader.onload = function (event) {
                    let imgObj = new Image();
                    imgObj.src = event.target.result;
                    imgObj.onload = function () {
                        let image = new fabric.Image(imgObj);
                        if (inst.canvas.width <= image.width || inst.canvas.height <= image.height) {
                            let canvasAspect = inst.canvas.width / inst.canvas.height;
                            let imgAspect = image.width / image.height;
                            let top, left, scaleFactor;
                            if (canvasAspect >= imgAspect) {
                                scaleFactor = inst.canvas.height / image.height
                                top = 0;
                                left = -((image.width * scaleFactor) - inst.canvas.width) / 2;
                            } else {
                                scaleFactor = inst.canvas.width / image.width;
                                left = 0;
                                top = -((image.height * scaleFactor) - inst.canvas.height) / 2;
                            }
                            inst.canvas.setBackgroundImage(image, inst.canvas.renderAll.bind(inst.canvas), {
                                top: top,
                                left: left,
                                scaleX: scaleFactor,
                                scaleY: scaleFactor
                            });
                            let canvasProperties = {width: inst.canvas.width, height: inst.canvas.height};
                            let currentCanvas = {
                                json: inst.canvas.toJSON(),
                                croppedImage: inst.canvas.toDataURL(),
                                canvas: canvasProperties
                            };
                            new CanvasHistory(inst.canvas, currentCanvas)
                            inst.canvas.renderAll();
                        } else {
                            let center = inst.canvas.getCenter();
                            inst.canvas.setBackgroundImage(image, inst.canvas.renderAll.bind(inst.canvas), {
                                top: center.top,
                                left: center.left,
                                originX: 'center',
                                originY: 'center'
                            });
                            let canvasProperties = {width: inst.canvas.width, height: inst.canvas.height};
                            let currentCanvas = {
                                json: inst.canvas.toJSON(),
                                croppedImage: inst.canvas.toDataURL(),
                                canvas: canvasProperties
                            };
                            new CanvasHistory(inst.canvas, currentCanvas)
                            inst.canvas.renderAll();
                        }
                    }
                };
                reader.readAsDataURL(e.target.files[0]);
            },
            customCircle(type, params) {
                this.createArrow = false;
                new Arrow(this.canvas, false)
                this.currentActiveMethod = this.customCircle;
                this.createRect = false;
                this.canvas.isDrawingMode = false;
                if (!params.disableCircleEditing) {
                    this.createCircle = true;
                    new Shape(this.canvas, this.createCircle, type, params);
                } else {
                    this.drawCircle(params);
                }
            },
            customRect(type, params) {
                this.createArrow = false;
                new Arrow(this.canvas, false)
                this.currentActiveMethod = this.customRect;
                this.canvas.isDrawingMode = false;
                this.createCircle = false;
                if (params.width && params.height) {
                    this.drawRect(params);
                } else {
                    this.createRect = true;
                    new Shape(this.canvas, this.createRect, type, params);
                }
            },
            drawArrow(params) {
                this.currentActiveMethod = this.drawArrow;
                this.drag();
                this.createArrow = true;
                new Arrow(this.canvas, this.createArrow, params);
            },
            cancelCroppingImage() {
                this.croppedImage = false;
                new CropImage(this.canvas, false, false, true)
            },
            applyCropping() {
                new CropImage(this.canvas, true, true);
                this.cancelCroppingImage();
            },
            drag() {
                this.currentActiveMethod = this.drag;
                this.canvas.isDrawingMode = false;
                this.canvas.forEachObject(object => {
                    object.selectable = true;
                    object.evented = true;
                });
                if (this.createArrow) {
                    this.createArrow = false;
                    new Arrow(this.canvas, false);
                }
                if (this.createRect || this.createCircle) {
                    this.createRect = false;
                    this.createCircle = false;
                    new Shape(this.canvas, false);
                }
                if (this.createText) {
                    this.createText = false;
                    new Text(this.canvas, false);
                }
                this.cancelCroppingImage();

            },
            addText(params) {
                this.currentActiveMethod = this.addText;
                this.drag();
                this.createText = true;
                new Text(this.canvas, this.createText, params);
            },
            undo() {
                if (this.canvas.getActiveObject()) {
                    this.canvas.discardActiveObject().renderAll()
                }
                this.drag();
                this.history = new CanvasHistory();
                if (this.history.length) {
                    this.objects.push(this.history.pop())
                    if (this.history[this.history.length - 1]) {
                        if (this.history[this.history.length - 1].canvas) {
                            let lastCanvasProperties = this.history[this.history.length - 1].canvas;
                            if (lastCanvasProperties.width != this.canvas.width || lastCanvasProperties.height != this.canvas.height) {
                                this.canvas.setDimensions({
                                    width: lastCanvasProperties.width,
                                    height: lastCanvasProperties.height
                                })
                                JSON.parse(JSON.stringify(this.history[this.history.length - 1]))
                                this.canvas.loadFromJSON(this.history[this.history.length - 1].json)
                            }
                            else{
                                let canvasObjects = this.history[this.history.length - 1].json.objects;
                                if(this.canvas._objects.length > 0){
                                    this.objects.push(this.canvas._objects.pop());
                                }
                            }
                        }

                        if (this.history[this.history.length - 1].croppedImage && this.history[this.history.length - 1].imagePosition) {

                            let inst = this;
                            fabric.Image.fromURL(this.history[this.history.length - 1].croppedImage, function (img) {
                                img.set({
                                    top: -(inst.history[inst.history.length - 1].imagePosition.top),
                                    left: -(inst.history[inst.history.length - 1].imagePosition.left),
                                });
                                inst.canvas.setBackgroundImage(img, inst.canvas.renderAll.bind(inst.canvas));
                            });
                        } else {
                            this.setBackgroundImage(this.history[this.history.length - 1].croppedImage)
                        }
                        this.canvas.renderAll();
                    }
                }
            },
            redo() {
                this.drag();
                if (this.objects.length > 0) {
                    if (this.objects[this.objects.length - 1]) {
                        if (this.objects[this.objects.length - 1].canvas && !this.objects[this.objects.length - 1].type) {
                            let lastCanvasProperties = this.objects[this.objects.length - 1].canvas;
                            if (lastCanvasProperties.width != this.canvas.width || lastCanvasProperties.height != this.canvas.height) {
                                this.canvas.setDimensions({
                                    width: lastCanvasProperties.width,
                                    height: lastCanvasProperties.height
                                })
                            }
                            JSON.parse(JSON.stringify(this.objects[this.objects.length - 1]))
                            this.canvas.loadFromJSON(this.objects[this.objects.length - 1].json)
                        }
                        else if(this.objects[this.objects.length - 1].type){
                            this.canvas.add(this.objects.pop())
                        }
                        if (this.objects[this.objects.length - 1].imagePosition && this.objects[this.objects.length - 1].croppedImage) {
                            let currentProperties;
                            currentProperties = this.objects[this.objects.length - 1].imagePosition;
                            let inst = this;
                            fabric.Image.fromURL(this.objects[this.objects.length - 1].croppedImage, function (img) {
                                inst.canvas.setBackgroundImage(img, inst.canvas.renderAll.bind(inst.canvas));
                            });
                        }
                    }
                    new CanvasHistory(false, false, this.objects.pop())
                }
            },
            drawing(params) {
                if (this.canvas.__eventListeners) {
                    this.canvas.__eventListeners['object:added'] = null;
                }
                this.currentActiveMethod = this.drawing;
                this.drag();
                this.canvas.isDrawingMode = params.drawingMode;
                this.canvas.freeDrawingBrush.color = params.stroke;
                this.canvas.freeDrawingBrush.width = params.strokeWidth;
                this.canvas.freeDrawingBrush.shadow = new fabric.Shadow({
                    blur: 0,
                    affectStroke: true,
                    color: params.stroke,
                    id: params.id ? params.id : ''
                });
                let inst = this;
                this.canvas.on("object:added", function () {
                    if (inst.canvas.isDrawingMode) {
                        let canvasProperties = {width: inst.canvas.width, height: inst.canvas.height}
                        let currentCanvas = {json: inst.canvas.toJSON(), canvas: canvasProperties};
                        new CanvasHistory(inst.canvas, currentCanvas);
                    }
                });
                this.canvas.renderAll();
            },
            drawRect(params) {
                this.drag();
                this.canvas.discardActiveObject();
                if (!this.canvas.getActiveObject()) {
                    this.rectangle = new fabric.Rect({
                        width: params.width,
                        height: params.height,
                        strokeWidth: params.strokeWidth,
                        stroke: params.stroke,
                        fill: params.fill,
                        opacity: params.opacity,
                        left: params.left,
                        top: params.top,
                        noScaleCache: params.noScaleCache
                    });
                    this.canvas.add(this.rectangle);
                }
            },
            drawCircle(params) {
                this.drag();
                this.canvas.discardActiveObject();
                this.circle = new fabric.Circle({
                    left: params.left,
                    top: params.top,
                    radius: params.radius,
                    strokeWidth: params.strokeWidth,
                    stroke: params.stroke,
                    fill: params.fill,
                    borderColor: 'yellow',
                    noScaleCache: params.noScaleCache
                });
                this.canvas.add(this.circle);

                this.canvas.renderAll();
            }
        }

    }
</script>
<style>
    .upper-canvas{
        z-index: 1;
    }
</style>
