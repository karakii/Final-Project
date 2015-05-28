var canvas;
var gl;
var program; 
var vPosition;
///////////////////////////////////////////////////////////
//Buffer Array
//////////////////////////////////////////////////////////
// Sphere
// update these for however many spheres you're going to make
var pointsArray = [[],[],[],[],[],[]];
var normalsArray = [[],[],[],[],[],[]];
var indexs = [0,0,0,0,0,0];
var nBufferArray = [];
var vBufferArray = [];

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
var smoothxtrans = 3; 
var smoothztrans = 0; 

var flatytrans = 10;// 20;
var flatxtrans = 0; 
var flatztrans = 0;         //bt -10 to 5

var cubextrans = 8;
var cubeytrans = 0;
var cubeztrans =0;

var platformxtrans = 0;
var platformytrans = 0;
var platformztrans = 0;

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
var cupointsArray = [];
var colorsArray = [];
var numVertices  = 36;
var vBuffer1;

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
     cupointsArray.push(vertices[a]); 
     texarray.push(texcord[0]);

     cupointsArray.push(vertices[b]); 
     texarray.push(texcord[1]); 

     cupointsArray.push(vertices[c]); 
     texarray.push(texcord[2]); 
   
     cupointsArray.push(vertices[a]); 
     texarray.push(texcord[0]); 

     cupointsArray.push(vertices[c]); 
     texarray.push(texcord[2]); 

     cupointsArray.push(vertices[d]); 
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

///////////////////////////////////////////////////////////////////////////////
//Sphere Generation
/////////////////////////////////////////////////////////////////////////////////
var va = vec4(0.0, 0.0, -1.0, 1.0);
var vb = vec4(0.0, 0.942809, 0.333333, 1.0);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1.0);
var vd = vec4(0.816497, -0.471405, 0.333333,1.0);

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
// update the amount of pointsarray, indexs, normalsarray
var tetraorder = [
    tetrahedron(va, vb, vc, vd, 3, 0, 0),         //0   smooth sphere
    tetrahedron(va, vb, vc, vd, 3, 1, 1),         //1   flat sphere
// Bounding volumes
     tetrahedron(va, vb, vc, vd, 1, 0, 2)          //2 collision detection sphere // makes around 0-47 indexs[2]

];

////////////////////////////////////////////////////////////////////////////////////
//FOR CUBES
function enableCube (t_Buffer, v_Buffer, n) {
// (texture coordinates, vertex coordinates, n for texture/image 
    // tell shaders it is a cube
    gl.uniform1i( gl.getUniformLocation(program, "firstv"), 1 );
    gl.uniform1i( gl.getUniformLocation(program, "firstf"), 1 );
    // bind the texture coordinates
    gl.bindBuffer( gl.ARRAY_BUFFER, t_Buffer);
    vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );
    // bind the vertex coordinates
    gl.bindBuffer( gl.ARRAY_BUFFER, v_Buffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cupointsArray), gl.STATIC_DRAW );
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition ); 
    // bind texture image
    gl.bindTexture( gl.TEXTURE_2D, texture[n]);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image[n] );
}
// FOR SPHERES
function bindandlighting(j) {
    //tell shader it is a sphere
    gl.uniform1i( gl.getUniformLocation(program, "firstv"), 0 );
    gl.uniform1i( gl.getUniformLocation(program, "firstf"), 0 );
    // tell shader to not pass texture coordinates
    gl.disableVertexAttribArray( vTexCoord );

    // bind the normal coordinates
    gl.bindBuffer( gl.ARRAY_BUFFER, nBufferArray[j]);
    vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);
    // bind the vertex coordinates
    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferArray[j]);
    vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    // math for lighting 
    ambientProduct = mult(lightAmbient, materialamb[j]);
    diffuseProduct = mult(lightDiffuse, materialdif[j]);
    specularProduct = mult(lightSpecular, materialspec[j]);
    // pass lighting params to shader
    gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"),flatten(specularProduct) );   
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, "shininess"),materialshin[j] );
        
}
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


////////////////////////////////////////////////////////////////////////////
// Cube Buffer Data
///////////////////////////////////////////////////////////////////////////
    colorCube(texCoordsArray[0], texCoord);
    colorCube(texCoordsArray[1], texCoord2);

    vBuffer1 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer1 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cupointsArray), gl.STATIC_DRAW );
    
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    for (var m = 0; m < 2 ; m++){
        tBuffer[m] = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer[m] );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray[m]), gl.STATIC_DRAW );
    }
    
/////////////////////////////////////////////////////////////////////////////////////////////
// Store an image from the HTML side
   image[0] = document.getElementById("texImage");
   image[1] = document.getElementById("texImage2");

 // Load the image with different mapping
    configureTexturetri( 1 );
    configureTexturetri( 0 );
    
// /////////////////////////////////////////////////////////////////////////
// // Spheres Buffer Data
// /////////////////////////////////////////////////////////////////////////
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

////////////////////////////////////////////////////////////////////////////////
//event listeners for buttons
///////////////////////////////////////////////////////////////////////////////
    window.addEventListener("keydown",function(event) {
        switch (event.keyCode) {
            case 87:    //W
                platformztrans -= 1;
                break;
            case 65:     // A
                platformxtrans -= 1; 
                break;
            case 83:    //S
                platformztrans += 1; 
                break;
            case 68:    //D
                platformxtrans += 1;
                break;

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
                turn -= 4;
                break;
            case 39: //rotate right
                turn += 4;
                break;
        }
    });
///////////////////////////////////////////////////////////////////////////////////////
   
    render();
}

