

var canvas;
var gl;
var program; 

///////////////////////////////////////////////////////////
//Buffer Array
//////////////////////////////////////////////////////////
var pointsArray = [[],[],[],[],[],[]];
var normalsArray = [[],[],[],[],[],[]];
var nBufferArray = [];
var vBufferArray = [];
var indexs = [0,0,0,0,0,0];
////////////////////////////////////////////////////////////
// Movement Variables 
/////////////////////////////////////////////////////////////
var fwdback = -30;
var cameralr = 0;
var cameraud = 0;
var fovy = 45;
var far =1000;
var near =0.1;
var turn = 0;
var scal = 0;
var count = 0;
var aspect;

var smoothytrans = 15;
var smoothxtrans = -15; 

var flatytrans = 20;
var flatxtrans = -15; 

////////////////////////////////////////////////////////////

// Shading Variables
var ambientColor, diffuseColor, specularColor;

//Viewing Variables
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var normalMatrix, normalMatrixLoc;


//////////////////////////////////////////////////
// Make Cube
//////////////////////////////////////////////////
//var pointsArray = [];
//var colorsArray = [];
var numVertices  = 36;

var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

function quad(a, b, c, d, texarray, texcord) {
     pointsArray.push(vertices[a]); 
     texarray.push(texcord[0]);

     pointsArray.push(vertices[b]); 
     texarray.push(texcord[1]); 

     pointsArray.push(vertices[c]); 
     texarray.push(texcord[2]); 
   
     pointsArray.push(vertices[a]); 
     texarray.push(texcord[0]); 

     pointsArray.push(vertices[c]); 
     texarray.push(texcord[2]); 

     pointsArray.push(vertices[d]); 
     texarray.push(texcord[3]);   
}

function colorCube(texarray, texcord)
{
    quad( 1, 0, 3, 2, texarray, texcord  );
    quad( 2, 3, 7, 6, texarray, texcord  );
    quad( 3, 0, 4, 7, texarray, texcord  );
    quad( 6, 5, 1, 2, texarray, texcord  );
    quad( 4, 5, 6, 7, texarray, texcord  );
    quad( 5, 4, 0, 1, texarray, texcord  );
}

/////////////////////////////////////////////////////////////


////////////////////////////////////////////////
// Texture Map
////////////////////////////////////////////////
var tBuffer = [];
var texCoordsArray = [[],[]];
var vTexCoord;

var texture = [];
var image = [];
var texSize = 32;

// Manipulate to scale, maps s,t to x,y
// map 1:1
var texCoord2  = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

// map 2:1 to scale out
var texCoord = [
    vec2(0, 0),
    vec2(0, 2),
    vec2(2, 2),
    vec2(2, 0)
];

// Tri linear mapping
function configureTexturetri(n) {
    texture[n] = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture[n] );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image[n] );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
    
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}

// Nearest Neighbor mapping
function configureTexturenear(n) {
    texture[n] = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture[n] );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image[n] );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}

// call to switch textures
function enableTexture (n) {
  gl.bindTexture( gl.TEXTURE_2D, texture[n] );
  gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image[n] );
}

/////////////////////////////////////////////////////////
//Lighting 
////////////////////////////////////////////////////////////////
var lightPosition = vec4(0.0, -10.0, 10.0, 1.0 );
var lightAmbient = vec4(0.35, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 0.9, 0.9, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialamb = [
    vec4( 1.0, 1.0, 0.0, 0.0 ),
    vec4( 0.0, 0.0, 1.0, 0.0 )
];

// color of light reflection
var materialdif =[
    vec4( 1.0, 1.0, 0.0, 1.0 ),
    vec4( 1.0, 0.0, 0.0, 1.0 )

];

var materialspec = [
    vec4( 1.0, 1.0, 1.0, 1.0 ),
    vec4( 1.0, 1.0, 0.0, 1.0 )
];

var materialshin =[
    1,
    10
];

// Function takes care of the lighting effects for each planet as well as binding the buffers to the shaders
function bindandlighting(j) {
    gl.bindBuffer( gl.ARRAY_BUFFER, nBufferArray[j]);
    vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferArray[j]);
    vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    ambientProduct = mult(lightAmbient, materialamb[j]);
    diffuseProduct = mult(lightDiffuse, materialdif[j]);
    specularProduct = mult(lightSpecular, materialspec[j]);
    gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"),flatten(specularProduct) );   
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, "shininess"),materialshin[j] );
        
}



/////////////////////////////////////////////////////////////////////////////////////
//Size and Location Helpers
////////////////////////////////////////////////////////////////////////////////////
var translatesphere = [
    translate (0  , 0 , 0),            // use if no tilt
    translate (5  ,0 ,0),
    translate (8 ,0 ,0),
    translate (20 ,0 ,0),
    translate (25,0 ,0),
    translate (3 ,0 ,0)
];

