class SVG2Mesh {

}

function parseSVG(path) {
  function parseValues(args) {
    var numbers = args.match(/-?[0-9]*\.?[0-9]+(?:e[-+]?\d+)?/ig);
    return numbers ? numbers.map(Number) : [];
  }
  var length = { a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0 };
  var data = [];
  path.replace(/([astvzqmhlc])([^astvzqmhlc]*)/ig, function(_, command, args) {
    var type = command.toLowerCase();
    args = parseValues(args);

    // overloaded moveTo
    if (type == 'm' && args.length > 2) {
      data.push([command].concat(args.splice(0, 2)));
      type = 'l';
      command = command == 'm' ? 'l' : 'L';
    }

    while (true) {
      if (args.length == length[type]) {
        args.unshift(command);
        return data.push(args);
      }
      if (args.length < length[type]) throw new Error('malformed path data');
      data.push([command].concat(args.splice(0, length[type])));
    }
  });
  return data;
}

