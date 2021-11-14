export { vsCode, fsCode };

var vsCode = `
attribute vec4 pos;

void main(){
    gl_Position = vec4(pos, 1.0);
}`

var fsCode = `
precision mediump float;

void main(){
    gl_FragColor = vec4(gl_FragCoord.xy, 1.0);
}`