var inversetranslate = [
    translate (0  ,30 ,70),  
    translate (-5  ,0 ,0),
    translate (-8 ,0 ,0),
    translate (-20 ,0 ,0),
    translate (-25,0 ,0),
    translate (-5 ,0 ,0)
]
var scalesphere = [
    scale (3.0, 3.0, 3.0),
    scale (2.2, 2.2, 2.2),
    scale (2.5, 2.5, 2.5),
    scale (1.5, 1.5, 1.5),
    scale (1.7, 1.7, 1.7),
    scale (0.5, 0.5, 0.5)
];
var inversescale= [
    scale (1/2.0, 1/2.0, 1/2.0),
    scale (1/2.2, 1/2.2, 1/2.2),
    scale (1/2.5, 1/2.5, 1/2.5),
    scale (1/1.5, 1/1.5, 1/1.5),
    scale (1/1.7, 1/1.7, 1/1.7),
    scale (1/0.25, 1/0.25, 1/0.25)
];

var rotatespheres = [
  //  0, 0, 15 ,30, 40, 25
    0 , 0, 0, 0, 0, 0
];

var rotateadd = [
    0, 0.5, 0.4, 0.7, 0.45, 4
];
///////////////////////////////////////////////////////////////////////////////
//Sphere Generation
/////////////////////////////////////////////////////////////////////////////////


var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

// For flat shaded sphere - has one normal per triangle
function triangleflat(a, b, c , m) {

     var t1 = subtract(b, a);
     var t2 = subtract(c, a);
     var normal = normalize(cross(t2, t1));
     normal = vec4(normal);
     normal[3]  = 0.0;

     normalsArray[m].push(normal);
     normalsArray[m].push(normal);
     normalsArray[m].push(normal);

     
     pointsArray[m].push(a);
     pointsArray[m].push(b);      
     pointsArray[m].push(c);

     indexs[m] += 3;
}
// For smooth shaded sphere - has different normals per vertex
function trianglesmooth(a, b, c, m) {

     pointsArray[m].push(a);
     pointsArray[m].push(b);      
     pointsArray[m].push(c);
     
          // normals are vectors
     
     normalsArray[m].push(a[0],a[1], a[2], 0.0);
     normalsArray[m].push(b[0],b[1], b[2], 0.0);
     normalsArray[m].push(c[0],c[1], c[2], 0.0);


     indexs[m] += 3;
}

function divideTriangle(a, b, c, count, flat, m) {
    if ( count > 0 ) {
                
        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);
                
        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);
                                
        divideTriangle( a, ab, ac, count - 1, flat, m );
        divideTriangle( ab, b, bc, count - 1, flat, m);
        divideTriangle( bc, c, ac, count - 1, flat, m );
        divideTriangle( ab, bc, ac, count - 1,flat, m );
    }
    else { 
        if (flat == 1)
            triangleflat( a, b, c , m);
        else
            trianglesmooth( a, b, c, m );
    }
}

// set flat to 1 for flat shaded, otherwise, flat = 0. m sets the location on
// an array to hold the indexes, buffers, and points arrays
function tetrahedron(a, b, c, d, n, flat, m) {
    divideTriangle(a, b, c, n, flat, m);
    divideTriangle(d, c, b, n, flat, m);
    divideTriangle(a, d, b, n, flat, m);
    divideTriangle(a, c, d, n, flat, m);
}

// sets the order for constructing each object in space
var tetraorder = [
    tetrahedron(va, vb, vc, vd, 3, 2, 0),         // SUn
    tetrahedron(va, vb, vc, vd, 3, 1, 1)         //ICY WHITE, MED/LOW , FLAT
 //    tetrahedron(va, vb, vc, vd, 2, 0, 2),         // GREEN, MED/LOW, GOURAD
 //    tetrahedron(va, vb, vc, vd, 3, 0, 3),         //WATER, HIGH, PHONG
 //    tetrahedron(va, vb, vc, vd, 3, 0, 4),         // ORANGE, MED/HIGH, NO SPEC
 // //   tetrahedron(va, vb, vc, vd, 1, 0, 5)         //MOON - dont need. just use another planets sphere
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);           // enable 3d depth

//  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    for ( var m = 0; m < 2; m++) {
    // sets the planet complexity and whether it is flat shaded or not
        tetraorder[m];

    // create seperate normal and vertex buffer for each object in the solar system
        nBufferArray[m] = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, nBufferArray[m]);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray[m]), gl.STATIC_DRAW );
        vBufferArray[m] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferArray[m]);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray[m]), gl.STATIC_DRAW);
    }

 //////////////////////////////////////////////////////////////////////////////////   
 // Link the variables
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    cameraMatrixLoc = gl.getUniformLocation( program, "cameraMatrix");
    cameralookLoc = gl.getUniformLocation (program,"cameraLook");

