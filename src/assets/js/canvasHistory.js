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
            let currentJson = this.canvas.toJSON();  
            currentJson.objects.forEach(function(object) {
                if(object.type == "lineArrow"){
                    object.heads = [1, 0];
                }
            });
            if(cropObject){    
                delete cropObject.json.backgroundImage;
                history.push(cropObject) 
                return history;
            }
            history.push(currentJson);   
        }
        return history;    
    }; 
    return CanvasHistory;
}());
