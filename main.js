"use strict";
window.addEventListener('load', () => {
	playground({
		create: function () {
			this.renderer = new THREE.WebGLRenderer();
			this.renderer.setSize(800, 600);
			this.container.appendChild(this.renderer.domElement);
			this.renderer.setClearColor(0x000000);

			this.gameStates = {
				game: window.getGameState()
			}

			this.loadData('fragmentShader.frag');
			this.loadData('vertexShader.vert');
		},
		ready: function () {
			this.setState(this.gameStates.game);
		},
		resize: function(){}
	});
});