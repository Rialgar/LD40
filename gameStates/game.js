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

				this.ballData[base+2] = ball.hit;
				this.ballData[base+5] = ball.health;
			});
			const last = this.balls.length * 6;
			if(last+5 < this.ballData.length){
				this.ballData[last] = 0;
				this.ballData[last+1] = 0;
				this.ballData[last+2] = 0;
				this.ballData[last+3] = 0;
				this.ballData[last+4] = 0;
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
				const base = i*2 * 3;
				this.wallData[base] = Math.floor(wall.x1 / 256);
				this.wallData[base+3] = Math.floor(wall.x1 % 256);

				this.wallData[base+1] = Math.floor(wall.x2 / 256);
				this.wallData[base+4] = Math.floor(wall.x2 % 256);

				this.wallData[base+2] = Math.floor(wall.y / 256);
				this.wallData[base+5] = Math.floor(wall.y % 256);
			});
			const lastH = this.horizontalWalls.length*2 * 3;
			if(lastH+5 < twidth * 3){
				this.wallData[lastH] = 0;
				this.wallData[lastH+1] = 0;
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
			const lastV = (twidth + this.verticalWalls.length*2) * 3;
			if(lastV+5 < twidth * 2 * 3){
				this.wallData[lastV] = 0;
				this.wallData[lastV+1] = 0;
				this.wallData[lastV+2] = 0;
				this.wallData[lastV+3] = 0;
				this.wallData[lastV+4] = 0;
				this.wallData[lastV+5] = 0;
			}
			this.wallTexture.needsUpdate = true;
		},

		setPlayerWallData(){
			this.playerWalls.forEach( (point, i) => {
				if(i >= twidth){
					console.error('too many player walls', i);
					return;
				}
				const base = i*4;
				this.playerWallData[base] = Math.floor(point.x / 256);
				this.playerWallData[base+2] = Math.floor(point.x % 256);

				this.playerWallData[base+1] = Math.floor(point.y / 256);
				this.playerWallData[base+3] = Math.floor(point.y % 256);
			});
			const last = this.playerWalls.length * 4;
			if(last+3 < twidth * 4){
				this.playerWallData[last] = 0;
				this.playerWallData[last+1] = 0;
				this.playerWallData[last+2] = 0;
				this.playerWallData[last+3] = 0;
			}

			this.playerWallTexture.needsUpdate = true;
		},

		reset(){
			this.balls = [];

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

			this.verifyWalls();

			this.playerWalls = [];

			this.setBallData();
			this.setWallData();
			this.setPlayerWallData();
		},

		nextLevel(){
			const newLevel = this.levelBefore + this.level;
			this.levelBefore = this.level;
			this.level = newLevel;
			this.reset();
			for (var i = 0; i < this.level; i++) {
				this.addBall();
			}
		},

		create(){

			const width = 800, height = 600;

			this.scene = new THREE.Scene();

			this.camera = new THREE.OrthographicCamera( width / -2, width / 2, height / 2, height / -2, 1, 1000 );
			this.scene.add( this.camera );


			this.ballData = new Uint8Array( twidth * 3 );

			this.ballTexture = new THREE.DataTexture( this.ballData, twidth, 1, THREE.RGBFormat );
			this.ballTexture.minFilter = THREE.NearestFilter;
			this.ballTexture.magFilter = THREE.NearestFilter;

			this.wallData = new Uint8Array( twidth * 3 * 2);

			this.wallTexture = new THREE.DataTexture( this.wallData, twidth, 2, THREE.RGBFormat );
			this.wallTexture.minFilter = THREE.NearestFilter;
			this.wallTexture.magFilter = THREE.NearestFilter;

			this.playerPos = new THREE.Vector2( 0, 300 );

			this.playerWallData = new Uint8Array( twidth * 4);

			this.playerWallTexture = new THREE.DataTexture( this.playerWallData, twidth, 1, THREE.RGBAFormat );
			this.playerWallTexture.minFilter = THREE.NearestFilter;
			this.playerWallTexture.magFilter = THREE.NearestFilter;

			this.uniforms = {
				ballData:  { value: this.ballTexture },
				wallData:  { value: this.wallTexture },
				playerWallData:  { value: this.playerWallTexture },
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

			this.levelBefore = 0;
			this.level = 1;
			this.nextLevel();

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
				console.log('remove');
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

		backupWalls(){
			const backup = {
				horizontal: [],
				vertical: []
			}
			this.horizontalWalls.forEach( wall => {
				backup.horizontal.push({x1: wall.x1, x2: wall.x2, y: wall.y});
			} );
			this.verticalWalls.forEach( wall => {
				backup.vertical.push({x: wall.x, y1: wall.y1, y2: wall.y2});
			} );
			this.horizontalWalls.forEach( (wall, i) => {
				const bwall = backup.horizontal[i];
				bwall.next = backup.vertical[this.verticalWalls.indexOf(wall.next)];
				bwall.prev = backup.vertical[this.verticalWalls.indexOf(wall.prev)];
			} );
			this.verticalWalls.forEach( (wall, i) => {
				const bwall = backup.vertical[i];
				bwall.next = backup.horizontal[this.horizontalWalls.indexOf(wall.next)];
				bwall.prev = backup.horizontal[this.horizontalWalls.indexOf(wall.prev)];
			} );
			return backup;
		},

		removeIfZero(wall){
			if(!wall){
				return;
			}
			const next = wall.next;
			if(!next){
				return;
			}
			const prev = wall.prev;
			if(!prev){
				return;
			}

			if(wall.y !== undefined && wall.x1 === wall.x2){
				this.horizontalWalls.splice(this.horizontalWalls.indexOf(wall), 1);
				prev.next = next;
				next.prev = prev;
				this.joinWithNextWhilePossible(prev);
				return prev;
			} else if(wall.x !== undefined && wall.y1 === wall.y2){
				this.verticalWalls.splice(this.verticalWalls.indexOf(wall), 1);
				prev.next = next;
				next.prev = prev;
				this.joinWithNextWhilePossible(prev);
				return prev;
			} else {
				return wall;
			}
		},

		joinWithNextWhilePossible(wall){
			if(!wall){
				return;
			}
			let next = wall.next;
			if(!next){
				return;
			}
			if(wall.y !== undefined) {
				while(wall != next && wall.y === next.y && wall.x2 === next.x1){
					console.log('joining');
					wall.next = next.next;
					wall.next.prev = wall;
					wall.x2 = next.x2;
					this.horizontalWalls.splice(this.horizontalWalls.indexOf(next), 1);
					next = wall.next;
				}
			} else{
				while(wall != next && wall.x === next.x && wall.y2 === next.y1){
					console.log('joining', wall, next, next.next);
					wall.next = next.next;
					wall.next.prev = wall;
					wall.y2 = next.y2;
					this.verticalWalls.splice(this.verticalWalls.indexOf(next), 1);
					next = wall.next;
				}
			}
		},

		tryInsertWalls(points){
			console.assert(points.length > 0);

			let startWall = this.findWallContaining(points[0]);
			let endWall = this.findWallContaining(points[points.length-1]);

			console.assert(startWall)
			console.assert(endWall);

			const from = points[0];
			const to = points[points.length-1];

			let doRemove = true;

			if(startWall === endWall){
				const startWallHSplit = startWall.y !== undefined && (from.x - startWall.x1) * (from.x - to.x) <= 0;
				const startWallVSplit = startWall.x !== undefined && (from.y - startWall.y1) * (from.y - to.y) <= 0;
				if(startWallHSplit || startWallVSplit){
					endWall = this.splitWall(startWall, from, to);
					doRemove = false;
				}
			}

			if(doRemove) {
				this.removeWalls(startWall, endWall, from, to);
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
			startWall = this.removeIfZero(startWall);
			endWall = this.removeIfZero(endWall);
			this.joinWithNextWhilePossible(startWall);
			this.joinWithNextWhilePossible(endWall.prev);
		},

		anyBallInWall() {
			for (let i = 0; i < this.balls.length; i++) {
				//we reduce the ball radius checked to prevent a ball that is just colliding becaue it was not pushed out enought from counting
				if(this.balls[i].health > 0 && this.isInWall(this.balls[i], ballRadius/1.5)){
					return true;
				}
			}
			return false;
		},

		verifyWalls(){
			console.assert(this.horizontalWalls.length === this.verticalWalls.length, 'parity', this.horizontalWalls.length, this.verticalWalls.length);
			var expected = this.horizontalWalls.length + this.verticalWalls.length;
			var count = 0;
			var current = this.horizontalWalls[0];
			do {
				console.assert(current.next.prev === current, 'bidir', count, current);
				if(current.y !== undefined){
					console.assert(current.x1 !== current.x2, 'non zero', count, current);
					console.assert(current.y === current.next.y1 && current.x2 === current.next.x, 'edges', count, current);
				} else {
					console.assert(current.y1 !== current.y2, 'non zero', count, current);
					console.assert(current.x === current.next.x1 && current.y2 === current.next.y, 'edges', count, current);
				}
				current = current.next;
				count++;
			} while(current != this.horizontalWalls[0])

			console.assert(count === expected);
		},

		insertWalls(points){
			console.assert(!this.anyBallInWall(), 'crap, a ball is collding before we even started');
			let backup = this.backupWalls();

			this.tryInsertWalls(points);
			if(this.anyBallInWall()){

				console.log('restoring backup, trying reverse');

				this.horizontalWalls = backup.horizontal;
				this.verticalWalls = backup.vertical;
				backup = this.backupWalls();

				this.tryInsertWalls(points.reverse());
				if(this.anyBallInWall()){
					console.log('restoring backup, cannot insert walls');

					this.horizontalWalls = backup.horizontal;
					this.verticalWalls = backup.vertical;

					return false;
				}
			}
			this.verifyWalls();
			this.setWallData();
			return true;
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
			const isIn = count % 2 == 0;
			if(!isIn && radius){
				for (let i = 0; i < this.verticalWalls.length; i++) {
					const wall = this.verticalWalls[i];
					if(this.getDistanceToWall(pos, wall) <= radius){
						return true;
					}
				}
			}
			return isIn;
		},

		addBall(x, y){
			let ball = {x: x ||0, y: y || 0, health: 100, hit: 0, dir: {x: Math.random() > 0.5 ? 1 : -1, y: Math.random() > 0.5 ? 1 : -1}};
			while(this.isInWall(ball, ballRadius) || this.doesAnyBallColide(ball)){
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

		doBallsColide(ball1, ball2){
			if(ball1.health <= 0 || ball2.health <= 0){
				return false;
			}
			const d = this.getPointDistance(ball1, ball2);
			return d <= 2*ballRadius
		},

		doesAnyBallColide(ball){
			for (let i = 0; i < this.balls.length; i++) {
				if(this.doBallsColide(ball, this.balls[i])){
					return true;
				}
			}
		},

		handleBallColission(ball1, ball2){
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

			if(ball1.dir.x === ball2.dir.x){
				flipY();
			} else if (ball1.dir.y === ball2.dir.y){
				flipX();
			} else {
				const dx = Math.abs(ball1.x - ball2.x);
				const dy = Math.abs(ball1.y - ball2.y);
				if(dx > 1.2 * dy){
					flipX();
				} else if(dy > 1.2 * dx){
					flipY();
				} else {
					flipBoth();
				}
			}
		},

		moveBalls(dt){
			const ballWallDamage = 10;
			const ballWallHitFrames = 5;
			const ballRegen = 20;

			this.balls.forEach( ball => {

				if(ball.health <= 0){
					ball.hit = ball.hit + 1;
					return;
				}
				ball.hit = Math.max(0, ball.hit - 1);
				ball.health = Math.min(100, ball.health + ballRegen * dt);
				ball.x += ball.dir.x * ballSpeed * dt;
				ball.y += ball.dir.y * ballSpeed * dt;
				for (let i = 0; i < this.horizontalWalls.length; i++) {
					const d = this.getDistanceToWall(ball, this.horizontalWalls[i]);
					if(d <= ballRadius){
						ball.health -= ballWallDamage;
						ball.hit = ballWallHitFrames;
						ball.y -= ball.dir.y * (ballRadius - d);
						ball.dir.y *= -1;
						break;
					}
				}
				for (let i = 0; i < this.verticalWalls.length; i++) {
					const d = this.getDistanceToWall(ball, this.verticalWalls[i]);
					if(d <= ballRadius){
						ball.health -= ballWallDamage;
						ball.hit = ballWallHitFrames;
						ball.x -= ball.dir.x * (ballRadius - d);
						ball.dir.x *= -1;
						break;
					}
				}
			});
			this.balls = this.balls.filter( ball => ball.health > 0 || ball.hit < 50);
			for (let i = 0; i+1 < this.balls.length; i++) {
				for (let j = i+1; j < this.balls.length; j++) {
					if(this.doBallsColide(this.balls[i], this.balls[j])){
						this.handleBallColission(this.balls[i], this.balls[j]);
					}
				}
			}
			this.setBallData();
		},

		intersect(p1, p2, q1, q2){
			const a = p2.clone().sub(p1);
			const b = q2.clone().sub(q1);

			if(a.y === 0.0 && b.y === 0.0){
				return null;
			}

			if(a.x === 0.0 && b.x === 0.0){
				return null;
			};

			//we have only straight walls, no need to check other parallel options

			const tMax = a.length();
			a.normalize();

			const uMax = b.length();
			b.normalize();

			const na = new THREE.Vector2(a.y, -a.x);
			const nb = new THREE.Vector2(b.y, -b.x);

			const start = q1.clone().sub(p1);
			const divisor = a.dot(nb);
			const t = start.dot(nb) / divisor;
			const u = start.dot(na) / divisor;

			if(0.0 <= t && t <= tMax && 0.0 <= u && u <= uMax){
				return p1.clone().add(a.clone().multiplyScalar(t));
			}

			return null;
		},

		findIntersection(p1, p2){
			for (let i = 0; i < this.horizontalWalls.length; i++) {
				const wall = this.horizontalWalls[i];
				const q1 = new THREE.Vector2(wall.x1, wall.y);
				const q2 = new THREE.Vector2(wall.x2, wall.y);
				const point = this.intersect(p1, p2, q1, q2);
				if(point){
					return {
						wall,
						point
					};
				}
			}
			for (let i = 0; i < this.verticalWalls.length; i++) {
				const wall = this.verticalWalls[i];
				const q1 = new THREE.Vector2(wall.x, wall.y1);
				const q2 = new THREE.Vector2(wall.x, wall.y2);
				const point = this.intersect(p1, p2, q1, q2);
				if(point){
					return {
						wall,
						point
					};
				}
			}
			return null;
		},

		processPlayerMovement(playerMovement, dt) {
			const posBefore = new THREE.Vector2(this.playerPos.x, this.playerPos.y).round();
			this.playerPos.x = Math.min(Math.max(this.playerPos.x + playerMovement.x * dt * playerSpeed, 0), 800)
			this.playerPos.y = Math.min(Math.max(this.playerPos.y + playerMovement.y * dt * playerSpeed, 0), 600)
			const posAfter = new THREE.Vector2(this.playerPos.x, this.playerPos.y).round();

			if(playerMovement.length() > 0) {

				let doUpdate = true;

 				if(this.playerWalls.length === 0 && !this.isInWall(posAfter, 1)) { //start a wall
 					const posBeforeMoved = posBefore.clone().sub(posAfter).setLength(5).add(posBefore);
					const intersection = this.findIntersection(posBeforeMoved, posAfter);
					if(intersection){
						this.playerWalls.push(intersection.point);
						this.playerWalls.push(posAfter);
					}
					doUpdate = false;
				} else if(this.playerWalls.length == 2) { //did we cancel building?
					const dBefore = posBefore.distanceTo(this.playerWalls[0]);
					const dAfter = posAfter.distanceTo(this.playerWalls[0]);
					if(dBefore > dAfter && dAfter < 5) {
						this.playerWalls = [];
					}
				}

				if (doUpdate && this.playerWalls.length > 1) { //update last wall
					const last = this.playerWalls[this.playerWalls.length-1];
					const beforeLast = this.playerWalls[this.playerWalls.length-2];
					const delta = last.clone().sub(beforeLast);

					if((playerMovement.y !== 0 && delta.y !== 0) || (playerMovement.x !== 0 && delta.x !== 0)){
						this.playerWalls.pop();
					}

					this.playerWalls.push(posAfter);
				}

				if(this.playerWalls.length > 1){ //close and build if applicable
					const last = this.playerWalls[this.playerWalls.length-1].clone();
					const beforeLast = this.playerWalls[this.playerWalls.length-2].clone();

					const dir = last.clone().sub(beforeLast).normalize();
					beforeLast.add(dir);
					last.add(dir.clone().multiplyScalar(3));

					const intersection = this.findIntersection(beforeLast, last);
					if(intersection){
						if(intersection.point.distanceTo(this.playerWalls[0]) > 2){
							this.playerWalls.pop();
							this.playerWalls.push(intersection.point);
							this.insertWalls(this.playerWalls);
						}
						this.playerWalls = [];
					}
				}

				if(this.playerWalls.length > 4){ //reduce if self-intesecting
					const last = this.playerWalls[this.playerWalls.length-1];
					const beforeLast = this.playerWalls[this.playerWalls.length-2];
					for (let i = 1; i < this.playerWalls.length-2; i++) {
						const from = this.playerWalls[i-1];
						const to = this.playerWalls[i];
						const point = this.intersect(from, to, beforeLast, last);
						if(point){
							this.playerWalls = this.playerWalls.slice(0, i);
							this.playerWalls.push(point);
							break;
						}
					}
				}

				this.setPlayerWallData();
			}
		},

		step( dt ) {
			this.uniforms.time.value += dt * 1000;

			this.moveBalls( dt );

			const playerMovement = new THREE.Vector2();
			switch(true){
				case this.app.keyboard.keys.w:
				case this.app.keyboard.keys.up:
				case (this.app.gamepads[0] && this.app.gamepads[0].buttons.up):
				case (this.app.gamepads[0] && this.app.gamepads[0].sticks[0].y < -0.5):
				case (this.app.gamepads[0] && this.app.gamepads[0].sticks[1].y < -0.5):
					playerMovement.y = 1;
					break;
				case this.app.keyboard.keys.s:
				case this.app.keyboard.keys.down:
				case (this.app.gamepads[0] && this.app.gamepads[0].buttons.down):
				case (this.app.gamepads[0] && this.app.gamepads[0].sticks[0].y > 0.5):
				case (this.app.gamepads[0] && this.app.gamepads[0].sticks[1].y > 0.5):
					playerMovement.y = -1;
					break;
				case this.app.keyboard.keys.a:
				case this.app.keyboard.keys.left:
				case (this.app.gamepads[0] && this.app.gamepads[0].buttons.left):
				case (this.app.gamepads[0] && this.app.gamepads[0].sticks[0].x < -0.5):
				case (this.app.gamepads[0] && this.app.gamepads[0].sticks[1].x < -0.5):
					playerMovement.x = -1;
					break;
				case this.app.keyboard.keys.d:
				case this.app.keyboard.keys.right:
				case (this.app.gamepads[0] && this.app.gamepads[0].buttons.right):
				case (this.app.gamepads[0] && this.app.gamepads[0].sticks[0].x > 0.5):
				case (this.app.gamepads[0] && this.app.gamepads[0].sticks[1].x > 0.5):
					playerMovement.x = 1;
					break;
			}
			this.processPlayerMovement(playerMovement, dt);

			if(this.balls.length === 0){
				this.nextLevel();
			}
		},

		mousedown(event) {
			this.addBall(event.x, 600-event.y);
		},

		render() {
			this.app.renderer.render(this.scene, this.camera);
		}
	}
};