"use strict";
window.getGameState = () => {
	const twidth = 512;
	const ballSpeed = 150;
	const ballRadius = 10;
	const playerRadius = 10;
	const playerSpeed = 300;

	return {
		setBallData(){
			this.balls.forEach( (ball, i) => {
				if(i >= twidth/2){
					console.error('too many balls', i);
					return;
				}
				const base = i*6;
				this.ballData[base] = Math.floor(ball.x / 256);
				this.ballData[base+3] = Math.floor(ball.x % 256);

				this.ballData[base+1] = Math.floor(ball.y / 256);
				this.ballData[base+4] = Math.floor(ball.y % 256);

				this.ballData[base+2] = 255;
				this.ballData[base+5] = 255;
			});
			const last = this.balls.length * 6;
			if(last+5 < this.ballData.length){
				this.ballData[last+2] = 0;
				this.ballData[last+5] = 0;
			}
			this.ballTexture.needsUpdate = true;
		},

		setWallData(){
			this.horizontalWalls.forEach( (wall, i) => {
				if(i >= twidth/2){
					console.error('too many walls', i);
					return;
				}
				const base = i*6;
				this.wallData[base] = Math.floor(wall.x1 / 256);
				this.wallData[base+3] = Math.floor(wall.x1 % 256);

				this.wallData[base+1] = Math.floor(wall.x2 / 256);
				this.wallData[base+4] = Math.floor(wall.x2 % 256);

				this.wallData[base+2] = Math.floor(wall.y / 256);
				this.wallData[base+5] = Math.floor(wall.y % 256);
			});
			const lastH = this.horizontalWalls.length * 6;
			if(lastH+5 < twidth * 3){
				this.wallData[lastH] = 0;
				this.wallData[lastH+2] = 0;
				this.wallData[lastH+3] = 0;
				this.wallData[lastH+4] = 0;
				this.wallData[lastH+5] = 0;
			}
			this.verticalWalls.forEach( (wall, i) => {
				if(i >= twidth/2){
					console.error('too many walls', i);
					return;
				}
				const base = (twidth + i*2 ) * 3;
				this.wallData[base] = Math.floor(wall.x / 256);
				this.wallData[base+3] = Math.floor(wall.x % 256);

				this.wallData[base+1] = Math.floor(wall.y1 / 256);
				this.wallData[base+4] = Math.floor(wall.y1 % 256);

				this.wallData[base+2] = Math.floor(wall.y2 / 256);
				this.wallData[base+5] = Math.floor(wall.y2 % 256);
			});
			const lastV = twidth + this.horizontalWalls.length * 6;
			if(lastV+5 < twidth * 2 * 3){
				this.wallData[lastV] = 0;
				this.wallData[lastV+2] = 0;
				this.wallData[lastV+3] = 0;
				this.wallData[lastV+4] = 0;
				this.wallData[lastV+5] = 0;
			}
			this.wallTexture.needsUpdate = true;
		},

		create: function() {

			const width = 800, height = 600;

			this.scene = new THREE.Scene();

			this.camera = new THREE.OrthographicCamera( width / -2, width / 2, height / 2, height / -2, 1, 1000 );
			this.scene.add( this.camera );

			this.balls = [];
			this.ballData = new Uint8Array( twidth * 3 );

			this.ballTexture = new THREE.DataTexture( this.ballData, twidth, 1, THREE.RGBFormat );
			this.ballTexture.minFilter = THREE.NearestFilter;
			this.ballTexture.magFilter = THREE.NearestFilter;

			this.setBallData();

			this.horizontalWalls = [
				{x1: 0, x2: 800, y:0},
				{x1: 800, x2: 0, y:600}
			];
			this.verticalWalls = [
				{x: 0, y1:600, y2: 0},
				{x: 800, y1:0, y2: 600}
			];

			this.horizontalWalls[0].next = this.verticalWalls[1];
			this.horizontalWalls[1].next = this.verticalWalls[0];
			this.horizontalWalls[0].prev = this.verticalWalls[0];
			this.horizontalWalls[1].prev = this.verticalWalls[1];

			this.verticalWalls[0].next = this.horizontalWalls[0];
			this.verticalWalls[1].next = this.horizontalWalls[1];
			this.verticalWalls[0].prev = this.horizontalWalls[1];
			this.verticalWalls[1].prev = this.horizontalWalls[0];

			this.wallData = new Uint8Array( twidth * 3 * 2);

			this.wallTexture = new THREE.DataTexture( this.wallData, twidth, 2, THREE.RGBFormat );
			this.wallTexture.minFilter = THREE.NearestFilter;
			this.wallTexture.magFilter = THREE.NearestFilter;

			this.setWallData();

			this.playerPos = new THREE.Vector2( 400, 300 );

			this.uniforms = {
				ballData:  { value: this.ballTexture },
				wallData:  { value: this.wallTexture },
				playerPos: { value: this.playerPos },
				time: { value: 0 }
			};

			const material = new THREE.ShaderMaterial({
				uniforms: this.uniforms,
				fragmentShader: this.app.data.fragmentShader,
				vertexShader: this.app.data.vertexShader
			});

			const planeGeom = new THREE.PlaneGeometry( width, height );

			this.plane = new THREE.Mesh(planeGeom, material);
			this.scene.add(this.plane);

			this.camera.position.z = 2;
			this.camera.lookAt(new THREE.Vector3(0,0,0));


			window.state = this;
		},

		addWall(wall){
			if(wall.prev){
				console.assert(!wall.prev.next);
				wall.prev.next = wall;
			}
			if(wall.next){
				console.assert(!wall.next.prev);
				wall.next.prev = wall;
			}
			if(wall.y !== undefined) {
				let index = this.horizontalWalls.findIndex( w => w.y >= wall.y );
				if(index < 0){
					index = this.horizontalWalls.length;
				}
				this.horizontalWalls.splice(index, 0, wall);
			} else {
				let index = this.verticalWalls.findIndex( w => w.x >= wall.x );
				if(index < 0){
					index = this.verticalWalls.length;
				}
				this.verticalWalls.splice(index, 0, wall);
			}
		},

		makeWall(from, to, prev, next){
			const wall = { prev, next };
			if( from.x === to.x){
				wall.x = from.x;
				wall.y1 = from.y;
				wall.y2 = to.y;
			} else {
				wall.x1 = from.x;
				wall.x2 = to.x;
				wall.y = from.y;
			}
			return wall;
		},

		splitWall(wall, from, to){
			const next = wall.next;
			wall.next = undefined;
			next.prev = undefined;
			if(wall.y !== undefined){
				const endX = wall.x2;
				wall.x2 = from.x;
				const newWall = this.makeWall(to, {x: endX, y: wall.y}, undefined, next);
				this.addWall(newWall);
				return newWall;
			} else {
				const endY = wall.y2 ;
				wall.y2 = from.y;
				const newWall = this.makeWall(to, {x: wall.x, y: endY}, undefined, next);
				this.addWall(newWall);
				return newWall;
			}
		},

		removeWalls(startWall, endWall, from, to){
			for(let nextWall = startWall.next; nextWall != endWall; nextWall = nextWall.next){
				console.assert(nextWall && nextWall != startWall);
				console.log('removing', nextWall);
				if(nextWall.y !== undefined){
					this.horizontalWalls.splice(this.horizontalWalls.indexOf(nextWall), 1);
				} else {
					this.verticalWalls.splice(this.verticalWalls.indexOf(nextWall), 1);
				}
			}
			if(startWall.y !== undefined){
				startWall.x2 = from.x;
			} else {
				startWall.y2 = from.y;
			}
			if(endWall.y !== undefined){
				endWall.x1 = to.x;
			} else {
				endWall.y1 = to.y;
			}
			startWall.next = undefined;
			endWall.prev = undefined;
		},

		findWallContaining(p){
			let wall = this.horizontalWalls.find( w => w.y === p.y && w.x1 !== p.x && (w.x1 - p.x) * (w.x2 - p.x) <= 0 );
			if(wall){
				return wall;
			}

			return this.verticalWalls.find( w => w.x === p.x && w.y1 !== p.y && (w.y1 - p.y) * (w.y2 - p.y) <= 0 );
		},

		insertWalls(... points){
			console.assert(points.length > 0);

			const startWall = this.findWallContaining(points[0]);
			let endWall = this.findWallContaining(points[points.length-1]);

			console.assert(startWall)
			console.assert(endWall);

			if(startWall === endWall){
				endWall = this.splitWall(startWall, points[0], points[points.length-1]);
			} else {
				this.removeWalls(startWall, endWall, points[0], points[points.length-1]);
			}
			let prev = startWall;
			let next = undefined;
			for (let i = 0; i+1 < points.length; i++) {
				if(i+2 === points.length){
					next = endWall;
				}
				prev = this.makeWall(points[i], points[i+1], prev, next);
				this.addWall(prev);
			}
			this.setWallData();
		},

		getDistanceToWall(pos, wall){
			const b = new THREE.Vector2(pos.x, pos.y);
			if( wall.x1 !== undefined ){
				if((wall.x1 - b.x) * (wall.x2 - b.x) <= 0){
					return Math.abs(b.y - wall.y);
				} else {
					const d1 = b.distanceTo(new THREE.Vector2(wall.x1, wall.y));
					const d2 = b.distanceTo(new THREE.Vector2(wall.x2, wall.y));
					return Math.min(d1, d2);
				}
			} else {
				if((wall.y1 - b.y) * (wall.y2 - b.y) <= 0){
					return Math.abs(b.x - wall.x);
				} else {
					const d1 = b.distanceTo(new THREE.Vector2(wall.x, wall.y1));
					const d2 = b.distanceTo(new THREE.Vector2(wall.x, wall.y2));
					return Math.min(d1, d2);
				}
			};
		},

		isInWall(pos, radius){
			let count = 0;
			for (let i = 0; i < this.horizontalWalls.length; i++) {
				const wall = this.horizontalWalls[i];
				if(radius && this.getDistanceToWall(pos, wall) <= radius){
					return true;
				}
				const x1 = Math.min(wall.x1, wall.x2);
				const x2 = Math.max(wall.x1, wall.x2);
				if(x1 <= pos.x && pos.x < x2 && wall.y < pos.y){
					count++;
				}
			};
			return count % 2 == 0;
		},

		addBall(x, y){
			let ball = {x: x ||0, y: y || 0, dir: {x: Math.random() > 0.5 ? 1 : -1, y: Math.random() > 0.5 ? 1 : -1}};
			while(this.isInWall(ball, ballRadius)){
				ball.x = Math.random() * 800;
				ball.y = Math.random() * 600;
			}
			this.balls.push(ball);
		},

		getPointDistance(pos1, pos2){
			const v1 = new THREE.Vector2(pos1.x, pos1.y);
			const v2 = new THREE.Vector2(pos2.x, pos2.y);
			return v1.distanceTo(v2);
		},

		checkBallColission(ball1, ball2){
			const d = this.getPointDistance(ball1, ball2);

			const flipY = () => {
				ball1.y -= ball1.dir.y * (ballRadius - d/2);
				ball2.y -= ball2.dir.y * (ballRadius - d/2);
				ball1.dir.y *= -1;
				ball2.dir.y *= -1;
			};

			const flipX = () => {
				ball1.x -= ball1.dir.x * (ballRadius - d/2);
				ball2.x -= ball2.dir.x * (ballRadius - d/2);
				ball1.dir.x *= -1;
				ball2.dir.x *= -1;
			}

			const flipBoth = () => {
				const s = 1/Math.sqrt(2);

				ball1.x -= ball1.dir.x * (ballRadius - d/2 * s);
				ball1.y -= ball1.dir.y * (ballRadius - d/2 * s);

				ball2.x -= ball2.dir.x * (ballRadius - d/2 * s);
				ball2.y -= ball2.dir.y * (ballRadius - d/2 * s);

				ball1.dir.x *= -1;
				ball1.dir.y *= -1;
				ball2.dir.x *= -1;
				ball2.dir.y *= -1;
			}

			if( d <= 2*ballRadius){
				if(ball1.dir.x === ball2.dir.x){
					flipY();
				} else if (ball1.dir.y === ball2.dir.y){
					flipX();
				} else {
					var dx = Math.abs(ball1.x - ball2.x);
					var dy = Math.abs(ball1.y - ball2.y);
					if(dx > 1.2 * dy){
						flipX();
					} else if(dy > 1.2 * dx){
						flipY();
					} else {
						flipBoth();
					}
				}
			}
		},

		moveBalls(dt){
			this.balls.forEach( ball => {
				ball.x += ball.dir.x * ballSpeed * dt;
				ball.y += ball.dir.y * ballSpeed * dt;
				for (let i = 0; i < this.horizontalWalls.length; i++) {
					const d = this.getDistanceToWall(ball, this.horizontalWalls[i]);
					if(d <= ballRadius){
						ball.y -= ball.dir.y * (ballRadius - d);
						ball.dir.y *= -1;
						break;
					}
				}
				for (let i = 0; i < this.verticalWalls.length; i++) {
					const d = this.getDistanceToWall(ball, this.verticalWalls[i]);
					if(d <= ballRadius){
						ball.x -= ball.dir.x * (ballRadius - d);
						ball.dir.x *= -1;
						break;
					}
				}
			});
			for (let i = 0; i+1 < this.balls.length; i++) {
				for (let j = i+1; j < this.balls.length; j++) {
					this.checkBallColission(this.balls[i], this.balls[j]);
				}
			}
			this.setBallData();
		},

		step: function( dt ) {
			this.uniforms.time.value += dt * 1000;

			this.moveBalls( dt );

			switch(true){
				case this.app.keyboard.keys.w:
				case this.app.keyboard.keys.up:
					this.playerPos.y += dt * playerSpeed;
					break;
				case this.app.keyboard.keys.s:
				case this.app.keyboard.keys.down:
					this.playerPos.y -= dt * playerSpeed;
					break;
				case this.app.keyboard.keys.a:
				case this.app.keyboard.keys.left:
					this.playerPos.x -= dt * playerSpeed;
					break;
				case this.app.keyboard.keys.d:
				case this.app.keyboard.keys.right:
					this.playerPos.x += dt * playerSpeed;
					break;
			}
			this.playerPos.x = Math.min(Math.max(this.playerPos.x, 0), 800)
			this.playerPos.y = Math.min(Math.max(this.playerPos.y, 0), 600)
		},

		mousedown: function(event) {
			this.addBall(event.x, 600-event.y);
		},

		render: function() {
			this.app.renderer.render(this.scene, this.camera);
		}
	}
};