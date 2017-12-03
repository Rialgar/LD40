uniform sampler2D ballData;
uniform sampler2D wallData;
uniform sampler2D playerWallData;
uniform vec2 playerPos;
uniform float playerHealth;
uniform float playerInvincible;
uniform float time;
uniform vec2 screenshake;

const float TAU = 6.2831853071;

const vec3 PLAYER1 = vec3( 0.25, 0.25, 0.6);
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
	float slices = playerHealth;
	float sliceWidth = TAU/slices;
	const float radius = 10.0;
	const float borderWidth = 2.0;

	float rotAngle = mod(time, spintime) / spintime * TAU;

	vec2 coords = fragCoords - playerPos;
	coords = rotate(coords, rotAngle);

	float coordAngle = mod(atan(coords.x, coords.y), sliceWidth);
	float a = step(sliceWidth/2.0, coordAngle);

	vec3 playerColor = mix(PLAYER1, PLAYER2, a);
	float border = smoothstep(radius - borderWidth, radius, length(coords));
	float border2 = smoothstep(radius, radius + borderWidth, length(coords));
	float vis = smoothstep(radius + 2.0 * borderWidth, radius, length(coords));

	playerColor = mix(playerColor, vec3(1.0), border);
	playerColor = mix(playerColor, vec3(0.0), border2);
	playerColor = mix(playerColor, vec3(1.0), playerInvincible);

	return vec4(playerColor, vis);
}

vec4 renderBall(vec2 fragCoords, vec4 ballData){
	const float spintime = 3000.0;
	const float slices = 3.0;
	const float sliceWidth = TAU/slices;
	const float radius = 10.0;
	const float borderWidth = 2.0;

	float rotAngle = mod(time, spintime) / spintime * TAU;

	vec2 coords = fragCoords - ballData.xy;
	coords = rotate(coords, rotAngle);

	float coordAngle = mod(atan(coords.x, coords.y), sliceWidth);
	coordAngle -= sliceWidth/2.0;

	float hit = ballData.z;
	float health = ballData.w / 100.0;

	if(hit > 5.0){
		float d = length(coords);
		float divisor = 1.5*d/radius;
		float angleV = step(-sliceWidth/divisor, coordAngle) - step(sliceWidth/divisor, coordAngle);

		hit = hit/2.0;
		float visib = smoothstep(radius + borderWidth + hit, radius + hit, d) - smoothstep(hit, hit-borderWidth, d);
		return vec4(vec3(1.0), angleV*visib);
	}

	vec3 ballColor;
	if(hit > 0.0) {
		ballColor = vec3(1.0);
	} else {
		float a = step(-sliceWidth/4.0, coordAngle) - step(sliceWidth/4.0, coordAngle);

		ballColor = mix(BALL1, BALL2, a);
		float border = smoothstep(radius - borderWidth, radius, length(coords));
		ballColor = mix(ballColor, vec3(1.0), border);


		ballColor = mix(vec3(1.0), ballColor, health);
	}

	float vis = smoothstep(radius + borderWidth, radius, length(coords));
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

		vec3 ballData1 = texture2D(ballData, coords).xyz * 255.0;
		coords.x += 1.0/512.0;
		vec3 ballData2 = texture2D(ballData, coords).xyz * 255.0;

		vec4 ball = vec4(0.0);
		ball.xy = ballData1.xy * 256.0 + ballData2.xy;
		ball.z = ballData1.z;
		ball.w = ballData2.z;

		if(ball.z > 0.0 || ball.w > 0.0)
		{
			ballResult = alphaBlend(ballResult, renderBall( fragCoords, ball ));
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

		if(wall.x == 0.0 && wall.y == 0.0 && wall.z == 0.0)
		{
			break;
		}

		float x1 = min(wall.x, wall.y);
		float x2 = max(wall.x, wall.y);
		float y = wall.z;

		if(x1 <= fragCoords.x && fragCoords.x < x2){
			//horizontal += factor * smoothstep(y + (factor - 1.0) * thickness, y + (factor + 1.0) * thickness, fragCoords.y);
			horizontal += factor * smoothstep(y - thickness, y + thickness, fragCoords.y);
			factor *= -1.0;
		};

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

		if(wall.x == 0.0 && wall.y == 0.0 && wall.z == 0.0)
		{
			break;
		}

		float x = wall.x;
		float y1 = min(wall.y, wall.z);
		float y2 = max(wall.y, wall.z);

		if(y1 <= fragCoords.y && fragCoords.y < y2){
			//vertical += factor * smoothstep(x + (factor - 1.0) * thickness, x + (factor + 1.0) * thickness, fragCoords.x);
			vertical += factor * smoothstep(x - thickness, x + thickness, fragCoords.x);
			factor *= -1.0;
		};
	}

	return vec4(187.0/255.0, 164.0/255.0, 127.0/255.0, horizontal * vertical);
}

float distanceToLineSegment(vec2 from, vec2 to, vec2 point){
	float tMax = length(to - from);
	vec2 a = normalize(to - from);
	vec2 n = vec2(a.y, -a.x);

	vec2 b = point - from;
	float t = dot(a, b);

	if(0.0 < t && t < tMax){
		return abs(dot(n, b));
	} else {
		return min(length(b), length(point-to));
	}
}

vec4 renderPlayerWalls(vec2 fragCoords){
	const float thickness = 3.0;

	float d = 1e20;
	vec2 pointA, pointB;
	vec2 coords = vec2(0.0, 0.5);
	for(int i = 0; i < 512; i++)
	{
		coords.x = (float(i) + 0.5) / 512.0;

		pointA = pointB;
		vec4 data = texture2D(playerWallData, coords) * 255.0;
		pointB = data.xy * 256.0 + data.zw;
		if(pointB.x == 0.0 && pointB.y == 0.0){
			break;
		}
		if(i == 0){
			continue;
		}

		d = min(d, distanceToLineSegment(pointA, pointB, fragCoords));
	}

	float a = smoothstep(thickness, 0.0, d);
	return vec4( 1.0, 1.0, 1.0, a );
}

void main( void ) {
	vec2 fragCoords = gl_FragCoord.xy - vec2(0.5,0.5) + screenshake;

	vec4 color = renderPlayer(fragCoords);

	if(color.a >= 1.0){
		gl_FragColor = color;
		return;
	};

	color = alphaBlend(color, renderPlayerWalls(fragCoords));

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