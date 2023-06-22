var base = [18, 107, 85, 1];
var added = [0, 0,0,.53];
var target = [9, 50, 40, 1]


var mix = [];
mix[3] = 1 - (1 - added[3]) * (1 - base[3]); // alpha
mix[0] = Math.round((added[0] * added[3] / mix[3]) + (base[0] * base[3] * (1 - added[3]) / mix[3])); // red
mix[1] = Math.round((added[1] * added[3] / mix[3]) + (base[1] * base[3] * (1 - added[3]) / mix[3])); // green
mix[2] = Math.round((added[2] * added[3] / mix[3]) + (base[2] * base[3] * (1 - added[3]) / mix[3])); // blue

console.log(mix)
console.log(target)