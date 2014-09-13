document.addEventListener("DOMContentLoaded", function() {
    
    Array.prototype.move = function (old_index, new_index) {
        while (old_index < 0) {
            old_index += this.length;
        }
        while (new_index < 0) {
            new_index += this.length;
        }
        if (new_index >= this.length) {
            var k = new_index - this.length;
            while ((k--) + 1) {
                this.push(undefined);
            }
        }
        this.splice(new_index, 0, this.splice(old_index, 1)[0]);
        return this; // for testing purposes
    };


    var testColor = function(str) {
        var dummy = document.createElement('div');
        dummy.style.color = str;
        
        // Is the syntax valid?
        if (!dummy.style.color) {
            return null;
        }
        
        document.head.appendChild(dummy);
        
        var normalized = getComputedStyle(dummy).color;
        
        document.head.removeChild(dummy);
        
        if (!normalized) {
            return null;
        }
        
        var rgb = normalized.match(/\((\d+), (\d+), (\d+)/);

        return normalized; // for testing purposes
    };

    var draggerData,
        div = document.getElementById('div'),
        i = 0,
        draggers = [],
        containerWidth = div.offsetWidth,
        containerHeight = div.offsetHeight,
        add = document.getElementById('add_point'),
        setC = document.getElementById('set_colour'),
        coords = document.getElementById('coords');

    [].forEach.call(document.querySelectorAll('.dragme'), function(el){
        el.addEventListener('dragstart',drag_start,false);
        draggers.push(new Dragger( el.id, (el.offsetLeft*100/containerWidth).toFixed(2) + '%', (el.offsetTop*100/containerHeight).toFixed(2) + '%', "rgba(255,255,255,.5)" , "50%"));
    });

    function Dragger(name, posX, posY, colour, deep){
        this.name = name;
        this.posX = posX;
        this.posY = posY;
        this.colour = colour;
        this.deep = deep;
    }

    Dragger.prototype.getInfo = function(){
        return this.name + " (" + this.posX + "," + this.posY + ") - " + this.colour + " - " + this.deep;
    };
    

    function drag_start(event) {
        var style = window.getComputedStyle(event.target, null);

        draggerData = [  event.target.id,
                        (parseInt(style.getPropertyValue("left"),10) - event.clientX),
                        (parseInt(style.getPropertyValue("top"),10) - event.clientY) ];
    
        event.dataTransfer.setData("text/plain",draggerData);
    }

    function drag_over(event) { 
        var dm = document.getElementById(draggerData[0]);
        dm.style.left = ((event.clientX + parseInt(draggerData[1],10))*100/containerWidth).toFixed(2) + '%';
        dm.style.top = ((event.clientY + parseInt(draggerData[2],10)) *100/containerHeight).toFixed(2) + '%';
        event.preventDefault();
        return false;
    }

    function drop(event) { 
        var dm = document.getElementById(draggerData[0]);

        dm.style.left = ((event.clientX + parseInt(draggerData[1],10))*100/containerWidth).toFixed(2) + '%';
        dm.style.top = ((event.clientY + parseInt(draggerData[2],10)) *100/containerHeight).toFixed(2) + '%';

        for (var i = 0; i < draggers.length; i++) {
            if(draggers[i].name == draggerData[0]){
                draggers[i].posX = dm.style.left;
                draggers[i].posY = dm.style.top;
                draggers[i].colour = dm.dataset.colour;
                draggers[i].deep = dm.dataset.deep;
                // console.log(draggers[i].getInfo());
            }
        }

        createGradient();
        updateRows();
        
        event.preventDefault(); 
        return false;
    }  

    

    window.onresize = function(event) {
        containerWidth = div.offsetWidth;
        containerHeight = div.offsetHeight;
    };

    function createGradient(){
        var gradient = [];
        for (var i = 0; i < draggers.length; i++) {
           gradient.push('radial-gradient(circle at ' + draggers[i].posX + ' ' + draggers[i].posY + ', ' + draggers[i].colour +', transparent ' + draggers[i].deep + ')');
        }
        gradient.push('radial-gradient(circle at 50% 50%, #000, #000 100%)');
        
        div.style.background = gradient.toString();
    }

    function arrayObjectIndexOf(myArray, searchTerm, property) {
        for(var i = 0, len = myArray.length; i < len; i++) {
            if (myArray[i][property] === searchTerm) return i;
        }
        return -1;
    }
    function delItem(item){
        var point = document.getElementById(item);
        var details = document.getElementById('r_'+item);
        point.parentNode.removeChild(point);
        details.parentNode.removeChild(details);
        var index = arrayObjectIndexOf(draggers, item, "name"); // 1
        if (index > -1) {
            draggers.splice(index, 1);
        }
        createGradient();
        console.log(draggers);
    }

    function upItem(pos){
        if(pos>0){
            draggers.move(pos, pos-1);
            createRows();
            createGradient();
        }
        console.log(draggers);
    }
    function createRows(){
        
        coords.innerHTML = "";
        
        for (var i = draggers.length -1; i >= 0; i--) {

            var row = coords.insertRow(0);
            row.setAttribute("id","r_" + draggers[i].name);
            var cell1 = row.insertCell(0);
            cell1.setAttribute("class","c_name");
            var cell2 = row.insertCell(1);
            cell2.setAttribute("class","c_posX");
            var cell3 = row.insertCell(2);
            cell3.setAttribute("class","c_posY");
            var cell4 = row.insertCell(3);
            cell4.setAttribute("class","c_colour");

            var cell5 = row.insertCell(4);
            cell5.setAttribute("class","c_deep-slider");
            var cell6 = row.insertCell(5);
            cell6.setAttribute("class","c_deep-value");
            var cell7 = row.insertCell(6);
            cell7.setAttribute("class","c_del");            
            var cell8 = row.insertCell(7);
            cell8.setAttribute("class","c_up");

            cell1.innerHTML = draggers[i].name;
            cell2.innerHTML = draggers[i].posX;
            cell3.innerHTML = draggers[i].posY;
            cell4.innerHTML = draggers[i].colour;

            var delBtn = document.createElement("button");
            delBtn.setAttribute('class','del_item');
            delBtn.setAttribute('data-del', draggers[i].name);
            var x = document.createTextNode("del");
            delBtn.appendChild(x);
            cell7.appendChild(delBtn);
            document.querySelector('.del_item').onclick = function(){
                delItem(this.dataset.del); 
            }

            var sliderDeep = document.createElement("input");
            sliderDeep.setAttribute('id','slider_' + draggers[i].name);
            sliderDeep.setAttribute('type','range');
            sliderDeep.setAttribute('min','1');
            sliderDeep.setAttribute('max','100');
            sliderDeep.setAttribute('value',parseInt(draggers[i].deep));
            
            cell5.appendChild(sliderDeep);

            var valueDeep = document.createElement("input");
            valueDeep.setAttribute('id','value_' + draggers[i].name);
            valueDeep.setAttribute('type','text');
            valueDeep.setAttribute('size','2');
            cell6.appendChild(valueDeep);

            printValue('slider_'+draggers[i].name, 'value_'+draggers[i].name);
            
            document.querySelector('[id*=slider_]').onchange = function(){
                var id = this.id.replace('slider_','')
                printValue(this.id, 'value_' + id);
                document.getElementById(id).dataset.deep = this.value + "%";
                var index = arrayObjectIndexOf(draggers, id, "name"); // 1
                if (index > -1) {
                    draggers[index].deep = this.value + "%";
                }
                createGradient();
            }

            var upBtn = document.createElement("button");
            upBtn.setAttribute('class','up_item');
            upBtn.setAttribute('data-level', i);
            var u = document.createTextNode("up");
            upBtn.appendChild(u);
            cell8.appendChild(upBtn);
            document.querySelector('.up_item').onclick = function(){
                upItem(this.dataset.level);
            }
        }
    }

    
    function printValue(sliderID, textbox) {
        var x = document.getElementById(textbox);
        var y = document.getElementById(sliderID);
        x.value = y.value;
    }

    

    function updateRows(){
        for (var i = 0; i < draggers.length; i++) {
            var tr = document.getElementById("r_" + draggers[i].name);
            tr.querySelector(".c_name").innerHTML = draggers[i].name;
            tr.querySelector(".c_posX").innerHTML = draggers[i].posX;
            tr.querySelector(".c_posY").innerHTML = draggers[i].posY;
            tr.querySelector(".c_colour").innerHTML = draggers[i].colour;
        }
    }

    createRows();

    function maxNumber() {
        var numbers = [];
        for (var i = 0; i < draggers.length; i++) {
            numbers.push(parseInt(draggers[i].name.replace('d','')));
        };
        return Math.max.apply( Math, numbers );
    }


    add.onclick = function(){
        var newE = document.createElement("span");
        newE.setAttribute("draggable","true");
        
        if(draggers.length > 0){
            newN = maxNumber() + 1;    
        } else {
            newN = 1;
        }

        newE.setAttribute("id","d"+newN);
        newE.setAttribute("class","dragme");
        var newColour = (setC.value !== "" && testColor(setC.value) !== null) ? setC.value : "blue";

        newE.setAttribute("data-colour",newColour);
        newE.setAttribute("data-deep","50%");
        
        div.appendChild(newE);

        newE.addEventListener('dragstart',drag_start,false);
        draggers.push(new Dragger( newE.id, newE.offsetLeft*100/containerWidth + '%', newE.offsetTop*100/containerHeight + '%', newColour , "50%"));
        
        createRows();
        createGradient();

        
    };




    div.addEventListener('dragover',drag_over,false); 
    div.addEventListener('drop',drop,false); 
});



