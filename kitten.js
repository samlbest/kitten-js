
(function() {
  var root = this;
  var gfx = function(obj) {
    if (obj instanceof gfx) {
      return obj;
    }
    if (!(this instanceof gfx)) {
      return new gfx(obj);
      this.gfxWrapped = obj;
    }
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = gfx;
    }
    exports.gfx = gfx;
  } else {
    root.gfx = gfx;
  }

  //================================================
  //=====================POINT======================
  //================================================
  // Represent a point on a cartesian plane
  gfx.Point = function(x, y) {
    this.x = x;
    this.y = y;
  };

  //================================================
  //=====================SIZE=======================
  //================================================
  // Represent a size -- width, height
  gfx.Size = function(width, height) {
    this.width = width;
    this.height = height;
  };

  //================================================
  //====================VECTOR======================
  //================================================
  // Represent a vector <x, y>
  gfx.Vector = function(x, y) {
    this.x = x;
    this.y = y;
  };

  gfx.Vector.prototype.magnitude = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  //================================================
  //====================SPRITE======================
  //================================================
  // Represent a sprite with position, size, vector, and a canvas.
  gfx.Sprite = function(context, options) {
    var defaults = {
      position : new gfx.Point(0.0, 0.0),
      lastPosition : new gfx.Point(0.0, 0.0),
      size : new gfx.Size(10.0, 10.0),
      vector : new gfx.Vector(0.0, 0.0),
      maxMagnitude : 10,
      maxDirectionalSpeed : 10
    };

    var options = Helpers.extend({}, defaults, options);

    this._context = context;
    this._position = options.position;
    this._lastPosition = options.lastPosition;
    this._size = options.size;
    this._vector = options.vector;
    this._maxMagnitude = options.maxMagnitude;
    this._maxDirectionalSpeed = options.maxDirectionalSpeed;
  };

  // Clears the old sprite drawing, re-renders at current position.
  gfx.Sprite.prototype.draw = function() {
    this._context.clearRect(this._lastPosition.x, this._lastPosition.y, this._size.width, this._size.height);
    this.render();
  };

  // Renders the sprite on the canvas at the current position using the default appearance.
  gfx.Sprite.prototype.render = function() {
    var radius = this._size.width / 2;
    this._context.beginPath();
    this._context.fillStyle = 'green';
    this._context.fillRect(this._position.x, this._position.y, this._size.width, this._size.height);
    this._context.closePath();
  };

  // Returns the next position of the sprite as a Point.
  gfx.Sprite.prototype.nextPosition = function() {
    return new gfx.Point(this._position.x + this._vector.x, this._position.y + this._vector.y);
  };

  // Changes the vector of the sprite to stay in the canvas. This creates a "bounce" effect.
  // Also calculates bounce based on the position of the other sprites in the SpriteMap.
  gfx.Sprite.prototype.correctVectorAndPositionIfNeeded = function(spriteMap, canvas) {
    // Correct the position of the update caused the sprite to move off the canvas.
    var correctedPosition = this.correctedPosition(new gfx.Size(canvas.scrollWidth, canvas.scrollHeight),
                             new gfx.Point(canvas.offsetLeft, canvas.offsetTop));
    this._position.x += correctedPosition.x;
    this._position.y += correctedPosition.y;


    // Reverse the vector if the sprite is at the edge of the canvas.
    if ((this._position.x + this._size.width == canvas.width && this._vector.x > 0) ||
      (this._position.x == 0 && this._vector.x < 0)) {
      this._vector.x *= -1;
    }

    if ((this._position.y + this._size.height == canvas.height && this._vector.y > 0) ||
      (this._position.y == 0 && this._vector.y < 0)) {
      this._vector.y *= -1;
    }


    for (var i = 0; i < spriteMap.length; ++i) {
      var sprite = spriteMap[i];
      if (sprite !== this && sprite.intersects(this)) {
        sprite._vector.x *= -1;
        sprite._vector.y *= -1;
      }
    }
  };

  // Adjusts the sprite's vector by a random amount.
  gfx.Sprite.prototype.randomizeVector = function() {
    this._vector.x += Helpers.randomIntFromInterval(-3, 3);
    this._vector.y += Helpers.randomIntFromInterval(-3, 3);

    var xVectorIsNegative = this._vector.x < 0 ? -1 : 1;
    var yVectorIsNegative = this._vector.y < 0 ? -1 : 1;

    if (Math.abs(this._vector.x) > this._maxDirectionalSpeed) {
      this._vector.x = this._maxDirectionalSpeed * xVectorIsNegative;
    }

    if (Math.abs(this._vector.y) > this._maxDirectionalSpeed) {
      this._vector.y = this._maxDirectionalSpeed * yVectorIsNegative;
    }
  };

  // Sets the position of the sprite, without drawing.
  gfx.Sprite.prototype.setPosition = function(position) {
    if (position instanceof Point) {
      this._position = position;
    }
  };

  // Update the sprite's position by adding its current vector to its current position.
  gfx.Sprite.prototype.moveAlongVector = function() {
    this._lastPosition.x = this._position.x;
    this._lastPosition.y = this._position.y;
    this._position.x += this._vector.x;
    this._position.y += this._vector.y;
  };

  // True if the two sprites intersect with each other.
  gfx.Sprite.prototype.intersects = function(sprite) {
    var firstSpriteX = sprite;
    var firstSpriteY = sprite;

    var secondSpriteX = this;
    var secondSpriteY = this;

    // We need to include the width or height of the sprite that is lower on the plane in the comparison
    if (this._position.x < sprite._position.x) {
      firstSpriteX = this;
      secondSpriteX = sprite;
    }

    if (this._position.y < sprite._position.y) {
      firstSpriteY = this;
      secondspriteY = this;
    }

    var firstSpriteRight = firstSpriteX._position.x + firstSpriteX._size.width;
    var secondSpriteLeft = secondSpriteX._position.x;
    var secondSpriteRight = secondSpriteX._position.y;

    var firstSpriteBottom = firstSpriteY._position.y + firstSpriteY._size.height;
    var secondSpriteTop = secondSpriteY._position.y;

    if (firstSpriteRight >= secondSpriteLeft && firstSpriteBottom >= secondSpriteTop) {
      return true;
    }

    return false;
  };

  // Returns the offset (as a Position) needed to place the sprite at the nearest point 
  // where it is fully contained in the container.
  gfx.Sprite.prototype.correctedPosition = function(containerSize, containerOrigin) {
    if (containerSize instanceof gfx.Size && containerOrigin instanceof gfx.Point) {
      var xOffset = 0;
      var yOffset = 0;

      var nextPosition = this._position;

      // Need to increase current x-position to correct.
      if (nextPosition.x < containerOrigin.x) {
        xOffset = containerOrigin.x - nextPosition.x;
      }

      // Need to decrease current x-position to correct.
      else if (nextPosition.x + this._size.width > containerOrigin.x + containerSize.width) {
        xOffset = containerOrigin.x + containerSize.width - nextPosition.x - this._size.width ;
      }

      // Need to increase current y-position to correct.
      if (nextPosition.y < containerOrigin.y) {
        yOffset = containerOrigin.y - nextPosition.y;
      }

      // Need to decrease current y-position to correct.
      else if (nextPosition.y + this._size.height > containerOrigin.y + containerSize.height) {
        yOffset = containerOrigin.y + containerSize.height - nextPosition.y - this._size.height;
      }

      return new gfx.Point(xOffset, yOffset);
    }
  };
  //================================================
  //==================SPRITEMAP=====================
  //================================================
  gfx.SpriteMap = function(canvas, options) {
    var defaults = {
      maxSprites : 10
    };

    var options = Helpers.extend({}, defaults, options);

    this.maxSprites = options.maxSprites;
    this.sprites = [];
    this.canvas = canvas;
    this.updateCount = 0;
  };
  
  // Triggers recalculation of sprite position and then redraws the sprites at their next position.
  gfx.SpriteMap.prototype.redrawSprites = function() {
    for (var i = 0; i < this.sprites.length; ++i) {
      var sprite = this.sprites[i];
      sprite.moveAlongVector();

      sprite.correctVectorAndPositionIfNeeded(this.sprites, this.canvas);

      sprite.draw();

      if (this.updateCount++ % 10 == 0) {
        sprite.randomizeVector();
      }
    }
  };

  gfx.SpriteMap.prototype.addSprite = function(sprite) {
    if (this.sprites.length < this.maxSprites && typeof sprite !== 'undefined' && sprite && sprite instanceof gfx.Sprite) {
      this.sprites.push(sprite);
    }
  };
}).call(this);

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
      size : new gfx.Size(25.0, 25.0),
      vector : new gfx.Vector(0.0, 0.0),
      maxMagnitude : 10,
      maxDirectionalSpeed : 10
    };

    var options = Helpers.extend({}, defaults, options);

    var kitten = new gfx.Sprite(context, options);

    // Define appearance of kitten sprite.
    kitten.render = function() {
      var radius = this._size.width / 2;
      this._context.beginPath();
      this._context.fillStyle = 'blue';
      this._context.fillRect(this._position.x, this._position.y, this._size.width, this._size.height);
      this._context.closePath();
    }

    return kitten;
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