function render() {
/////////////////////////////////////////////////////////////
// Object Transforms 
///////////////////////////////////////////////////////////////////
    var modelViewTransforms = [
    translate(smoothxtrans,smoothytrans,0),      //smooth sphere
    translate(flatxtrans,flatytrans,0),          //flat sphere
    translate(cubextrans,cubeytrans,cubeztrans),            // textured cube
    translate( platformxtrans, platformytrans, platformztrans)  //platform
   // mult(scale(2,2,2),translate(flatxtrans,flatytrans,0)), // textured cube
   // mult(scale(6,1/2,4),translate( platformxtrans, platformytrans, platformztrans)) // platform
];
////////////////////////////////////////////////////////////////////
// clear the canvas
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
//////////////////////////////////////////////////////////////////////////////////////
// set up the projection 
//////////////////////////////////////////////////////////////////////////////////////
    projectionMatrix = perspective(fovy, canvas.width/canvas.height, near , far);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );

///////////////////////////////////////////////////////////////////////////////////////
// Set up the camera for attaching to the green planet and moving in space
/////////////////////////////////////////////////////////////////////////////////////
// rotate head azimuth
    cameraMatrix = mat4();
    cameraMatrix = mult(cameraMatrix, translate (cameralr, cameraud, fwdback));
    cameraMatrix = mult(cameraMatrix, rotate(turn, vec3(0,1,0) ) );
    gl.uniformMatrix4fv(cameraMatrixLoc, false, flatten(cameraMatrix) );

////////////////////////////////////////////////////////////////////////////////
// check for collisions using the bounding spheres
//////////////////////////////////////////////////////////////////////////////
//var T = inverse(modelViewTransforms[3]);
//four transform objects 
// find out what is wrong with modifiedspherepoint
            // var arraypoint = pointsArray[4];
            // var modifiedspherepoint = mult_vec(mat4(), va);
            //    // platformxtrans -= 0.01;
            // //collision if smaller than 1 (unit sphere)
            //     if (modifiedspherepoint[0]* modifiedspherepoint[0] +
            //         modifiedspherepoint[1]* modifiedspherepoint[1] +
            //         modifiedspherepoint[2]* modifiedspherepoint[2] < 2) {
            //     // COLLISION
            //     platformxtrans -= 0.01;
            // }
 platformxtrans = 0;
//     // check every object that is not the same object
for (var u = 0 ; u < 4; u++) {    
    for (var q = 0; q < 4 ; q++) {
        if (q == u) {}
        else {
        //multiply by the inverse of the transform
           var T = mult (inverse(modelViewTransforms[u]),modelViewTransforms[q]);
            for (var h = 0; h < indexs[2]; h++) {
                var arraypoint = pointsArray[2];
                var modifiedspherepoint =  mult_vec(T, arraypoint[h]);
            //collision if smaller than 2, bigger area
                if (modifiedspherepoint[0]* modifiedspherepoint[0] +
                    modifiedspherepoint[1]* modifiedspherepoint[1] +
                    modifiedspherepoint[2]* modifiedspherepoint[2] < 1) {
                // COLLISION -- implement some kind of physics or something
                    platformxtrans -= 0.01;
                    
                }
            }

        }
    }
}
////////////////////////////////////////////////////////////////////////////////////////
// SMOOTH SPHERE
    //bind each buffer seperately and send to shader , send lighting params to shader
        bindandlighting(0);
    // move each object to the correct place in space
        modelViewMatrix = mat4();
        modelViewMatrix = mult(modelViewMatrix, modelViewTransforms[0]);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    // Draw the spheres
        for( var i=0; i<indexs[0]; i+=3) 
            gl.drawArrays( gl.TRIANGLES, i, 3 );

// move down the screen
     smoothytrans -= 0.1; 

    if (smoothytrans <= -12) {
        smoothytrans = 10;
        smoothxtrans = 8;
        //smoothxtrans = getRandomInt(-10, 10);
    }
///////////////////////////////////////////////////////////////////////////////////////////////
// FLAT SPHERE
    //bind each buffer seperately and send to shader , send lighting params to shader
        bindandlighting(1);
    // move each object to the correct place in space
        modelViewMatrix = mat4();
        modelViewMatrix = mult(modelViewMatrix, modelViewTransforms[1]);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    // Draw the spheres
        for( var i=0; i<indexs[1]; i+=3) 
            gl.drawArrays( gl.TRIANGLES, i, 3 );

// move down the screen
    flatytrans -= 0.1; 

    // if (flatytrans <= -12) {
    //     flatytrans = 10;
    //     flatxtrans = 0;
    //  //   flatztrans = getRandomInt(-10, 5);
    //  //   flatxtrans = getRandomInt(-10, 10);
    // }

///////////////////////////////////////////////////////////////////////////////////////////////////
// CUBE
 // set shaders to cube mode
    enableCube(tBuffer[1], vBuffer1, 1);

    modelViewMatrix = mat4();
    modelViewMatrix = mult(modelViewMatrix, modelViewTransforms[2] );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    // Draw the cube
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );

    cubeytrans -= 0.2;
    if (cubeytrans <= -12) {
        cubeytrans = 10;
        cubextrans = 8;
     //   flatztrans = getRandomInt(-10, 5);
     //   flatxtrans = getRandomInt(-10, 10);
    }

/////////////////////////////////////////////////////////////////////////////////////////////////\
// PLATFORM
    modelViewMatrix = mat4();
    modelViewMatrix = mult(modelViewMatrix, modelViewTransforms[3]);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );


    window.requestAnimFrame(render);
}
