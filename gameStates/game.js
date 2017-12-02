"use strict";
window.getGameState = () => {
	const twidth = 512;

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

			this.balls = [new THREE.Vector2(70,90), new THREE.Vector2(620,30)];
			this.ballData = new Uint8Array( twidth * 3 );

			this.ballTexture = new THREE.DataTexture( this.ballData, twidth, 1, THREE.RGBFormat );
			this.ballTexture.minFilter = THREE.NearestFilter;
			this.ballTexture.magFilter = THREE.NearestFilter;

			this.setBallData();

			this.horizontalWalls = [
				{x1: 0, x2: 100, y:0},
				{x1: 200, x2: 800, y:0},

				{x1: 100, x2: 200, y:50},

				{x1: 150, x2: 600, y:500},

				{x1: 0, x2: 150, y:600},
				{x1: 600, x2: 800, y:600}
			];
			this.verticalWalls = [
				{x: 0, y1:0, y2: 600},
				{x: 100, y1:0, y2: 50},
				{x: 150, y1:500, y2: 600},
				{x: 200, y1:0, y2: 50},
				{x: 600, y1:500, y2: 600},
				{x: 800, y1:0, y2: 600}
			];
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

		},

		step: function( dt ) {
			this.uniforms.time.value += dt * 1000;

			const playerSpeed = 300;
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

		render: function() {
			this.app.renderer.render(this.scene, this.camera);
		}
	}
};