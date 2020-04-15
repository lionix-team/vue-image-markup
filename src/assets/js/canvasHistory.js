import {fabric} from "fabric";

export default (function () {

    let history = [];
    function CanvasHistory(canvas,cropObject = false,redoHistory = false) {
        if(redoHistory){
           if(redoHistory.backgroundImage){
               delete redoHistory.backgroundImage
             }  
            history.push(redoHistory)
        }
        if(canvas){
            this.canvas = canvas; 
            let currentCanvas = this.canvas.toJSON();  
            currentCanvas.objects.forEach(function(object) {
                if(object.type == "lineArrow"){
                    object.heads = [1, 0];
                }
            });
            let currentJson = {};  
            
            if(cropObject){
                currentJson = Object.assign(currentJson,cropObject);
                currentJson.json.objects.forEach(function(object) {
                    if(object.type == "lineArrow"){
                        object.heads = [1, 0];
                    }
                });
            }
            history.push(currentJson);   
        }
        return history;    
    }; 
    return CanvasHistory;
}());
