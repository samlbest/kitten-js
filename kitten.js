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


	ktGfx.Point = function(x, y) {
		this.x = x;
		this.y = y;
	};

	ktGfx.Size = function(width, height) {
		this.width = width;
		this.height = height;
	};

	ktGfx.Vector = function(x, y) {
		this.x = x;
		this.y = y;
	};

	ktGfx.Sprite = function(context) {
		this._context = context;
		this._position = new ktGfx.Point(0.0, 0.0);
		this._lastPosition = new ktGfx.Point(this._position.x, this._position.y);
		this._size = new ktGfx.Size(10.0, 10.0);
		this._vector = new ktGfx.Vector(0.0, 0.0);
	};

	ktGfx.Sprite.prototype.draw = function() {
		this._context.clearRect(this._lastPosition.x, this._lastPosition.y, this._size.width, this._size.height);
		this.render();
	};

	ktGfx.Sprite.prototype.render = function() {
		var radius = this._size.width / 2;

	    this._context.beginPath();
	    this._context.fillStyle = 'green';
	    this._context.fillRect(this._position.x, this._position.y, this._size.width, this._size.height);
	    this._context.closePath();
	};

	ktGfx.Sprite.prototype.nextPosition = function() {
		return new ktGfx.Vector(this._position.x + this._vector.x, this._position.y + this._vector.y);
	};

	ktGfx.Sprite.prototype.setPosition = function(position) {
		if (position instanceof Point) {
			this._position = position;
		}
	};

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
	}

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
		kt.sprite = new ktGfx.Sprite(canvasContext());
		kt.sprite._vector = new ktGfx.Vector(5.0, 5.0);
		kt.addSprite(sprite);

		setInterval(function() {
			kt.moveSprites();


		}, 25);
	};

	kt.moveSprites = function() {
		var sprites = kt.getSprites();

		for (var i = 0; i < sprites.length; ++i) {
			var sprite = sprites[i];
			var nextPosition = sprite.nextPosition();


			if (nextPosition.x >= kt.canvas.width) {
				sprite.setPosition(new Vector(nextPosition))
			}

			if ((kt.sprite._position.x >= kt.canvas.width && kt.sprite._vector.x > 0) ||
				(kt.sprite._position.x <= 0 && kt.sprite._vector.x < 0)) {
				kt.sprite._vector.x *= -1;
			}

			if ((kt.sprite._position.y >= kt.canvas.height && kt.sprite._vector.y > 0) ||
				(kt.sprite._position.y <= 0 && kt.sprite._vector.y < 0)) {
				kt.sprite._vector.y *= -1;
			}

			kt.sprite.update();
			kt.sprite.draw();
		}
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