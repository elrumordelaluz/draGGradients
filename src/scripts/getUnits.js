(function(){
 
    // pass to string.replace for camel to hyphen
    var hyphenate = function(a, b, c){
        return b + "-" + c.toLowerCase();
    }
 
    // get computed style property
    var getStyle = function(target, prop){
        if(window.getComputedStyle){ // gecko and webkit
            prop = prop.replace(/([a-z])([A-Z])/, hyphenate);  // requires hyphenated, not camel
            return window.getComputedStyle(target, null).getPropertyValue(prop);
        }
        if(target.currentStyle){
            return target.currentStyle[prop];
        }
        return target.style[prop];
    }
 
    // get object with units
    var getUnits = function(target, prop){
 
        var baseline = 100;  // any number serves 
        var item;  // generic iterator
 
        var map = {  // list of all units and their identifying string
            pixel : "px",
            percent : "%",
            inch: "in",
            cm : "cm",
            mm : "mm",
            point : "pt",
            pica : "pc",
            em : "em",
            ex : "ex"
        };
 
        var factors = {};  // holds ratios
        var units = {};  // holds calculated values
 
        var value = getStyle(target, prop);  // get the computed style value
 
        var numeric = value.match(/\d+/);  // get the numeric component
        if(numeric === null) {  // if match returns null, throw error...  use === so 0 values are accepted
            throw "Invalid property value returned";
        }
        numeric = numeric[0];  // get the string
 
        var unit = value.match(/\D+$/);  // get the existing unit
        unit = (unit == null) ? map.pixel : unit[0]; // if its not set, assume px - otherwise grab string
 
        var activeMap;  // a reference to the map key for the existing unit
        for(item in map){
            if(map[item] == unit){
                activeMap = item;
                break;
            }
        }
        if(!activeMap) { // if existing unit isn't in the map, throw an error
            throw "Unit not found in map";
        }
 
        var temp = document.createElement("div");  // create temporary element
        temp.style.overflow = "hidden";  // in case baseline is set too low
        temp.style.visibility = "hidden";  // no need to show it
 
        target.parentElement.appendChild(temp); // insert it into the parent for em and ex  
 
        for(item in map){  // set the style for each unit, then calculate it's relative value against the baseline
            temp.style.width = baseline + map[item];
            factors[item] = baseline / temp.offsetWidth;
        }
 
        for(item in map){  // use the ratios figured in the above loop to determine converted values
            units[item] = numeric * (factors[item] * factors[activeMap]);
        }
 
        target.parentElement.removeChild(temp);  // clean up
 
        return units;  // returns the object with converted unit values...
 
    }
 
    // expose           
    window.getUnits = this.getUnits = getUnits;
 
})();