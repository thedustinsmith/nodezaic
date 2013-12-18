function num(v) {
	return parseInt(v, 10);
}
function arraverage (arr) {
	var sum = 0;
	for(var i = 0; i < arr.length; i++) {
		sum += arr[i]; 
	}
	return sum/arr.length;
}
function getRandomNum(min, max) {
	return num(Math.random() * (max - min) + min);
}
function getAveRGB (data) {
	var r = [],
	  	g = [],
	  	b = [];

	for(var i = 0; i< data.length; i += 4) {
		r.push(data[i]);
		g.push(data[i+1]);
		b.push(data[i + 2]);
	}

	return [num(arraverage(r)), num(arraverage(g)), num(arraverage(b))];
}
function Uint8Copy(original) {
	var buff = new ArrayBuffer(original.length);
  	var ret = new Uint8Array(buff);
  	ret.set(original, 0, original.length);
  	return ret;
}
