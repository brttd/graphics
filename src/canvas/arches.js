@@include("canvas/common.js");

const pi = Math.PI;
const twopi = Math.PI * 2;
const halfpi = Math.PI * 0.5;

const onedeg = Math.PI / 180;

const arches = [];

let t = Date.now() * 0.001;

const speed = 40;
const minRadius = 40;
const maxRadius = 200;
const minWidth = 10;
const maxWidth = 30;

const offshootAngle = twopi / 5;

function rotate(vec, angle) {
	const cs = Math.cos(angle);
	const sn = Math.sin(angle);

	return {
		x: vec.x * cs - vec.y * sn,
		y: vec.x * sn + vec.y * cs,
	};
}

function render() {
	const d = Math.min(1, Date.now() * 0.001 - t);
	t += Date.now() * 0.001 - t;

	requestAnimationFrame(render);

	// Check all arches
	for (let i = 0; i < arches.length; i++) {
		if (!arches[i].dying) {
			// Check if it's hitting into another circle
			const x = Math.round(
				arches[i].x +
					Math.cos(arches[i].endAngle) * arches[i].radius +
					Math.cos(
						arches[i].endAngle +
							(arches[i].counterClockwise ? -halfpi : halfpi)
					) *
						1.5
			);
			const y = Math.round(
				arches[i].y +
					Math.sin(arches[i].endAngle) * arches[i].radius +
					Math.sin(
						arches[i].endAngle +
							(arches[i].counterClockwise ? -halfpi : halfpi)
					) *
						1.5
			);

			if (x >= 0 && x < width && y >= 0 && y < height) {
				const data = ctx.getImageData(x, y, 1, 1);

				if (data.data[1] <= 128) {
                    arches[i].hitCount += 1;
				}
			} else {
				// Die when hitting image bounds
                arches[i].hitCount += 1;
			}

            if (arches[i].hitCount >= 3) {
                arches[i].dying = true;

                arches[i].endAngle +=
                    (d / arches[i].radius) *
                    speed *
                    (arches[i].counterClockwise ? -1 : 1);
            }
		}
	}

	ctx.clearRect(0, 0, width, height);

	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0, 0, width, height);
	ctx.strokeStyle = "#0f0f0f";

	for (let i = arches.length - 1; i >= 0; i--) {
		ctx.beginPath();
		ctx.lineWidth = arches[i].width;

		if (arches[i].dying) {
			arches[i].startAngle +=
				(d / arches[i].radius) *
				speed *
				(arches[i].counterClockwise ? -1 : 1);

			if (
				arches[i].counterClockwise &&
				arches[i].startAngle <= arches[i].endAngle
			) {
				for (let j = i + 1; j < arches.length; j++) {
					if (arches[j].parent === arches[i]) {
						arches[j].parent = null;
					}
				}

				arches.splice(i, 1);

				continue;
			} else if (
				!arches[i].counterClockwise &&
				arches[i].startAngle >= arches[i].endAngle
			) {
				for (let j = i + 1; j < arches.length; j++) {
					if (arches[j].parent === arches[i]) {
						arches[j].parent = null;
					}
				}

				arches.splice(i, 1);

				continue;
			}
		} else {
			arches[i].endAngle +=
				(d / arches[i].radius) *
				speed *
				(arches[i].counterClockwise ? -1 : 1);

			if (
				arches[i].counterClockwise &&
				arches[i].endAngle <= arches[i].startAngle - twopi
			) {
				arches[i].dying = true;
				arches[i].endAngle = Math.min(
					arches[i].endAngle,
					arches[i].startAngle + twopi
				);
			} else if (
				!arches[i].counterClockwise &&
				arches[i].endAngle >= arches[i].startAngle + twopi
			) {
				arches[i].dying = true;
				arches[i].endAngle = Math.min(
					arches[i].endAngle,
					arches[i].startAngle + twopi
				);
			} else if (arches.length < 1000) {
				if (
					Math.abs(arches[i].endAngle - arches[i].lastOffshootAngle) >
					offshootAngle
				) {
					arches[i].lastOffshootAngle = arches[i].endAngle + (Math.random() - 0.3) * offshootAngle * 0.3;

					const width =
						minWidth + Math.random() * (maxWidth - minWidth);

					const reverseAngle =
						((width * 0.5) / (twopi * arches[i].radius)) *
						twopi *
						(arches[i].counterClockwise ? 1 : -1);

					const direction = {
						x: Math.cos(arches[i].endAngle + reverseAngle),
						y: Math.sin(arches[i].endAngle + reverseAngle),
					};

					const origin = {
						x: arches[i].x + direction.x * arches[i].radius,
						y: arches[i].y + direction.y * arches[i].radius,
					};

					const counterClockwise = Math.random() > 0.5;

					const perpendicular = rotate(
						direction,
						counterClockwise ? -halfpi : halfpi
					);

					const radius =
						minRadius + Math.random() * (maxRadius - minRadius);

					perpendicular.x *= radius;
					perpendicular.y *= radius;

					const angle =
						arches[i].endAngle +
						reverseAngle +
						(counterClockwise ? halfpi : -halfpi);

					// Circumference of a circle is 2 * pi * radius
					// The angle that we need to offset the new line
					// (to get it to start on the _edge_ of the original line,
					// instead of from the center) is then:
					// (<half width of original line> / <circumference of new line>) * 360 deg
					const offset =
						((arches[i].width * 0.5) / (twopi * radius)) *
						twopi *
						(counterClockwise ? -1 : 1);

					arches.push({
						parent: arches[i],
						offshootCount: 0,
						lastOffshootAngle: angle + (Math.random() - 0.5) * offshootAngle * 0.3,

						dying: false,
                        hitCount: 0,
						counterClockwise: counterClockwise,

						x: origin.x + perpendicular.x,
						y: origin.y + perpendicular.y,

						width: width,
						radius: radius,

						startAngle: angle + offset * 0.5,
						endAngle: angle + offset,
					});
				}
			}
		}

		ctx.arc(
			arches[i].x,
			arches[i].y,
			arches[i].radius,
			arches[i].startAngle,
			arches[i].endAngle,
			arches[i].counterClockwise
		);

		ctx.stroke();
	}

	if (arches.length === 0) {
		const angle = Math.random() * twopi;

		const counterClockwise = Math.random() > 0.5;

		arches.push({
			parent: null,
			offshootCount: 0,
			lastOffshootAngle: angle,

			dying: false,
            hitCount: 0,
			counterClockwise: counterClockwise,

			x: width * 0.5,
			y: height * 0.5,

			width: minWidth + Math.random() * (maxWidth - minWidth),
			radius: minRadius + Math.random() * (maxRadius - minRadius),

			startAngle: angle,
			endAngle: angle + (counterClockwise ? -onedeg : onedeg),
		});
	}
}

@@include("canvas/onResize.js")

ctx.fillStyle = "#ffffff";
ctx.fillRect(0, 0, width, height);
render();
