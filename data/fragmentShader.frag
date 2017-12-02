uniform sampler2D ballData;
uniform sampler2D wallData;
uniform vec2 playerPos;
uniform float time;

const float TAU = 6.2831853071;

const vec3 PLAYER1 = vec3( 0.25, 0.5, 1.0);
const vec3 PLAYER2 = vec3( 0.5, 1.0, 1.0);

const vec3 BALL1 = vec3( 1.0, 0.4, 0.4);
const vec3 BALL2 = vec3( 1.0, 0.0, 0.0);

vec2 rotate(vec2 vector, float angle){
	float c = cos(angle);
	float s = sin(angle);
	return mat2(
		c, s,
		-s, c
	) * vector;
}

vec4 renderPlayer(vec2 fragCoords){
	const float spintime = 3000.0;
	const float slices = 3.0;
	const float sliceWidth = TAU/slices;
	const float radius = 10.0;
	const float borderWidth = 2.0;

	float rotAngle = mod(time, spintime) / spintime * TAU;

	vec2 coords = fragCoords - playerPos;
	coords = rotate(coords, rotAngle);

	float coordAngle = mod(atan(coords.x, coords.y), sliceWidth);
	float a = step(-sliceWidth/2.0, coordAngle) - step(sliceWidth/2.0, coordAngle);

	vec3 playerColor = mix(PLAYER1, PLAYER2, a);
	float border = smoothstep(radius - borderWidth, radius, length(coords));
	float border2 = smoothstep(radius, radius + borderWidth, length(coords));
	float vis = smoothstep(radius + 2.0 * borderWidth, radius, length(coords));

	playerColor = mix(playerColor, vec3(1.0), border);
	playerColor = mix(playerColor, vec3(0.0), border2);

	return vec4(playerColor, vis);
}

vec4 renderBall(vec2 fragCoords, vec2 ballCoords){
	const float spintime = 3000.0;
	const float slices = 3.0;
	const float sliceWidth = TAU/slices;
	const float radius = 10.0;
	const float borderWidth = 2.0;

	float rotAngle = mod(time, spintime) / spintime * TAU;

	vec2 coords = fragCoords - ballCoords;
	coords = rotate(coords, rotAngle);

	float coordAngle = mod(atan(coords.x, coords.y), sliceWidth);
	float a = step(-sliceWidth/2.0, coordAngle) - step(sliceWidth/2.0, coordAngle);

	vec3 ballColor = mix(BALL1, BALL2, a);
	float vis = smoothstep(radius + borderWidth, radius, length(coords));
	float border = smoothstep(radius - borderWidth, radius, length(coords));

	ballColor = mix(ballColor, vec3(1.0), border);
	return vec4(ballColor, vis);
}

vec4 alphaBlend( vec4 src, vec4 dst ) {
	float a = src.a + dst.a * ( 1.0 - src.a );
	vec3 result = vec3( 0.0 );
	if(a != 0.0){
		result = ( src.rgb * src.a + dst.rgb * dst.a * ( 1.0 - src.a ) ) / a;
	}
	return vec4(result, a);
}

vec4 alphaBlend2( vec4 src, vec4 dst ) {
	float a = src.a + dst.a * ( 1.0 - src.a );
	vec3 result = vec3( 0.0 );
	if(a != 0.0){
		result = ( src.rgb * src.a + dst.rgb * dst.a * ( 1.0 - src.a ) ) / a;
	}
	return vec4(result, a);
}

vec4 renderBalls( vec2 fragCoords ) {
	vec4 ballResult = vec4(0.0);

	vec2 coords = vec2(0.5, 0.5);
	for(int i = 0; i < 256; i++)
	{
		coords.x = (float(2*i) + 0.5) / 512.0;

		vec3 ball = texture2D(ballData, coords).xyz * 255.0 * 256.0;
		coords.x += 1.0/512.0;
		ball += texture2D(ballData, coords).xyz * 255.0;

		if(ball.z > 0.0)
		{
			ballResult = alphaBlend(ballResult, renderBall( fragCoords, ball.xy ));
			if(ballResult.a >= 1.0){
				return ballResult;
			}
		}
		else
		{
			break;
		}
	}

	return ballResult;
}

vec4 renderWalls( vec2 fragCoords ) {
	const float thickness = 2.0;

	float horizontal = 1.0;
	float factor = -1.0;
	vec2 coords = vec2(0.0, 0.25);
	for(int i = 0; i < 256; i++)
	{
		coords.x = (float(2*i) + 0.5) / 512.0;

		vec3 wall = texture2D(wallData, coords).xyz * 255.0 * 256.0;
		coords.x += 1.0/512.0;
		wall += texture2D(wallData, coords).xyz * 255.0;

		if(wall.x != wall.y)
		{
			float x1 = min(wall.x, wall.y);
			float x2 = max(wall.x, wall.y);
			float y = wall.z;

			if(x1 <= fragCoords.x && fragCoords.x < x2){
				horizontal += factor * smoothstep(y + (factor - 1.0) * thickness, y + (factor + 1.0) * thickness, fragCoords.y);
				factor *= -1.0;
			};

		}
		else
		{
			break;
		}
	}

	float vertical = 1.0;
	factor = -1.0;
	coords.y = 0.75;
	for(int i = 0; i < 256; i++)
	{
		coords.x = (float(2*i) + 0.5) / 512.0;

		vec3 wall = texture2D(wallData, coords).xyz * 255.0 * 256.0;
		coords.x += 1.0/512.0;
		wall += texture2D(wallData, coords).xyz * 255.0;

		if(wall.y != wall.z)
		{
			float x = wall.x;
			float y1 = min(wall.y, wall.z);
			float y2 = max(wall.y, wall.z);

			if(y1 <= fragCoords.y && fragCoords.y < y2){
				vertical += factor * smoothstep(x + (factor - 1.0) * thickness, x + (factor + 1.0) * thickness, fragCoords.x);
				factor *= -1.0;
			};
		}
		else
		{
			break;
		}
	}

	return mix(vec4(0.0), vec4(1.0), horizontal * vertical);
}

void main( void ) {
	vec2 fragCoords = gl_FragCoord.xy - vec2(0.5,0.5);

	vec4 color = renderPlayer(fragCoords);

	if(color.a >= 1.0){
		gl_FragColor = color;
		return;
	};
	color = alphaBlend(color, renderBalls(fragCoords));

	if(color.a >= 1.0){
		gl_FragColor = color;
		return;
	};

	color = alphaBlend(color, renderWalls(fragCoords));

	gl_FragColor = alphaBlend(color, vec4(0.0, 0.0, 0.0, 1.0));
}