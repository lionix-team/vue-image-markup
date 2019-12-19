# Markup Image with Vue.js (customizable)
[![](https://img.shields.io/npm/dt/vue-image-markup.svg)](https://www.npmjs.com/package/vue-image-markup)
[![](https://img.shields.io/npm/v/vue-image-markup.svg)](https://www.npmjs.com/package/vue-image-markup)

`vue-image-markup` will provide you to edit uploaded image easily and save it. 


## Installation

`npm i vue-image-markup`

or

`yarn add vue-image-markup`

## Usage

First import the Editor component inside 
your Vue component.
```vue
 import Editor from 'vue-image-markup';
```

Then you'll be able to use Editor component.

#### Example:

You must give your editor component ```ref```,which will help you to call the functions to set editor mode,clean objects or undo/redo your changes.
```vue
<Editor :canvasWidth="canvasWidth" :canvasHeight="canvasHeight" ref="editor"/>

mounted() {
    $this.$refs.editor.set(this.editor.mode,this.editor.options);
}

```

`canvasWidth` prop will set editor width

`canvasHeight` prop will set editor height

`ref` with the help of ref, you will control the editor

## Function set(`type`,`params`)
##### With the set() function you choose editor's mode,which should get two parameters `type` and `params`
Editor have 6 modes
 - text
 - circle
 - rect
 - selectMode
 - arrow
 - freeDrawing
 
`params`  parameter must be an object which set the type and every type have it's own options.
 #### Text Mode
##### `set('text',params)` to enable text mode in editor,where `params` must be object and has it's default value
```javascript
this.$refs.editor.set('text')
```
Object key         | Default Value | Description 
-------------       | ------------- | -------------
fill                | `black`   | color
fontFamily          | `Arial`   | font-family
fontSize            | `32`      | font-size
placeholder         | `Add Text`  | default text placeholder when the text will be added
or you can customize your editor text mode styles by overwriting default values.
```javascript
 let textModeOptions = { fill: 'red', fontFamily: 'Verdana',fontSize: 16, placeholder: 'Type something'}
 this.$refs.editor.set('text',textModeOptions)
```
 #### Circle Mode
##### `set('circle',params)` to enable circle mode in editor,where `params` must be object and has it's default value
```javascript
this.$refs.editor.set('circle')
```
Object key         | Default Value       | Description 
-------------       | -------------      | -------------
fill                | `transparent`        | Color inside circle
stroke              | `black`              | Circe border color
strokeWidth         | `7`                  | Circle border width
disableCircleEditing| `false`              | When `false`, can be painted custom circle. When `true`, always will be added circle of fixed height and width
top                | `0`                 | Top position of an object 
left                | `0`                   |Left position of an object 
radius            | `20`                | Radius of the circle
strokeUniform       | `true`         | When `false`, the stoke width will scale with the object. When `true`, the stroke will always match the exact pixel size entered for stroke width
noScaleCache        | `false`         |When `true`, cache does not get updated during scaling. The picture will get block if scaled too much and will be redrawn with correct details at the end of scaling. this setting is performance and application dependant

or you can customize your editor circle mode styles by overwriting default values. 
```javascript
 let circleModeParams = { fill: 'blue',stroke: 'white' }
 this.$refs.editor.set('circle',circleModeParams)
```
 #### Rectangle Mode
##### `set('rect',params)` to enable rect mode in editor,where `params` must be object and has it's default value
```javascript
this.$refs.editor.set('rect')
```
Object key         | Default Value       | Description 
-------------       | -------------      | -------------
fill                | `transparent`        | Color inside rectangle
stroke              | `black`              | Rectangle is rendered via stroke and this property specifies its color
strokeWidth         | `7`                  | Rectangle border width
angle               | `0`                  | Angle of rotation of an object (in degrees)
width               | `0`                  | if rectangle width and height is not 0,editor disable editing rectangle and add the rectangles with fixed properties 
height               | `0`                  | if rectangle width and height is not 0,editor disable editing rectangle and add the rectangles with fixed properties 
top                | `0`                    | Top position of rectangle 
left                | `0`                   |Left position of rectangle 
opacity            | `1`                    | Opacity of rectangle
strokeUniform       | `true`                | When `false`, the stoke width will scale with the object. When `true`, the stroke will always match the exact pixel size entered for stroke width
noScaleCache        | `false`               |When `true`, cache does not get updated during scaling. The picture will get block if scaled too much and will be redrawn with correct details at the end of scaling. this setting is performance and application dependant

or you can customize your editor rectangle mode styles by overwriting default values. 
```javascript
 let customizeRectangle = { fill: 'blue',stroke: 'white',strokeWidth: "5" }
 this.$refs.editor.set('rect',customizeRectangle)
```
#### Select Mode
##### `set('selectMode')` to enable select mode in editor. This mode disable all other types editing and enable select mode for user can move,resize or rotate selected object.This function hasn't `params` parameter

```javascript
this.$refs.editor.set('selectMode')
```
 #### Arrow Mode
##### `set('arrow',params)` to enable arrow mode in editor,where `params` must be object and has it's default value
```javascript
this.$refs.editor.set('arrow')
```
Object key         | Default Value       | Description 
-------------       | -------------      | -------------
stroke              | `black`              | Arrow is rendered via stroke and this property specifies its color
strokeWidth         | `7`                  | Arrow border width
strokeUniform       | `true`                | When `false`, the stroke width will scale with the object. When `true`, the stroke will always match the exact pixel size entered for stroke width
noScaleCache        | `false`               |When `true`, cache does not get updated during scaling. The picture will get blocky if scaled too much and will be redrawn with correct details at the end of scaling. this setting is performance and application dependant

or you can customize your editor's arrow mode styles by overwriting default values. 
```javascript
 let customizeArrow = { stroke: 'red',strokeWidth: "3" }
 this.$refs.editor.set('arrow',customizeArrow)
```
 #### Free Drawing Mode
##### `set('freeDrawing',params)` to enable free drawing mode in editor,where `params` must be object and has it's default value
```javascript
this.$refs.editor.set('freeDrawing')
```
Object key         | Default Value       | Description 
-------------       | -------------      | -------------
stroke              | `black`              | brush's color
strokeWidth         | `7`                  | brush's width

or you can customize your editor's free drawing mode styles by overwriting default values. 
```javascript
 let customizeFreeDrawing = { stroke: 'yellow',strokeWidth: "5" }
 this.$refs.editor.set('freeDrawing',customizeFreeDrawing)
```

## Function setBackgroundImage(imageUrl)
##### `setBackgroundImage(imageUrl)` to set editor background image
```vue
data(){
    return{
        imageUrl:"example.png"
     }
},
methods:{
    this.$refs.editor.setBackgroundImage(this.imageUrl);
}
```

## Function uploadImage(e)
##### `uploadImage(e)` to set background of canvas
```javascript
 this.$refs.editor.uploadImage(e)
```
## Function saveImage()
##### `saveImage()` to save your image,which returns image in base64 format.
```javascript
 this.$refs.editor.saveImage()
```

## Function clear()
##### `clear()` function delete editor's all objects
```javascript
 this.$refs.editor.clear()
```
## Function undo()
##### With the help of undo() function you will be able to remove your last object you have added
```javascript
 this.$refs.editor.undo()
```
## Function redo()
##### With the help of redo() method you will be able to restore your last object which have been removed
```javascript
 this.$refs.editor.redo()
```
## Credits

- [Lilit Simonyan](https://github.com/lilitsimonyan98)
- [Lionix Team](https://github.com/lionix-team)