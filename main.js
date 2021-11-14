var gl;
var timeSpent = 0;

// function loadTextFile(url, callback) {
//     var request = new XMLHttpRequest();
//     request.open('GET', url, true);
//     request.addEventListener('load', function() {
//        callback(request.responseText);
//     });
//     request.send();
// }

function initWebGL(canvas) {
    gl = canvas.getContext("webgl");
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    }
}

function renderLoop(){
    quad();
    // window.setTimeout(renderLoop, 1000/60);
}

function render() {
    timeSpent += 1.0 / 60.0;
	var factor = (Math.sin(timeSpent) + 1) * 0.5;
	gl.clearColor(factor * 0.7 + 0.3, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function onLoad(){
    var canvas = document.getElementById("myCanvas");
    initWebGL(canvas);

    if (gl) {
        // Set clear color to black, fully opaque
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // Clear the color buffer with specified clear color
        gl.clear(gl.COLOR_BUFFER_BIT);
        renderLoop();
    }

    // Set shaders
    // loadTextFile("glsl/vs/noop.glsl", function(text) {
    //     vsCode = text;
    // });
    
    // loadTextFile("glsl/fs/basic.glsl", function(text) {
    //     fsCode = text;
    // });
}

function quad() {
    // Define one vertex for each corner
    var vertices = [
        -1, 1, 0.0,  // top left
        -1, -1, 0.0, // bottom left
        1, -1, 0.0,  // bottom right
        1, 1, 0.0,   // top right
    ]

    // Define two triangles using those vertices that make up a quad
    var indices = [3, 2, 1, 1, 0, 3] // CCW Winding order

    // Define the buffer for the vertices
    var vtxBuffer = gl.createBuffer();
    // Bind the buffer (set the state of GL so subsequent ops with the ARRAY_BUFFER refer to this)
    // ARRAY_BUFFER is a buffer that contains vertex attributes
    // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindBuffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vtxBuffer);
    // Store our vertices into the buffer. STATIC_DRAW usage mode is like "write once, read many"
    // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    // Unbind the buffer. Not strictly necessary but since we know we don't want to do more ops with this, we'll make this explicit
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Define the buffer for the vertex indices
    var idxBuffer = gl.createBuffer();
    // Bind the buffer (set the state of GL so subsequent ops with the ELEMENT_ARRAY_BUFFER refer to this)
    // ELEMENT_ARRAY_BUFFER is a buffer that contains element indices
    // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindBuffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuffer);
    // Store our indices into the buffer. STATIC_DRAW usage mode is like "write once, read many"
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    // Unbind the buffer. Not strictly necessary but since we know we don't want to do more ops with this, we'll make this explicit
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    // Vertex shader code. TODO: Read from elsewhere
    var vtxCode = `
    attribute vec3 pos;
    
    void main() {
        gl_Position = vec4(pos, 1.0);
    }`
    // Define a vertex shader
    var vtxShader = gl.createShader(gl.VERTEX_SHADER);
    // Attach the source code to the vertex shader
    gl.shaderSource(vtxShader, vtxCode);
    // Compile the vertex shader
    gl.compileShader(vtxShader);
    // Check compilation status
    var compiled = gl.getShaderParameter(vtxShader, gl.COMPILE_STATUS);
    if (!compiled) {
        alert('Failed to compile VS: ' + gl.getShaderInfoLog(vtxShader));
        gl.deleteShader(vtxShader);
        //TODO: Exit here
    }
    
    var fragCode = `
    precision mediump float;

    uniform vec2 screenSize;
    
    void main(){
        vec2 s = (gl_FragCoord.xy / screenSize) * 2.0 - 1.0; // [-1, 1]
        s = normalize(s);
        // s = 0.5 * s ;
        gl_FragColor = vec4(1.0 - s, abs(s.y * s.x), 1.0);
        //gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }`
    // Define a fragment shader
    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    // Attach the source code to the fragment shader
    gl.shaderSource(fragShader, fragCode);
    // Compile the fragment shader
    gl.compileShader(fragShader);
    // Check compilation status
    var compiled = gl.getShaderParameter(fragShader, gl.COMPILE_STATUS);
    if (!compiled) {
        alert('Failed to compile FS: ' + gl.getShaderInfoLog(fragShader));
        gl.deleteShader(fragShader);
        //TODO: Exit here
    }

    // Create a program containing our shaders
    var prog = gl.createProgram();
    // Attach both shaders to the program
    gl.attachShader(prog, vtxShader);
    gl.attachShader(prog, fragShader);
    // Link the program
    gl.linkProgram(prog);
    // Check linking status
    var linked = gl.getProgramParameter(prog, gl.LINK_STATUS);
    if (!linked) {
        alert('Failed to link program: ' + gl.getProgramInfoLog(prog));
        gl.deleteShader(fragShader);
        //TODO: Exit here
    }
    // Use the program from now on (sets some sort of state)
    gl.useProgram(prog);

    // Now connect our buffer data to the program inputs
    // Work with triangle vertices and indices
    gl.bindBuffer(gl.ARRAY_BUFFER, vtxBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuffer);
    // Find the "pos" variable (attribute) in the shader
    var pos = gl.getAttribLocation(prog, "pos")
    // Binds the current ARRAY_BUFFER to some vertex buffer. In this case the "pos" buffer in the shader
    // 3 is the number of components per vertex in our case, gl.FLOAT is the type of each component
    // the bool parameter has no effect with gl.FLOAT and the remaining two zeroes are offsets
    // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
    gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 0, 0);
    // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/enableVertexAttribArray
    gl.enableVertexAttribArray(pos);
    // get the uniform "screenSize" of the FS, we want to send current canvas size
    var screenSize = gl.getUniformLocation(prog, "screenSize");
    gl.uniform2fv(screenSize, [640.0, 480.0]) // TODO: compute instead

    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Do the drawing
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}
