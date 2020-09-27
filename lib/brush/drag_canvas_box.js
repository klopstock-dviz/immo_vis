
        // canvas related vars
/*        var canvas=document.createElement("canvas");
        var ctx=canvas.getContext("2d");
        var cw=canvas.width;
        var ch=canvas.height;
        document.body.appendChild(canvas);
        canvas.style.border='1px solid red';*/

        var canvas = document.getElementById('canvas')
        var cw=canvas.width;
        var ch=canvas.height;

        var ctx = canvas.getContext('2d')


        // used to calc canvas position relative to window
        function reOffset(){
            var BB=canvas.getBoundingClientRect();
            offsetX=BB.left;
            offsetY=BB.top;        
        }
        var offsetX,offsetY;
        reOffset();
        window.onscroll=function(e){ reOffset(); }
        window.onresize=function(e){ reOffset(); }
        canvas.onresize=function(e){ reOffset(); }

        // save relevant information about shapes drawn on the canvas
        var shapes=[];
        // define one circle and save it in the shapes[] array
        shapes.push( {x:30, y:30, radius:15, color:'blue'} );
        // define one rectangle and save it in the shapes[] array
        shapes.push( {x:100, y:-1, width:75, height:35, color:'red'} );

        // drag related vars
        var isDragging=false;
        var startX,startY;

        // hold the index of the shape being dragged (if any)
        var selectedShapeIndex;

        // draw the shapes on the canvas
        //drawAll();

        // listen for mouse events
        /*canvas.onmousedown=handleMouseDown;
        canvas.onmousemove=handleMouseMove;
        canvas.onmouseup=handleMouseUp;
        canvas.onmouseout=handleMouseOut;*/

        // given mouse X & Y (mx & my) and shape object
        // return true/false whether mouse is inside the shape
        function isMouseInShape(mx,my,shape){
            if(shape.radius){
                // this is a circle
                var dx=mx-shape.x;
                var dy=my-shape.y;
                // math test to see if mouse is inside circle
                if(dx*dx+dy*dy<shape.radius*shape.radius){
                    // yes, mouse is inside this circle
                    return(true);
                }
            }else if(shape.width){
                // this is a rectangle
                var rLeft=shape.x;
                var rRight=shape.x+shape.width;
                var rTop=shape.y;
                var rBott=shape.y+shape.height;
                // math test to see if mouse is inside rectangle
                if( mx>rLeft && mx<rRight && my>rTop && my<rBott){
                    return(true);
                }
            }
            // the mouse isn't in any of the shapes
            return(false);
        }

        function handleMouseDown(e){
            // tell the browser we're handling this event
            e.preventDefault();
            e.stopPropagation();
            // calculate the current mouse position
            startX=parseInt(e.clientX-offsetX);
            startY=parseInt(e.clientY-offsetY);
            // test mouse position against all shapes
            // post result if mouse is in a shape
            for(var i=0;i<shapes.length;i++){
                if(isMouseInShape(startX,startY,shapes[i])){
                    // the mouse is inside this shape
                    // select this shape
                    selectedShapeIndex=i;
                    // set the isDragging flag
                    isDragging=true;
                    // and return (==stop looking for 
                    //     further shapes under the mouse)
                    return;
                }
            }
        }

        function handleMouseUp(e){
            // return if we're not dragging
            if(!isDragging){return;}
            // tell the browser we're handling this event
            e.preventDefault();
            e.stopPropagation();
            // the drag is over -- clear the isDragging flag
            isDragging=false;
        }

        function handleMouseOut(e){
            // return if we're not dragging
            if(!isDragging){return;}
            // tell the browser we're handling this event
            e.preventDefault();
            e.stopPropagation();
            // the drag is over -- clear the isDragging flag
            isDragging=false;
        }

        function handleMouseMove(e){
            // return if we're not dragging
            if(!isDragging){return;}
            // tell the browser we're handling this event
            e.preventDefault();
            e.stopPropagation();
            // calculate the current mouse position         
            mouseX=parseInt(e.clientX-offsetX);
            mouseY=parseInt(e.clientY-offsetY);
            // how far has the mouse dragged from its previous mousemove position?
            var dx=mouseX-startX;
            var dy=mouseY-startY;
            // move the selected shape by the drag distance
            var selectedShape=shapes[selectedShapeIndex];
            selectedShape.x+=dx;
            selectedShape.y+=dy;
            // clear the canvas and redraw all shapes
            drawAll();
            // update the starting drag position (== the current mouse position)
            startX=mouseX;
            startY=mouseY;
        }

        // clear the canvas and 
        // redraw all shapes in their current positions
        function drawAll(){
            ctx.clearRect(0,0,cw,ch);
            for(var i=0;i<shapes.length;i++){
                var shape=shapes[i];
                if(shape.radius){
                    // it's a circle
                    ctx.beginPath();
                    ctx.arc(shape.x,shape.y,shape.radius,0,Math.PI*2);
                    ctx.fillStyle=shape.color;
                    ctx.fill();
                }else if(shape.width){
                    // it's a rectangle
                    ctx.fillStyle=shape.color;
                    ctx.fillRect(shape.x,shape.y,shape.width,shape.height);
                }
            }
        }
