




;(function(window) {
    
    'use strict';


    // General functions

    function extend( a, b ) {
        for( var key in b ) { 
            if( b.hasOwnProperty( key ) ) {
                a[key] = b[key];
            }
        }
        return a;
    }

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

    function arrayObjectIndexOf(myArray, searchTerm, property) {
        for(var i = 0, len = myArray.length; i < len; i++) {
            if (myArray[i][property] === searchTerm) return i;
        }
        return -1;
    }

    function testColor(str) {
        var dummy = document.createElement('div');
        dummy.style.color = str;

        // Is the syntax valid?
        if (!dummy.style.color) { return null; }
            
        document.head.appendChild(dummy);
        var normalized = getComputedStyle(dummy).color;
        document.head.removeChild(dummy);
        
        if (!normalized) { return null; }
        var rgb = normalized.match(/\((\d+), (\d+), (\d+)/);
        
        return normalized; // for testing purposes
    }


    function maxNumber() {
        var numbers = [];
        for (var i = 0; i < draggers.length; i++) {
            numbers.push(parseInt(draggers[i].name.replace('d','')));
        }
        return Math.max.apply( Math, numbers );
    }


    function hasClass(element, cls) {
        return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }


    function printValue(sliderID, textbox) {
        var x = document.getElementById(textbox);
        var y = document.getElementById(sliderID);
        x.value = y.value;
    }

    function toPercent(side, value){
        switch(side){
            case "w":
                return (value*100/containerWidth).toFixed(2) + '%';
                break;
            case "h":
                return (value*100/containerHeight).toFixed(2) + '%';
                break;
            default: return;
        }
    }




    // Variable declaration

    var draggerData,
        newGradient,
        div = document.getElementById('canvas'),
        i = 0,
        draggers = [],
        containerWidth = div.offsetWidth,
        containerHeight = div.offsetHeight,
        addPoint = document.getElementById('add_point'),
        setC = document.getElementById('set_colour'),
        coords = document.getElementById('coords'),
        openConfig = document.getElementById('open_config'),
        bgColor = document.getElementById('bg-color'),
        pointsOp = document.getElementById('points-op'),
        exportCode = document.getElementById('export_code'),
        generatedCode = document.getElementById('generated_code'),
        popupCode = document.getElementById('popup-code'),
        popupQ = document.getElementById('popup-q'),
        qOpener = document.getElementById('q-opener');





    // RadiaGradients

    function RadialGradients(q, options){
        this.q = q;
        this.options = extend( {}, this.options );
        extend( this.options, options );
        this._init();
    }

    RadialGradients.prototype._init = function(){
        
        [].forEach.call(document.querySelectorAll('.dragme'), function(el){
            el.parentElement.removeChild(el);
        });

        for( var i = 1, len = (this.q < 15) ? this.q : 15; i <= len; i++ ){
            var newE = document.createElement("span");
            newE.setAttribute("draggable","true");
            var newN = i;
            document.querySelector('.points').classList.remove('empty');
            var newID = "d" + newN;
            newE.setAttribute("id",newID);
            newE.setAttribute("class","dragme");
            
            if(this.options[newID] instanceof Object) {
                newE.setAttribute("data-colour",this.options[newID].color || 'rgba(255,255,255,0.5)');
                newE.setAttribute("data-deep",this.options[newID].deep || '100%');
                newE.style.left = this.options[newID].left;
                newE.style.top = this.options[newID].top;
            } else {
                newE.setAttribute("data-colour", 'rgba(255,255,255,0.5)');
                newE.setAttribute("data-deep", '100%');
            }

            div.appendChild(newE);
        }

        if(this.options.bg) {
            bgColor.value = this.options.bg;
            bgColor.style.backgroundColor = this.options.bg; 
        }

        init();

    };




    // Dragger

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




    // Core functions

    function init(){

        draggers = [];

        [].forEach.call(document.querySelectorAll('.dragme'), function(el){
            el.addEventListener('dragstart',drag_start,false);
            draggers.push(new Dragger( el.id, toPercent("w", el.offsetLeft) , toPercent("h", el.offsetTop) , el.dataset.colour , el.dataset.deep));
        });

        createRows();
        createGradient(bgColor.value);
    }


    function drag_start(event) {
        var style = window.getComputedStyle(event.target, null);

        draggerData = [  event.target.id,
        (parseInt(style.getPropertyValue("left"),10) - event.clientX),
        (parseInt(style.getPropertyValue("top"),10) - event.clientY) ];

        event.dataTransfer.setData("text/plain",draggerData);
        
        // highlighting actual
        document.getElementById('r_' +  event.target.id).classList.add('current');
    }


    function drag_over(event) { 
        var dm = document.getElementById(draggerData[0]);
        dm.style.left = toPercent("w", event.clientX);
        dm.style.top = toPercent("h", event.clientY);
        event.preventDefault();
        return false;
    }


    function drop(event) { 
        var dm = document.getElementById(draggerData[0]);
        dm.style.left = toPercent("w", event.clientX);
        dm.style.top = toPercent("h", event.clientY);

        for (var i = 0; i < draggers.length; i++) {
            if(draggers[i].name == draggerData[0]){
                draggers[i].posX = dm.style.left;
                draggers[i].posY = dm.style.top;
                draggers[i].colour = dm.dataset.colour;
                draggers[i].deep = dm.dataset.deep;
            }
        }

        document.getElementById('r_' +  dm.id).classList.remove('current');
        createGradient(bgColor.value);
        updateRows();

        event.preventDefault(); 
        return false;
    }


    function createGradient(bg){
        var gradient = [];
        for (var i = 0; i < draggers.length; i++) {
            gradient.push('radial-gradient(circle at ' + draggers[i].posX + ' ' + draggers[i].posY + ', ' + draggers[i].colour +', transparent ' + draggers[i].deep + ')');
        }
        if(bg !== undefined){
            gradient.push('radial-gradient(circle at 50% 50%, '+bg+', '+bg+' 100%)');
        } else {
            gradient.push('radial-gradient(circle at 50% 50%, #000, #000 100%)');    
        }

        newGradient = gradient.toString();
        document.body.style.background = newGradient;
        generatedCode.innerHTML = newGradient;
        generatedCode.classList.remove('copied');
        codepening();

        var obj = draggers.reduce(function(o, v, i) {
            o[i] = v;
            return o;
        }, {});
        obj.bg = bgColor.value;
        // console.log(obj)
        localStorage.setItem('value', JSON.stringify(obj));
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

            var inputColor = document.createElement("input");
            inputColor.setAttribute('id','col_' + draggers[i].name);
            inputColor.setAttribute('type','text');
            inputColor.setAttribute('class','color {adjust:false,hash:true,caps:false,pickerFaceColor:\'transparent\',pickerFace:3,pickerBorder:0,pickerInsetColor:\'black\'} input_colour');
            inputColor.setAttribute('value',draggers[i].colour);
            new jscolor.color(inputColor, {adjust:false, hash:true,caps:false,pickerFaceColor:'transparent',pickerFace:3,pickerBorder:0,pickerInsetColor:'black'});
            cell4.appendChild(inputColor);
            event_colour();

            var delBtn = document.createElement("button");
            delBtn.setAttribute('class','del_item');
            delBtn.setAttribute('data-del', draggers[i].name);
            delBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="rgba(255,255,255,0.3)" d="M50,0C22.388,0,0,22.388,0,50s22.388,50,50,50s50-22.388,50-50S77.612,0,50,0z M74.731,65.894  l-8.838,8.838L50,58.838L34.106,74.731l-8.838-8.838L41.162,50L25.269,34.106l8.838-8.838L50,41.162l15.894-15.894l8.838,8.838L58.838,50L74.731,65.894z"/></svg>';
            cell7.appendChild(delBtn);
            event_delItem();

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
            event_deep();
            
            var upBtn = document.createElement("button");
            upBtn.setAttribute('class','up_item');
            upBtn.setAttribute('data-level', i);
            upBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="rgba(255,255,255,0.3)" d="M87.031,16.719c-0.99-1.146-2.031-2.213-3.125-3.203c-1.146-0.99-2.631-2.135-4.453-3.438l-2.031-1.484C74.244,6.25,70.053,4.219,64.844,2.5C59.635,0.833,54.688,0,50,0s-9.635,0.833-14.844,2.5c-5.208,1.719-9.922,4.115-14.141,7.188S13.125,16.406,10,20.625C6.823,24.896,4.375,29.688,2.656,35C0.885,40.312,0,45.312,0,50s0.885,9.688,2.656,15c1.719,5.312,3.802,9.635,6.25,12.969l0.703,0.859c1.979,2.709,3.776,4.869,5.391,6.484c1.562,1.562,3.594,3.256,6.094,5.078c2.552,1.822,4.792,3.203,6.719,4.141c1.927,0.99,4.427,1.979,7.5,2.969l1.562,0.469C40.938,99.322,45.312,100,50,100s9.062-0.678,13.125-2.031l1.797-0.547c2.916-0.938,5.287-1.85,7.109-2.734c1.875-0.885,3.697-1.928,5.469-3.125c1.719-1.197,3.203-2.291,4.453-3.281c1.25-1.041,2.525-2.24,3.828-3.594c1.303-1.406,2.787-3.256,4.453-5.547l0.391-0.547c1.875-2.604,3.385-5.053,4.531-7.344c1.094-2.344,2.162-5.365,3.203-9.062l0.078-0.156C99.479,58.178,100,54.166,100,50c0-4.167-0.834-8.958-2.5-14.375c-1.615-5.365-3.516-9.557-5.703-12.578l-1.25-1.719C89.193,19.453,88.021,17.917,87.031,16.719M48.438,26.719h3.125L69.531,62.5H30.469L48.438,26.719"/></svg>';
            cell8.appendChild(upBtn);
            event_upItem();
        }
    }

    function event_upItem(){
         document.querySelector('.up_item').onclick = function(){
            upItem(this.dataset.level);
        };
    }

    function event_deep(){
        document.querySelector('[id*=value_]').onchange = function(){
            var id = this.id.replace('value_','');
            if(this.value > 100) this.value = 100;
            printValue(this.id, 'slider_' + id);
            document.getElementById(id).dataset.deep = this.value + "%";
            var index = arrayObjectIndexOf(draggers, id, "name"); // 1
            if (index > -1) {
                draggers[index].deep = this.value + "%";
            }
            createGradient(bgColor.value);
        };
        
        document.querySelector('[id*=value_]').addEventListener("keypress", function (e) {
            if (e.which < 48 || e.which > 57) { e.preventDefault(); }
        });

        document.querySelector('[id*=slider_]').onchange = function(){
            var id = this.id.replace('slider_','');
            printValue(this.id, 'value_' + id);
            document.getElementById(id).dataset.deep = this.value + "%";
            var index = arrayObjectIndexOf(draggers, id, "name"); // 1
            if (index > -1) {
                draggers[index].deep = this.value + "%";
            }
            createGradient(bgColor.value);
        };
    }

    function event_colour(){
        document.querySelector('[id*=col_]').onchange = function(){
            var id = this.id.replace('col_','');
            document.getElementById(id).dataset.colour = this.value;
            var index = arrayObjectIndexOf(draggers, id, "name"); // 1
            if (index > -1) {
                draggers[index].colour = this.value;
            }
            createGradient(bgColor.value);
        };
    }

    function event_delItem(){
        document.querySelector('.del_item').onclick = function(){
            delItem(this.dataset.del); 
        };
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


    function delItem(item){
        var point = document.getElementById(item);
        var details = document.getElementById('r_'+item);
        point.parentNode.removeChild(point);
        details.parentNode.removeChild(details);
        var index = arrayObjectIndexOf(draggers, item, "name"); // 1
        if (index > -1) {
            draggers.splice(index, 1);
        }
        if(draggers.length === 0){
            openConfig.checked = false;
            document.querySelector('.points').classList.add('empty');
        }
        createRows();
        createGradient(bgColor.value);
    }


    function upItem(pos){
        if(pos>0){
            draggers.move(pos, pos-1);
            createRows();
            createGradient(bgColor.value);
        }
    }


    function addItem(){
        var newE = document.createElement("span"), newN;
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

        var newColour = (setC.value !== "" && testColor(setC.value) !== null) ? setC.value : "rgba(255,255,255,0.5)";
        setC.value = "";
        newE.setAttribute("data-colour",newColour);
        newE.setAttribute("data-deep","100%");
        
        div.appendChild(newE);

        newE.addEventListener('dragstart',drag_start,false);
        draggers.push(new Dragger( newE.id, (newE.offsetLeft*100/containerWidth).toFixed(2) + '%', (newE.offsetTop*100/containerHeight).toFixed(2) + '%', newColour , "100%"));
        
        createRows();
        createGradient(bgColor.value);
    }

    

    document.addEventListener("DOMContentLoaded", function() {
   
        // init();

        document.body.onkeyup = function(e){
            if(e.keyCode == 27){
               if(openConfig.checked === true){
                    openConfig.checked = false;
                } else {
                    openConfig.checked = true;
                }
                if(hasClass(popupCode,'open')){
                    popupCode.classList.remove('open')
                }
                if(hasClass(popupQ,'open')){
                    popupQ.classList.remove('open')
                }
            }
        };

        pointsOp.onclick = function(){
            [].forEach.call(document.querySelectorAll('.dragme'), function(el){
                el.classList.toggle('hide');
            });
            this.classList.toggle('hide');
        };

        bgColor.onchange = function(){
            createGradient(this.value);
        };
        
        window.onresize = function(event) {
            containerWidth = div.offsetWidth;
            containerHeight = div.offsetHeight;
        };

        addPoint.onclick = addItem;

        exportCode.onclick = function(){
            if(hasClass(popupQ,'open')){
                popupQ.classList.remove('open')
            }
            popupCode.classList.toggle('open')
        }

        qOpener.onclick = function(){
            if(hasClass(popupCode,'open')){
                popupCode.classList.remove('open')
            }
            popupQ.classList.toggle('open')
        }

        div.addEventListener('dragover',drag_over,false); 
        div.addEventListener('drop',drop,false); 

    });


    
    // ZeroClipboard
    var client = new ZeroClipboard(generatedCode);

    client.on( "ready", function( readyEvent ) {

      client.on( "aftercopy", function( event ) {
        generatedCode.classList.add('copied');
      } );
    } );


    function codepening(){
        var codepen = new Object();
        codepen.html = '';
        codepen.css = 'body, html { height:100%; overflow:hidden; } \nbody { \n\tbackground-image:' +   newGradient + ';\n}';
        codepen.js = '// draGGradients by @elrumordelaluz http://elrumordelaluz.github.io/draGGradients/';
        codepen.css_prefix_free = "true";
        codepen.title = "draGGradients: generated radial-gradient";
        codepen.description = "Pen from draGGradients by @elrumordelaluz http://elrumordelaluz.github.io/draGGradients/";

        var codepenArr = new Array();
        codepenArr[0] = "html";
        codepenArr[1] = "css";
        codepenArr[3] = "js";
        codepenArr[4] = "css_prefix_free";
        codepenArr[5] = "title";
        codepenArr[6] = "description";
        var jsonText = JSON.stringify(codepen, codepenArr, "\t");
        document.getElementById('cdpn-data').value = jsonText;
    }


    // to global 
    window.RadialGradients = RadialGradients;
    window.init = init;


})(window);


