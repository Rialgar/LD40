"use strict";
window.addEventListener('load', () => {
	playground({
		create() {
			this.renderer = new THREE.WebGLRenderer();
			this.renderer.setSize(800, 600);
			this.container.appendChild(this.renderer.domElement);
			this.renderer.setClearColor(0x000000);

			this.gameStates = {
				game: window.getGameState()
			}

			this.loadData('fragmentShader.frag');
			this.loadData('vertexShader.vert');

			document.body.style.background = null;
		},
		ready() {
			this.setState(this.gameStates.game);
		},
		resize() {
			console.log(this.width, this.height);
			console.log(this.height);
			console.log(this.height - 804);
			console.log((this.height - 804) / 2);
			console.log(((this.height - 804) / 2) + 'px');
			this.renderer.domElement.style.top = ((this.height - 604) / 2) + 'px';
			this.renderer.domElement.style.left = ((this.width - 804) / 2) + 'px';
		}
	});
});