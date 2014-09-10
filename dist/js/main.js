document.addEventListener("DOMContentLoaded", function() {
    
    var draggerData,
        div = document.getElementById('div'),
        i = 0,
        draggers = [],
        containerWidth = div.offsetWidth,
        containerHeight = div.offsetHeight,
        add = document.getElementById('add_point'),
        setC = document.getElementById('set_colour');

    [].forEach.call(document.querySelectorAll('.dragme'), function(el){
        el.addEventListener('dragstart',drag_start,false);
        draggers.push(new Dragger( el.id, el.offsetLeft+"px", el.offsetTop+"px", "green" ));
    })

    function Dragger(name, posX, posY, colour){
        this.name = name;
        this.posX = posX;
        this.posY = posY;
        this.colour = colour;
    }

    Dragger.prototype.getInfo = function(){
        return this.name + " (" + this.posX + "," + this.posY + ") - " + this.colour;
    }
    

    function drag_start(event) {
        var style = window.getComputedStyle(event.target, null);

        draggerData = [  event.target.id,
                        (parseInt(style.getPropertyValue("left"),10) - event.clientX),
                        (parseInt(style.getPropertyValue("top"),10) - event.clientY) ];
    
        event.dataTransfer.setData("text/plain",draggerData);
    }

    function drag_over(event) { 
        var dm = document.getElementById(draggerData[0]);
        dm.style.left = (event.clientX + parseInt(draggerData[1],10))*100/containerWidth + '%';
        dm.style.top = (event.clientY + parseInt(draggerData[2],10)) *100/containerHeight + '%';
        event.preventDefault();
        return false;
    }

    function drop(event) { 
        var dm = document.getElementById(draggerData[0]);

        dm.style.left = (event.clientX + parseInt(draggerData[1],10))*100/containerWidth + '%';
        dm.style.top = (event.clientY + parseInt(draggerData[2],10)) *100/containerHeight + '%';

        for (var i = 0; i < draggers.length; i++) {
            if(draggers[i].name == draggerData[0]){
                draggers[i].posX = dm.style.left;
                draggers[i].posY = dm.style.top;
                draggers[i].colour = dm.dataset.colour;
                console.log(draggers[i].getInfo());
            }
        }

        createGradient();
        // updateValues();
        
        event.preventDefault(); 
        return false;
    }  

    

    window.onresize = function(event) {
        containerWidth = div.offsetWidth,
        containerHeight = div.offsetHeight;
    };

    function createGradient(){
        var gradient = [];
        for (var i = 0; i < draggers.length; i++) {
           gradient.push('radial-gradient(circle at ' + draggers[i].posX + ' ' + draggers[i].posY + ', ' + draggers[i].colour +', transparent 100%)');
        }
        gradient.push('radial-gradient(circle at 50% 50%, #000, #000 100%)');
        
        div.style.background = gradient.toString();
    }

    function updateValues(){
        var coords = document.getElementById('coords');
        for (var i = 0; i < draggers.length; i++) {

            var row = coords.insertRow(0);
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);

            cell1.innerHTML = draggers[i].name;
            cell2.innerHTML = draggers[i].posX;
            cell3.innerHTML = draggers[i].posY;
           // var tr = document.getElementById("i_" + draggers[i].name);
           // tr.querySelectorAll("td")[0].innerHTML = draggers[i].name;
           // tr.querySelectorAll("td")[1].innerHTML = draggers[i].posX;
           // tr.querySelectorAll("td")[2].innerHTML = draggers[i].posY;
        }
    }

    add.onclick = function(){
        var newE = document.createElement("span");
        newE.setAttribute("draggable","true");
        
        var lastN = draggers[draggers.length - 1].name;
        lastN = lastN.replace('d','');
        newN = parseInt(lastN) + 1;

        newE.setAttribute("id","d"+newN);
        newE.setAttribute("class","dragme");
        var newColour = setC.value != "" ? setC.value : "blue";
        newE.setAttribute("data-colour",newColour);
        
        div.appendChild(newE);

        newE.addEventListener('dragstart',drag_start,false);
        draggers.push(new Dragger( newE.id, newE.offsetLeft+"px", newE.offsetTop+"px", "green" ));
        
    }




    div.addEventListener('dragover',drag_over,false); 
    div.addEventListener('drop',drop,false); 
});



