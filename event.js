/**
 * Created with JetBrains WebStorm.
 * User: vaio
 * Date: 12-5-29
 * Time: 下午4:22
 * To change this template use File | Settings | File Templates.
 */

var tin;
var ctx;
var canvas;
var canvasDiv;

function SetTool(t)
{
    canvas.onmousedown = function (e){
	    var x = e.clientX - canvas.offsetLeft;
		var y = e.clientY - canvas.offsetLeft;
		t.onmousedown(x,y);
	};
    canvas.onmousemove = t.onmousemove;
    canvas.onmouseup = t.onmouseup;
}

function AddPointTool()
{
    this.onmousedown = function(x,y)
	{
		tin.AddNode(x,y);
		ctx.strokeStyle = "rgb(0,200,0)";
		ctx.fillStyle = "rgb(200,0,0)";
		
		drawPoint(x,y,2);
	};
}

function load()
{
    tin = new Tin();
    canvasDiv = document.getElementById("canvasDiv");
    canvas = document.createElement('canvas');
    //var h = document.height - canvasDiv.offsetTop - 40;
    var w = canvasDiv.clientWidth;
    var h = window.innerHeight - 60;

    canvas.setAttribute('width', w);
    canvas.setAttribute('height', h);
    canvas.setAttribute('id', 'canvas');

    canvasDiv.appendChild(canvas);

    ctx=canvas.getContext('2d');

    ctx.fillStyle = "rgb(220,220,220)";
    ctx.fillRect(0,0,w,h);

    SetTool(new AddPointTool());
}



function build()
{
    if(!tin.sorted)
        tin.SortNodes();

    var bt = new Date().getTime();
    tin.Build();
    var et = new Date().getTime();

    var lb_info = document.getElementById("lb_info");

    //var msg = "Build " + tin.nodes.length;
    lb_info.value = tin.nodes.length + " nodes used " + (et - bt) + " ms";

    drawTin();
}

function drawTin()
{
    ctx.strokeStyle = "rgb(0,0,255)";
    ctx.fillStyle = "rgb(200,200,200)";
    ctx.fillRect(0,0,canvas.clientWidth,canvas.clientHeight);
    ctx.lineWidth = 0.1;
    for(var i = 0;i< tin.edges.length;i++)
    {
        var e = tin.edges[i];
        ctx.beginPath();
        ctx.moveTo(e.org.x, e.org.y);
        ctx.lineTo(e.twin.org.x, e.twin.org.y);
        ctx.closePath();
        ctx.stroke();
    }

    ctx.strokeStyle = "rgb(0,200,0)";
    ctx.fillStyle = "rgb(200,0,0)";
    for(i = 0;i<tin.nodes.length;i++)
    {
        var x = tin.nodes[i].x;
        var y = tin.nodes[i].y;
        drawPoint(x,y,2);
    }
}
function drawPoint(x,y,size)
{
	ctx.fillRect(x - size/2,y - size/2,size,size);
}
function randomNode()
{
    var h = canvas.clientHeight;
    var w = canvas.clientWidth;

    var lb_info = document.getElementById("lb_count");

    //var msg = "Build " + tin.nodes.length;
    var c = lb_info.value;

    var count = parseInt(c);
    ctx.strokeStyle = "rgb(0,200,0)";
    ctx.fillStyle = "rgb(200,0,0)";
    for(var i = 0;i<count;i++)
    {
        var x = Math.random() * w;
        var y = Math.random() * h;

        tin.AddNode(x,y);

        drawPoint(x,y,2);
    }
}