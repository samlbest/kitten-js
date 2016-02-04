(function() {
  var root = this;

  var kt = function(obj) {
    if (obj instanceof kt) {
      return obj;
    }
    if (!(this instanceof kt)) {
      return new kt(obj);
      this.ktWrapped = obj;
    }
  };

  // Install kt in window or module exports (Node.js)
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = kt;
    }
    exports.kt = kt;
  } else {
    root.kt = kt;
  }
  
  kt.version = '0.01';

  var createSpawnButton = function() {
    var button = document.createElement('div');
    kt.container.appendChild(button);
    button.style.right = '6px';
    button.style.top = '6px';
    button.style.width = '5px';
    button.style.height = '5px';
    button.style.background = '#fc1ed3';
    button.style.position = 'absolute';
    button.style.zIndex = '10000';
    button.style.cursor = 'pointer';
    button.style.borderRadius = '2.5px';
    button.style.pointerEvents = 'all';
    button.onclick = kt.spawn;

    return button;
  };

  var createCanvas = function() {
    if (typeof kt.container === 'undefined' || !kt.container) {
      var canvasContainer = document.createElement('div');
      var body = document.querySelector('body');
      document.body.appendChild(canvasContainer);
      canvasContainer.style.position = 'absolute';
      canvasContainer.style.left = '0px';
      canvasContainer.style.top = '0px';
      canvasContainer.style.width = body.scrollWidth + 'px';
      canvasContainer.style.height = body.scrollHeight + 'px';
      canvasContainer.style.zIndex = '10000';
      canvasContainer.style.pointerEvents = 'none';

      kt.parentContainer = body;
      kt.container = canvasContainer;


      window.onresize = function() {
        var newHeight = kt.parentContainer.scrollHeight;
        var newWidth = kt.parentContainer.scrollWidth;

        kt.canvas.style.width = newWidth + 'px';
        kt.canvas.style.height = newHeight + 'px';
        kt.canvas.width = newWidth;
        kt.canvas.height = newHeight;
      };
    }

    var canvas = document.createElement('canvas');
    canvas.style.width = canvasContainer.scrollWidth + 'px';
    canvas.style.height = canvasContainer.scrollHeight + 'px';
    canvas.width = canvasContainer.scrollWidth;
    canvas.height = canvasContainer.scrollHeight;
    canvas.style.overflow = 'visible';
    canvas.style.position = 'absolute';

    kt.container.appendChild(canvas);

    return canvas;

  }

  var canvasContext = function() {
    if (typeof kt.canvas !== 'undefined' && kt.canvas) {
      return kt.canvas.getContext('2d');
    }

    return null;
  }
  kt.init = function(obj) {
    kt.container = null;
    if (typeof obj !== 'undefined' && obj) {
      if (typeof obj.selector !== 'undefined' && obj.selector) {
        kt.container = document.querySelector(obj.selector);
      }
    }

    kt.canvas = createCanvas();
    kt.spawnButton = createSpawnButton();

    kt.spriteMap = new gfx.SpriteMap(kt.canvas, null);
    kt.startLoop();

    return kt;
  };

  kt.spawn = function(options) {
    if (typeof obj !== 'undefined' && obj) {
      kt.type = obj.type !== 'undefined' && obj.type ? obj.type : 'kitten'; 
    }

    var sprite = new kt.Kitten(canvasContext());
    sprite._vector = new gfx.Vector(5.0, 5.0);
    kt.spriteMap.addSprite(sprite);

    return kt;
  };

  kt.startLoop = function() {
    if (typeof kt.loop === 'undefined' || !kt.loop) {
      kt.loop = setInterval(function() {
        kt.spriteMap.redrawSprites();
      }, 25);
    }
    return kt;
  };

  kt.endLoop = function() {
    if (typeof kt.loop !== 'undefined' && kt.loop) {
      clearInterval(kt.loop);
      kt.loop = null;
      kt.loopIteration = 0;
    }
    return kt;
  }

  
  kt.Kitten = function(context, options) {
    // Modify default traits
    var defaults = {
      position : new gfx.Point(0.0, 0.0),
      lastPosition : new gfx.Point(0.0, 0.0),
      size : new gfx.Size(50.0, 50.0),
      vector : new gfx.Vector(0.0, 0.0),
      maxMagnitude : 10,
      maxDirectionalSpeed : 10
    };

    var options = Helpers.extend({}, defaults, options);

    var kitten = new gfx.Sprite(context, options);
    kitten.render = function() {
      var img = new Image();
      img.src = 'sprites/cat.png';
      this._context.drawImage(img, 
                              this._position.x,
                              this._position.y,
                              this._size.width,
                              this._size.height); 
    }
    
    return kitten;
  }

  kt.Square = function(context, options) {

    // Modify default traits
    var defaults = {
      position : new gfx.Point(0.0, 0.0),
      lastPosition : new gfx.Point(0.0, 0.0),
      size : new gfx.Size(25.0, 25.0),
      vector : new gfx.Vector(0.0, 0.0),
      maxMagnitude : 10,
      maxDirectionalSpeed : 10
    };

    var options = Helpers.extend({}, defaults, options);

    var square = new gfx.Sprite(context, options);

    // Define appearance
    square.render = function() {
      var radius = this._size.width / 2;
      this._context.beginPath();
      this._context.fillStyle = 'blue';
      this._context.fillRect(this._position.x, this._position.y, this._size.width, this._size.height);
      this._context.closePath();
    }

    return square;
  };
}.call(this));


var Helpers = {
  randomIntFromInterval: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  },
  randomFloatFromInterval: function(min, max) {
    return Math.random() * (max - min + 1) + min;
  },
  // Mer
  extend: function() {
    for (var i = 1; i < arguments.length; ++i) {
      for (var key in arguments[i]) {
        if (arguments[i].hasOwnProperty(key)) {
            arguments[0][key] = arguments[i][key];
        }
      }
    }
    return arguments[0];
  }
};
