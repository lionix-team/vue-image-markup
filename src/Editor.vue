<template>
    <div class="custom-editor">
        <canvas id="c"></canvas>
    </div>
</template>

<script>
    import {fabric} from 'fabric';
    import Shape from './assets/js/shape';
    import Text from './assets/js/text';
    import Arrow from './assets/js/arrow';

    export default {
        name: 'Editor',
        props: ['canvasWidth', 'canvasHeight'],
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
            }

        },
        mounted() {
            this.canvas = new fabric.Canvas('c');
            this.canvas.setDimensions({width: this.canvasWidth, height: this.canvasHeight});
        },
        methods: {
            setBackgroundImage(imageUrl){
                let img = new Image();
                this.toDataUrl(imageUrl, (dataUri) => {
                    img.src = dataUri;
                    let inst = this;
                    if (inst.canvas.width <= img.width || inst.canvas.height <= img.height) {
                        var canvasAspect = inst.canvas.width / inst.canvas.height;
                        var imgAspect = img.width / img.height;
                        if (canvasAspect >= imgAspect) {
                            var scaleFactor = inst.canvas.width / img.width;
                            var left = 0;
                            var top = -((img.height * scaleFactor) - inst.canvas.height) / 2;

                        } else {
                            var scaleFactor = inst.canvas.height / img.height;
                            var top = 0;
                            var left = -((img.width * scaleFactor) - inst.canvas.width) / 2;
                        }
                        img.width = inst.canvas.width;
                        img.height = inst.canvas.height;

                        inst.canvas.setBackgroundImage(dataUri, inst.canvas.renderAll.bind(inst.canvas), {
                            top: top,
                            left: left,
                            originX: 'left',
                            originY: 'top',
                            scaleX: scaleFactor,
                            scaleY: scaleFactor
                        });
                        inst.canvas.renderAll()
                    }else{
                        let center = inst.canvas.getCenter();
                        inst.canvas.setBackgroundImage(dataUri, inst.canvas.renderAll.bind(inst.canvas), {
                            top: center.top,
                            left: center.left,
                            originX: 'center',
                            originY: 'center'
                        });
                        inst.canvas.renderAll()
                    }
                });
            },
            toDataUrl(url, callback) {
                var xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    var reader = new FileReader();
                    reader.onloadend = () => {
                        callback(reader.result);
                    }
                    reader.readAsDataURL(xhr.response);
                };
                xhr.open('GET', url);
                xhr.responseType = 'blob';
                xhr.send();
            },
            clear() {
                this.canvas.clear();
            },
            changeColor(colorProperty) {
                this.color = colorProperty;
                this.set(this.currentActiveTool)
            },
            set(type, params) {
                switch (type) {
                    case "text":
                        this.currentActiveTool = type;
                        this.params = {
                            fill: (params && params.fill) ? params.fill : this.color,
                            fontFamily: (params && params.fontFamily) ? params.fontFamily : 'Arial',
                            fontSize: (params && params.fontSize) ? params.fontSize : this.fontSize,
                            placeholder: (params && params.placeholder) ? params.placeholder : 'Add Text',
                        };
                        this.addText(this.params);
                        break;

                    case "circle":
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
                        };
                        this.customCircle(type, this.params);
                        break;
                    case "rect":
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
                        };
                        this.drawArrow(this.params);
                        break;
                    case 'freeDrawing':
                        this.currentActiveTool = type;
                        this.params = {
                            stroke: (params && params.stroke) ? params.stroke : this.color,
                            strokeWidth: (params && params.strokeWidth) ? params.strokeWidth : this.strokeWidth,
                            drawingMode: (params && params.drawingMode) ? params.drawingMode : true,
                        };
                        this.drawing(this.params);
                        break;
                    default:
                }
            },
            saveImage() {
                return this.canvas.toDataURL('image/jpeg', 1);
            },
            uploadImage(e) {
                let inst = this;
                let reader = new FileReader();
                reader.onload = function (event) {
                    let imgObj = new Image();
                    imgObj.src = event.target.result;
                    imgObj.onload = function () {
                        let image = new fabric.Image(imgObj);
                        if (inst.canvas.width <= image.width || inst.canvas.height <= image.height) {
                            var canvasAspect = inst.canvas.width / inst.canvas.height;
                            var imgAspect = image.width / image.height;
                            if (canvasAspect >= imgAspect) {
                                var scaleFactor = inst.canvas.width / image.width;
                                var left = 0;
                                var top = -((image.height * scaleFactor) - inst.canvas.height) / 2;

                            } else {
                                var scaleFactor = inst.canvas.height / image.height;
                                var top = 0;
                                var left = -((image.width * scaleFactor) - inst.canvas.width) / 2;
                            }
                            inst.canvas.setBackgroundImage(image, inst.canvas.renderAll.bind(inst.canvas), {
                                top: top,
                                left: left,
                                originX: 'left',
                                originY: 'top',
                                scaleX: scaleFactor,
                                scaleY: scaleFactor
                            });
                            inst.canvas.renderAll();
                        }else{
                            let center = inst.canvas.getCenter();
                            inst.canvas.setBackgroundImage(image, inst.canvas.renderAll.bind(inst.canvas), {
                                top: center.top,
                                left: center.left,
                                originX: 'center',
                                originY: 'center'
                            });
                            inst.canvas.renderAll();
                        }
                    }
                }
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
            drag() {
                this.currentActiveMethod = this.drag;
                this.canvas.isDrawingMode = false;
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
            },
            addText(params) {
                this.currentActiveMethod = this.addText;
                this.drag();
                this.createText = true;
                new Text(this.canvas, this.createText, params);
            },
            undo() {
                if (this.canvas._objects.length > 0) {
                    this.objects.push(this.canvas._objects.pop());
                    this.canvas.renderAll();
                }
                if (this.canvas.getActiveObject()) {
                    this.canvas.discardActiveObject().renderAll()
                }
            },
            redo() {
                if (this.objects.length > 0) {
                    this.canvas.add(this.objects.pop());
                }
            },
            drawing(params) {

                this.currentActiveMethod = this.drawing;
                this.drag();
                this.canvas.freeDrawingBrush.color = params.stroke;
                this.canvas.freeDrawingBrush.width = params.strokeWidth;
                this.canvas.isDrawingMode = params.drawingMode;
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
                        // strokeUniform: params.strokeUniform,
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
                    // strokeUniform: params.strokeUniform,
                    noScaleCache: params.noScaleCache
                });
                this.canvas.add(this.circle);

                this.canvas.renderAll();
            }
        }

    }
</script>
<style>

</style>
