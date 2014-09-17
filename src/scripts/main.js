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
        div = document.getElementById('canvas'),
        i = 0,
        draggers = [],
        containerWidth = div.offsetWidth,
        containerHeight = div.offsetHeight,
        add = document.getElementById('add_point'),
        setC = document.getElementById('set_colour'),
        coords = document.getElementById('coords'),
        openConfig = document.getElementById('open_config'),
        bgColor = document.getElementById('bg-color'),
        pointsOp = document.getElementById('points-op');

    [].forEach.call(document.querySelectorAll('.dragme'), function(el){
        el.addEventListener('dragstart',drag_start,false);
        draggers.push(new Dragger( el.id, (el.offsetLeft*100/containerWidth).toFixed(2) + '%', (el.offsetTop*100/containerHeight).toFixed(2) + '%', "#fff" , "50%"));
    });



    document.body.onkeyup = function(e){
        if(e.keyCode == 27){
           if(openConfig.checked == true){
                openConfig.checked = false;
            } else {
                openConfig.checked = true;
            }
        }
    }

    pointsOp.onclick = function(){
        [].forEach.call(document.querySelectorAll('.dragme'), function(el){
            el.classList.toggle('hide');
        });
        this.classList.toggle('hide');
    }


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
        
        //console.log(style.getPropertyValue("left"));
        // highlighting actual
        document.getElementById('r_' +  event.target.id).classList.add('current');
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

        createGradient(bgColor.value);
        updateRows();
        
        document.getElementById('r_' +  dm.id).classList.remove('current');

        event.preventDefault(); 
        return false;
    }  

    bgColor.onchange = function(){
        createGradient(this.value);
    }
    

    window.onresize = function(event) {
        containerWidth = div.offsetWidth;
        containerHeight = div.offsetHeight;
    };

    function createGradient(bg){
        var gradient = [];
        for (var i = 0; i < draggers.length; i++) {
           gradient.push('radial-gradient(circle at ' + draggers[i].posX + ' ' + draggers[i].posY + ', ' + draggers[i].colour +', transparent ' + draggers[i].deep + ')');
        }
        if(bg != undefined){
            gradient.push('radial-gradient(circle at 50% 50%, '+bg+', '+bg+' 100%)');
        } else {
            gradient.push('radial-gradient(circle at 50% 50%, #000, #000 100%)');    
        }
        
        document.body.style.background = gradient.toString();
                
        // Export stuff
            console.log(gradient.toString());
            var obj = draggers.reduce(function(o, v, i) {
              o[i] = v;
              return o;
            }, {});
            console.log(JSON.stringify(obj));
        // Export stuff

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
        if(draggers.length == 0){
            openConfig.checked = false;
            document.querySelector('.points').classList.add('empty');
        }
        createRows();
        createGradient(bgColor.value)
        //console.log(draggers);
    }

    function upItem(pos){
        if(pos>0){
            draggers.move(pos, pos-1);
            createRows();
            createGradient(bgColor.value)
        }
        //console.log(draggers);
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
            //cell4.innerHTML = draggers[i].colour;

            var inputColor = document.createElement("input");
            inputColor.setAttribute('id','col_' + draggers[i].name);
            inputColor.setAttribute('type','text');
            inputColor.setAttribute('class','color {hash:true,caps:false,pickerFaceColor:\'transparent\',pickerFace:3,pickerBorder:0,pickerInsetColor:\'black\'} input_colour');
            inputColor.setAttribute('value',draggers[i].colour);
            new jscolor.color(inputColor, {hash:true,caps:false,pickerFaceColor:'transparent',pickerFace:3,pickerBorder:0,pickerInsetColor:'black'});
            cell4.appendChild(inputColor);
            document.querySelector('[id*=col_]').onchange = function(){
                var id = this.id.replace('col_','')
                document.getElementById(id).dataset.colour = this.value;
                var index = arrayObjectIndexOf(draggers, id, "name"); // 1
                if (index > -1) {
                    draggers[index].colour = this.value;
                }
                createGradient(bgColor.value);
            }



            var delBtn = document.createElement("button");
            delBtn.setAttribute('class','del_item');
            delBtn.setAttribute('data-del', draggers[i].name);
            //var x = document.createTextNode("del");
            delBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="white" d="M50,0C22.388,0,0,22.388,0,50s22.388,50,50,50s50-22.388,50-50S77.612,0,50,0z M74.731,65.894  l-8.838,8.838L50,58.838L34.106,74.731l-8.838-8.838L41.162,50L25.269,34.106l8.838-8.838L50,41.162l15.894-15.894l8.838,8.838L58.838,50L74.731,65.894z"/></svg>';
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
            valueDeep.setAttribute('type','number');
            valueDeep.setAttribute('min','1');
            valueDeep.setAttribute('max','100');
            valueDeep.setAttribute('pattern','[0-9]');
            valueDeep.setAttribute('size','2');
            cell6.appendChild(valueDeep);

            printValue('slider_'+draggers[i].name, 'value_'+draggers[i].name);

            document.querySelector('[id*=value_]').onchange = function(){
                var id = this.id.replace('value_','')
                if(this.value > 100) this.value = 100;
                printValue(this.id, 'slider_' + id);
                document.getElementById(id).dataset.deep = this.value + "%";
                var index = arrayObjectIndexOf(draggers, id, "name"); // 1
                if (index > -1) {
                    draggers[index].deep = this.value + "%";
                }
                createGradient(bgColor.value);
            }
            document.querySelector('[id*=value_]').addEventListener("keypress", function (e) {
               if (e.which < 48 || e.which > 57) { e.preventDefault(); }
            });
            
            document.querySelector('[id*=slider_]').onchange = function(){
                var id = this.id.replace('slider_','')
                printValue(this.id, 'value_' + id);
                document.getElementById(id).dataset.deep = this.value + "%";
                var index = arrayObjectIndexOf(draggers, id, "name"); // 1
                if (index > -1) {
                    draggers[index].deep = this.value + "%";
                }
                createGradient(bgColor.value);
            }

            var upBtn = document.createElement("button");
            upBtn.setAttribute('class','up_item');
            upBtn.setAttribute('data-level', i);
            upBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="white" d="M87.031,16.719c-0.99-1.146-2.031-2.213-3.125-3.203c-1.146-0.99-2.631-2.135-4.453-3.438l-2.031-1.484C74.244,6.25,70.053,4.219,64.844,2.5C59.635,0.833,54.688,0,50,0s-9.635,0.833-14.844,2.5c-5.208,1.719-9.922,4.115-14.141,7.188S13.125,16.406,10,20.625C6.823,24.896,4.375,29.688,2.656,35C0.885,40.312,0,45.312,0,50s0.885,9.688,2.656,15c1.719,5.312,3.802,9.635,6.25,12.969l0.703,0.859c1.979,2.709,3.776,4.869,5.391,6.484c1.562,1.562,3.594,3.256,6.094,5.078c2.552,1.822,4.792,3.203,6.719,4.141c1.927,0.99,4.427,1.979,7.5,2.969l1.562,0.469C40.938,99.322,45.312,100,50,100s9.062-0.678,13.125-2.031l1.797-0.547c2.916-0.938,5.287-1.85,7.109-2.734c1.875-0.885,3.697-1.928,5.469-3.125c1.719-1.197,3.203-2.291,4.453-3.281c1.25-1.041,2.525-2.24,3.828-3.594c1.303-1.406,2.787-3.256,4.453-5.547l0.391-0.547c1.875-2.604,3.385-5.053,4.531-7.344c1.094-2.344,2.162-5.365,3.203-9.062l0.078-0.156C99.479,58.178,100,54.166,100,50c0-4.167-0.834-8.958-2.5-14.375c-1.615-5.365-3.516-9.557-5.703-12.578l-1.25-1.719C89.193,19.453,88.021,17.917,87.031,16.719M48.438,26.719h3.125L69.531,62.5H30.469L48.438,26.719"/></svg>';
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
            tr.querySelector(".input_colour").value = draggers[i].colour;
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


    function hasClass(element, cls) {
        return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }

    var addItem = function(){
        var newE = document.createElement("span");
        newE.setAttribute("draggable","true");
        
        if(draggers.length > 0){
            newN = maxNumber() + 1;    
        } else {
            newN = 1;
            document.querySelector('.points').classList.remove('empty');
        }

        newE.setAttribute("id","d"+newN);
        if(hasClass(pointsOp,'hide')){
            newE.setAttribute("class","dragme hide");
        } else {
            newE.setAttribute("class","dragme");
        }

        var newColour = (setC.value !== "" && testColor(setC.value) !== null) ? setC.value : "blue";
        setC.value = "";
        newE.setAttribute("data-colour",newColour);
        newE.setAttribute("data-deep","50%");
        
        div.appendChild(newE);

        newE.addEventListener('dragstart',drag_start,false);
        draggers.push(new Dragger( newE.id, (newE.offsetLeft*100/containerWidth).toFixed(2) + '%', (newE.offsetTop*100/containerHeight).toFixed(2) + '%', newColour , "50%"));
        
        createRows();
        createGradient(bgColor.value)
    };

    add.onclick = addItem;


    div.addEventListener('dragover',drag_over,false); 
    div.addEventListener('drop',drop,false); 
});



