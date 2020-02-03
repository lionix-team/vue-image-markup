import {fabric} from "fabric";
import CanvasHistory from "./canvasHistory";

export default (function () {
    
    let disabled = false;
    let object;
    let src;
    let drag;
    let clipRect,rect,rectRed;
    let overlay = {};
    let properties
    function CropImage(canvas,draggable = false,apply = false,cancel = false,params) {
        
        this.canvas = canvas;
        if(cancel){
            this.canvas.remove(clipRect);
            this.canvas.remove(rect);
            this.canvas.remove(rectRed);
        }
        if(!draggable){
            drag = false;
            return CropImage;
        }
        drag = draggable;
        disabled = false;
        properties = params;
        src = canvas.toDataURL('image/jpeg');  
        fabric.util.loadImage(src, function (img) {
            object = new fabric.Image(img);    
            object.selectable = false;   
        }) 
      
        if(drag && apply){   
            canvas.clear();
            let overlayCropped = overlay.toDataURL();     
            fabric.util.loadImage(overlayCropped, function (img) {
           
                let clippedImage = new fabric.Image(img);    
                clippedImage.selectable = false;   
                canvas.setBackgroundImage(clippedImage, canvas.renderAll.bind(canvas), {
                    scaleX: canvas.width / clippedImage.width,
                    scaleY: canvas.height / clippedImage.height
                });                   
             }) 

            drag = false; 
            apply= false;
            let croppedImage = { json: canvas.toJSON(), croppedImage: overlayCropped};
            let saveCanvas = new CanvasHistory(this.canvas,croppedImage)
            return CropImage
        }
 
        this.bindEvents();  
        this.canvas.selectable = false;    
        this.canvas.renderAll();
        let inst = this;
        new fabric.Image.fromURL(src, function(oImg) {
             rect = new fabric.Rect({
              left: 0,
              top: 0,
              width: oImg.width,
              height: oImg.height,
              fill: properties.overlayColor,
              selectable: false,
              opacity:properties.overlayOpacity
            });
            inst.canvas.add(rect);
            fabric.Image.fromURL(src, function(oImg1) {
               rectRed = new fabric.Rect({
                left:  (oImg1.width - properties.width)/ 2,
                top:  (oImg1.height - properties.height)/ 2,
                width: properties.width,
                height: properties.height,
                fill: '',
                imageWidth: oImg1.width,
                imageHeight: oImg1.height,
                cornerSize:properties.cornerSize, 
                hasControls: properties.hasControls,
                borderColor: properties.borderColor,
                cornerColor: properties.cornerColor,
                cornerStyle: properties.cornerStyle,
                transparentCorners: properties.transparentCorners,
                hasRotatingPoint: properties.hasRotatingPoint,
               
              });
              clipRect = new fabric.Rect({
                left: -(properties.width /2),
                top: -(properties.height/2),
                width: properties.width,
                height: properties.height,
                fill: '',
                selectable:false,
              });
              oImg1.set({clipPath:clipRect, selectable: false})
            
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
        inst.canvas.on("object:scaling", function(e) {
          let target = e.target;
          clipRect = new fabric.Rect({
              left: target.left - (overlay.width / 2),
              top: target.top - (overlay.height / 2),
              width: properties.width,
              height: properties.height,
              fill: '',
              scaleX: target.scaleX,
              scaleY: target.scaleY,
            });
          overlay.set("clipPath",clipRect)
          inst.canvas.renderAll()       

        });
        inst.canvas.on('object:moving', function (e) {      
            let target = e.target;
            clipRect = new fabric.Rect({
                left: target.left - (overlay.width / 2),
                top: target.top - (overlay.height / 2),
                width: properties.width,
                height: properties.height,
                fill: '',
                scaleX: target.scaleX,
                scaleY: target.scaleY,
              });
            overlay.set("clipPath",clipRect)
            inst.canvas.renderAll()
           });
        
        CropImage.prototype.onMouseDown = function (event) {
            let inst  = this;
            if (disabled || !drag) {
                return CropImage
            } 
            inst.canvas.setActiveObject(rectRed);
        };
    };
    
    return CropImage;
}());