////////////////////////////////////////////////////////////////////////////////
//event listeners for buttons
///////////////////////////////////////////////////////////////////////////////
    window.addEventListener("keydown",function(event) {
        switch (event.keyCode) {
            case 74: //'j' left
                cameralr = cameralr + (0.25 * Math.cos(Math.PI  * turn / 180.0));
                fwdback = fwdback + (0.25*  Math.sin(Math.PI  * turn / 180.0));
                break;
            case 75: // 'k' right
                cameralr = cameralr - (0.25 * Math.cos(Math.PI  * turn / 180.0));
                fwdback = fwdback - (0.25*  Math.sin(Math.PI  * turn / 180.0));
                break;
            case 73: // "i" forward
                fwdback = fwdback + (0.25 * Math.cos(Math.PI  * turn / 180.0));
                cameralr = cameralr - (0.25*  Math.sin(Math.PI  * turn / 180.0));
                break;
            case 77: //'m' back
                fwdback = fwdback - (0.25 * Math.cos(Math.PI  * turn / 180.0));
                cameralr = cameralr + (0.25*  Math.sin(Math.PI  * turn / 180.0));
                break; 
            
            case 40: // up
                cameraud += 0.25;
                break;
            case 38: //down
                cameraud += -0.25
                break;
            case 87: //wider  'w'
                fovy += 1;
                break;
            case 78: //narrower 'n'
                fovy += -1;
                break;
            case 82: //reset 'r'
                fwdback = 0;
                cameralr = 0;
                cameraud = 0;
                fovy = 45;
                far =1000;
                near =0.1;
                turn = 0;
                break;
            case 37: // rotate left
                turn -= 1;
                break;
            case 39: //rotate right
                turn += 1;
                break;
            case 67: // c key , stick to green (2nd) planet
                if (stick == 1)
                    stick = 0;
                else 
                    stick = 1;   
                break;       
        }
    });
///////////////////////////////////////////////////////////////////////////////////////
   
    render();
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
//////////////////////////////////////////////////////////////////////////////////////
// set up the projection 
//////////////////////////////////////////////////////////////////////////////////////
    projectionMatrix = perspective(fovy, canvas.width/canvas.height, near , far);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );

///////////////////////////////////////////////////////////////////////////////////////
// Set up the camera for attaching to the green planet and moving in space
/////////////////////////////////////////////////////////////////////////////////////
    cameraLook = mat4();
    gl.uniformMatrix4fv(cameralookLoc, false, flatten(cameraLook) ); 
    

// rotate head azimuth
    cameraMatrix = mat4();
   // cameraMatrix = mult(cameraMatrix, rotate(turn, vec3(0,1,0) ) );
    cameraMatrix = mult(cameraMatrix, translate (cameralr, cameraud, fwdback))
    cameraMatrix = mult(cameraMatrix, rotate(turn, vec3(0,1,0) ) );
    gl.uniformMatrix4fv(cameraMatrixLoc, false, flatten(cameraMatrix) );



// SMOOTH SPHERE
    //bind each buffer seperately and send to shader , send lighting params to shader
        bindandlighting(0);
    // move each object to the correct place in space
        modelViewMatrix = mat4();
        modelViewMatrix = mult(modelViewMatrix, translate(smoothxtrans,smoothytrans,0));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    // Draw the spheres
        for( var i=0; i<indexs[0]; i+=3) 
            gl.drawArrays( gl.TRIANGLES, i, 3 );

// move down the screen
    smoothytrans -= 0.1; 

    if (smoothytrans <= -12) {
        smoothytrans = 10;
        smoothxtrans = getRandomInt(-10, 10);
    }
// FLAT SPHERE
    //bind each buffer seperately and send to shader , send lighting params to shader
        bindandlighting(1);
    // move each object to the correct place in space
        modelViewMatrix = mat4();
        modelViewMatrix = mult(modelViewMatrix, translate(flatxtrans,flatytrans,0));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    // Draw the spheres
        for( var i=0; i<indexs[1]; i+=3) 
            gl.drawArrays( gl.TRIANGLES, i, 3 );

// move down the screen
    flatytrans -= 0.1; 

    if (flatytrans <= -12) {
        flatytrans = 10;
        flatxtrans = getRandomInt(-10, 10);
    }

//CUBE
 // set shaders to cube mode
    gl.uniform1i( gl.getUniformLocation(program, "firstv"), 1 );
    gl.uniform1i( gl.getUniformLocation(program, "firstf"), 1 );







    window.requestAnimFrame(render);
}
