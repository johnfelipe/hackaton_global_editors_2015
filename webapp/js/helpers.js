

/** extend Number class */
Number.prototype.format = function(c, d, t){
    var n = this;
    c = isNaN(c = Math.abs(c)) ? 2 : c;
    d = d === undefined ? "." : d;
    t = t === undefined ? "," : t;
    var s = n < 0 ? "-" : "",
    i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
    j = (j = i.length) > 3 ? j % 3 : 0;
    var nn = s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    return nn;
};

Array.prototype.sortByKeyDesc = function(key){
    this.sort(function(a,b){
        return  (a[key] < b[key]) ? 1 : (a[key] > b[key]) ? -1 : 0;
    });
   return this;
};

Array.prototype.sortByKeyAsce = function(key){
    this.sort(function(a,b){
        return  (a[key] < b[key]) ? 1 : (a[key] > b[key]) ? -1 : 0;
    });
   return this;
};

Array.prototype.clone = function(){
    return JSON.parse(JSON.stringify(this));
}