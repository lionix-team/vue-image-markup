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
    import CropImage from './assets/js/crop';
    import CanvasHistory from './assets/js/canvasHistory';  
    export default {
        name: 'Editor',
        props: ['canvasWidth', 'canvasHeight'],
        data() {        
            return{
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
            this.canvas = new fabric.Canvas('c');
            this.canvas.setDimensions({width: this.canvasWidth, height: this.canvasHeight});  
            this.canvas.backgroundColor = "#fff";
            new CanvasHistory(this.canvas);   
        },
        methods: {  
            setBackgroundImage(imageUrl){
                    let img = new Image();
                    this.toDataUrl(imageUrl, (dataUri) => {
                        img.src = dataUri;
                        let inst = this;
                        img.onload = function () {
                        if (inst.canvas.width <= img.width || inst.canvas.height <= img.height) {
                            let canvasAspect = inst.canvas.width / inst.canvas.height;
                            let imgAspect = img.width / img.height;
                            let top,left,scaleFactor;
                             if (canvasAspect >= imgAspect) {
                                scaleFactor = inst.canvas.height / img.height
                                top = 0;
                                left = -((img.width * scaleFactor) - inst.canvas.width) / 2;
                            } else {
                                scaleFactor = inst.canvas.width / img.width;
                                left = 0;
                                top = -((img.height * scaleFactor) - inst.canvas.height) / 2;
                            }
                            inst.canvas.setBackgroundImage(dataUri, inst.canvas.renderAll.bind(inst.canvas), {
                                top: top,
                                left: left,
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
                this.cancelCroppingImage()
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
                        };
                        this.currentActiveMethod = this.cropImage;            
                        this.drag();    
                        this.croppedImage = true;           
                        new CropImage(this.canvas,true,false,false,this.params);
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
                            let top,left,scaleFactor;
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
                            let croppedImage = { json: inst.canvas.toJSON(), croppedImage: inst.canvas.toDataURL()};
                            let saveCanvas = new CanvasHistory(inst.canvas,croppedImage)
                            inst.canvas.renderAll();
                        }else{
                            let center = inst.canvas.getCenter();
                            inst.canvas.setBackgroundImage(image, inst.canvas.renderAll.bind(inst.canvas), {
                                top: center.top,
                                left: center.left,
                                originX: 'center',
                                originY: 'center'
                            });
                            let croppedImage = { json: inst.canvas.toJSON(), croppedImage: inst.canvas.toDataURL()};
                            let saveCanvas = new CanvasHistory(inst.canvas,croppedImage)
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
            cancelCroppingImage(){
                this.croppedImage = false;
                new CropImage(this.canvas,false,false,true)
            },
            applyCropping(){
                new CropImage(this.canvas,true,true);  
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
                         if(this.history[this.history.length - 1] && this.history[this.history.length - 1].croppedImage){
                           
                            JSON.parse(JSON.stringify(this.history[this.history.length - 1]))
                            this.canvas.loadFromJSON(this.history[this.history.length - 1].json)
                            this.setBackgroundImage(this.history[this.history.length - 1].croppedImage)                            
                        }
                        else{                                                                       
                             this.canvas.loadFromJSON(this.history[this.history.length - 1])
                             this.canvas.renderAll();    
                        }                      
                    }      
            },
            redo() {    
                    this.drag();  
                    if (this.objects.length > 0) {
                        if(this.objects[this.objects.length - 1] && this.objects[this.objects.length - 1].croppedImage){
                            JSON.parse(JSON.stringify(this.objects[this.objects.length - 1]))
                            this.canvas.loadFromJSON(this.objects[this.objects.length - 1].json)
                            this.setBackgroundImage(this.objects[this.objects.length - 1].croppedImage);
                            new CanvasHistory(false,false,this.objects.pop())       
                        }else{
                             this.canvas.loadFromJSON(this.objects[this.objects.length - 1])
                             new CanvasHistory(false,false,this.objects.pop())     
                        }
                } 
            },
            drawing(params) {
                this.currentActiveMethod = this.drawing;
                this.drag();
                this.canvas.isDrawingMode = params.drawingMode;
                this.canvas.freeDrawingBrush.color = params.stroke;
                this.canvas.freeDrawingBrush.width = params.strokeWidth;
                this.canvas.freeDrawingBrush.shadow = new fabric.Shadow({
                    blur: 0,
                    affectStroke: true,
                    color: params.stroke,
                });
                let inst = this;
                this.canvas.on("object:added",function(){
                    if(inst.canvas.isDrawingMode){        
                        new CanvasHistory(inst.canvas)
                    }
                })
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
