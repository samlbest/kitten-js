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

	var createCanvas = function() {
		if (typeof kt.container === 'undefined' || !kt.container) {
			var canvasContainer = document.createElement('div');
			var body = document.querySelector('body');
			document.body.appendChild(canvasContainer);
			canvasContainer.style.position = 'absolute',
				canvasContainer.style.left = '0px', canvasContainer.style.top = '0px',
			    canvasContainer.style.width = body.scrollWidth + 'px', canvasContainer.style.height = body.scrollHeight + 'px';
			    canvasContainer.style.zIndex = '10000';

		    kt.container = canvasContainer;
		}

		var canvas = document.createElement('canvas');
		canvas.style.width = canvasContainer.scrollWidth + 'px';
		canvas.style.height = canvasContainer.scrollHeight + 'px';
		canvas.width = canvasContainer.scrollWidth;
    	canvas.height = canvasContainer.scrollHeight;
    	canvas.style.overflow = 'visible';
    	canvas.style.position = 'absolute';

    	kt.container.appendChild(canvas);

    	kt.canvas = canvas;
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

		createCanvas();

		return kt;
	};

	kt.spawn = function(obj) {
		if (typeof obj !== 'undefined' && obj) {
			kt.type = obj.type !== 'undefined' && obj.type ? obj.type : 'kitten'; 
		}

		var sprite = new ktGfx.Sprite(canvasContext());
		sprite = new ktGfx.Sprite(canvasContext());
		sprite._vector = new ktGfx.Vector(5.0, 5.0);
		kt.addSprite(sprite);

		kt.startLoop();

		return kt;
	};

	kt.startLoop = function() {
		if (typeof kt.loop === 'undefined' || !kt.loop) {
			kt.loopIteration = 0;
			kt.loop = setInterval(function() {
				kt.moveSprites();
				++kt.loopIteration;
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

	kt.moveSprites = function() {
		var sprites = kt.getSprites();

		for (var i = 0; i < sprites.length; ++i) {
			var sprite = sprites[i];
			sprite.update();

			// Correct the position of the update caused the sprite to move off the canvas.
			var correctedPosition = sprite.correctedPosition(new ktGfx.Size(kt.canvas.scrollWidth, kt.canvas.scrollHeight),
															 new ktGfx.Point(kt.canvas.offsetLeft, kt.canvas.offsetTop));
			sprite._position.x += correctedPosition.x;
			sprite._position.y += correctedPosition.y;


			// Reverse the vector if the sprite is at the edge of the canvas.
			if ((sprite._position.x + sprite._size.width == kt.canvas.width && sprite._vector.x > 0) ||
				(sprite._position.x == 0 && sprite._vector.x < 0)) {
				sprite._vector.x *= -1;
			}

			if ((sprite._position.y + sprite._size.height == kt.canvas.height && sprite._vector.y > 0) ||
				(sprite._position.y == 0 && sprite._vector.y < 0)) {
				sprite._vector.y *= -1;
			}

			sprite.draw();

			if (kt.loopIteration % 10 == 0) {
				sprite._vector.x += Helpers.randomIntFromInterval(-3, 3);
				sprite._vector.y += Helpers.randomIntFromInterval(-3, 3);

				var xVectorIsNegative = sprite._vector.x < 0 ? -1 : 1;
				var yVectorIsNegative = sprite._vector.y < 0 ? -1 : 1;

				if (Math.abs(sprite._vector.x) > sprite._maxDirectionalSpeed) {
					sprite._vector.x = sprite._maxDirectionalSpeed * xVectorIsNegative;
				}

				if (Math.abs(sprite._vector.y) > sprite._maxDirectionalSpeed) {
					sprite._vector.y = sprite._maxDirectionalSpeed * yVectorIsNegative;
				}
			}
		}
		return kt;
	};

	kt.getSprites = function() {
		if (typeof kt.spriteMap === 'undefined' || !kt.spriteMap) {
			kt.spriteMap = Array();
		}
		return kt.spriteMap;
	};

	kt.addSprite = function(sprite) {
		if (sprite instanceof ktGfx.Sprite) {
			kt.getSprites().push(sprite);
		}
	}

}.call(this));

(function() {
	var root = this;
	var ktGfx = function(obj) {
		if (obj instanceof ktGfx) {
			return obj;
		}
		if (!(this instanceof ktGfx)) {
			return new ktGfx(obj);
			this.ktGfxWrapped = obj;
		}
	};

  	if (typeof exports !== 'undefined') {
    	if (typeof module !== 'undefined' && module.exports) {
      		exports = module.exports = ktGfx;
    	}
    	exports.ktGfx = ktGfx;
  	} else {
    	root.ktGfx = ktGfx;
  	}

  	// Represent a point on a cartesian plane
	ktGfx.Point = function(x, y) {
		this.x = x;
		this.y = y;
	};

	// Represent a size -- width, height
	ktGfx.Size = function(width, height) {
		this.width = width;
		this.height = height;
	};

	// Represent a vector <x, y>
	ktGfx.Vector = function(x, y) {
		this.x = x;
		this.y = y;
	};

	ktGfx.Vector.prototype.magnitude = function() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	// Represent a sprite with position, size, vector, and a canvas.
	ktGfx.Sprite = function(context) {
		this._context = context;
		this._position = new ktGfx.Point(0.0, 0.0);
		this._lastPosition = new ktGfx.Point(this._position.x, this._position.y);
		this._size = new ktGfx.Size(10.0, 10.0);
		this._vector = new ktGfx.Vector(0.0, 0.0);
		this._maxMagnitude = 10;
		this._maxDirectionalSpeed = 10;
	};

	// Clears the old sprite drawing, redraws at current position.
	ktGfx.Sprite.prototype.draw = function() {
		this._context.clearRect(this._lastPosition.x, this._lastPosition.y, this._size.width, this._size.height);
		this.render();
	};

	// Renders the sprite on the canvas at the current position.
	ktGfx.Sprite.prototype.render = function() {
		var radius = this._size.width / 2;

	    this._context.beginPath();
	    this._context.fillStyle = 'green';
	    this._context.fillRect(this._position.x, this._position.y, this._size.width, this._size.height);
	    this._context.closePath();
	};

	// Returns the next position of the sprite as a Point.
	ktGfx.Sprite.prototype.nextPosition = function() {
		return new ktGfx.Point(this._position.x + this._vector.x, this._position.y + this._vector.y);
	};

	// Sets the position of the sprite, without drawing.
	ktGfx.Sprite.prototype.setPosition = function(position) {
		if (position instanceof Point) {
			this._position = position;
		}
	};

	// Update the sprite's position by adding its current vector to its current position.
	ktGfx.Sprite.prototype.update = function() {
		this._lastPosition.x = this._position.x;
		this._lastPosition.y = this._position.y;
		this._position.x += this._vector.x;
		this._position.y += this._vector.y;
	};

	ktGfx.Sprite.prototype.intersects = function(sprite) {


		if (this._position.x + this._size.width <= sprite._position.x && this._position.y + this._size.height <= sprite._position.y) {
			return true;
		}

		return false;
	};

	// Returns the offset (as a Position) needed to place the sprite at the nearest point 
	// where it is fully contained in the container.
	ktGfx.Sprite.prototype.correctedPosition = function(containerSize, containerOrigin) {
		if (containerSize instanceof ktGfx.Size && containerOrigin instanceof ktGfx.Point) {
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

			return new ktGfx.Point(xOffset, yOffset);
		}
	};
}).call(this);

var Helpers = {
	randomIntFromInterval: function(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	},
	randomFloatFromInterval: function(min, max) {
		return Math.random() * (max - min + 1) + min;
	}
};