let animationInterval; // Variable to store the interval ID for the animation
let airResistance; // Variable to store the air resistance value
const scaleFactor = 5; // Scale factor to convert meters to pixels
let maxHeightY = null; // Variable to store the y-coordinate of the highest point reached

// Event listener for the form submission
document
	.getElementById("simulation-form")
	.addEventListener("submit", function (event) {
		event.preventDefault(); // Prevent the default form submission behavior
		// Retrieve input values from the form
		const initialHeight = parseFloat(
			document.getElementById("initial_height").value
		);
		const initialVelocity = parseFloat(
			document.getElementById("initial_velocity").value
		);
		const launchAngle = parseFloat(
			document.getElementById("launch_angle").value
		);
		airResistance = parseFloat(document.getElementById("air_resistance").value);
		// Clear any existing animation interval
		if (animationInterval) clearInterval(animationInterval);
		// Start the simulation with the retrieved values
		startSimulation(initialHeight, initialVelocity, launchAngle, airResistance);
	});

// Function to start the simulation
function startSimulation(
	initialHeight,
	initialVelocity,
	launchAngle,
    airResistanceValue
) {
	const g = 9.81; // Acceleration due to gravity in m/s^2
	const container = document.getElementById("simulation-container");
	const canvas = document.getElementById("simulation-canvas");
	const context = canvas.getContext("2d");
	// Set canvas dimensions
	canvas.width = container.clientWidth;
	canvas.height = container.clientHeight;
	const ball = document.getElementById("ball");
	const groundY = canvas.height; // Ground level in pixels
	const ballRadius = 10; // Radius of the ball in pixels
	let t = 0; // Time variable in seconds
	let logInterval = 0.2; // Interval for logging data
	let lastLogTime = 0; // Last time data was logged
	const dt = 0.02; // Time step for the simulation in seconds
	// Calculate initial velocities in x and y directions
	const initialVelocityX =
		initialVelocity * Math.cos((launchAngle * Math.PI) / 180);
	const initialVelocityY =
		-initialVelocity * Math.sin((launchAngle * Math.PI) / 180);
	const initialX = canvas.width / 2; // Initial x position in pixels
	let x = initialX; // Current x position in pixels
	let y = canvas.height - initialHeight * scaleFactor; // Current y position in pixels
	let velocityX = initialVelocityX; // Current velocity in x direction in m/s
	let velocityY = initialVelocityY; // Current velocity in y direction in m/s
	let velocityHistoryList = document.getElementById("velocity-history"); // Element to display velocity history
	velocityHistoryList.innerHTML = ""; // Clear previous velocity history
	let previousPositions = []; // Array to store previous positions for drawing the trajectory

	// Function to draw the simulation
	function draw() {
		context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

		// Draw height scale on the left
		context.beginPath();
		context.strokeStyle = "black";
		context.fillStyle = "black";
		context.font = "12px Arial";
		for (let i = 0; i <= 500; i += 10) {
			const yPos = canvas.height - i * scaleFactor;
			context.moveTo(0, yPos);
			context.lineTo(10, yPos);
			context.stroke();
			context.fillText(i.toString(), 15, yPos + 4);
		}

		// Draw trajectory
		context.beginPath();
		context.moveTo(initialX, canvas.height - initialHeight * scaleFactor);
		previousPositions.forEach((pos) => {
			context.lineTo(pos.x, pos.y);
		});
		context.strokeStyle = "blue";
		context.stroke();

		// Draw highest point marker
		if (maxHeightY !== null) {
			context.beginPath();
			context.moveTo(0, maxHeightY);
			context.lineTo(canvas.width, maxHeightY);
			context.strokeStyle = "red";
			context.stroke();
		}

		// Draw ball
		context.beginPath();
		context.arc(x, y, ballRadius, 0, 2 * Math.PI);
		context.fillStyle = "blue";
		context.fill();
		context.closePath();
	}

	// Function to update information displayed on the screen
	function updateInfo() {
		const velocity = Math.sqrt(velocityX ** 2 + velocityY ** 2); // Calculate current velocity
		const currentHeight = (canvas.height - y) / scaleFactor; // Calculate current height in meters
		if (maxHeightY === null || y < maxHeightY) {
			maxHeightY = y; // Update the highest y-coordinate
		}
		// Update displayed information
		document.getElementById("time-info").innerText = `Time: ${t.toFixed(2)} s`;
		document.getElementById(
			"velocity-info"
		).innerText = `Velocity: ${velocity.toFixed(2)} m/s`;
		document.getElementById("position-info").innerText = `Position: (${(
			x / scaleFactor
		).toFixed(2)}, ${currentHeight.toFixed(2)}) m`;

		// Log velocity and height information at specified intervals
		if (t - lastLogTime >= logInterval) {
			lastLogTime = t;
			let li = document.createElement("li");
			li.textContent = `Time: ${t.toFixed(1)} s, Velocity: ${velocity.toFixed(
				2
			)} m/s, Height: ${currentHeight.toFixed(2)} m`;
			velocityHistoryList.appendChild(li);
		}
	}

	// Function to update the simulation
	function update() {
		t += dt; // Increment time
		// Update velocities considering air resistance
		velocityX -= airResistance * velocityX * dt;
		velocityY += g * dt - airResistance * velocityY * dt;
		// Update positions
		x += velocityX * dt * scaleFactor;
		y += velocityY * dt * scaleFactor;

		// Check if the ball hits the ground
		if (y + ballRadius >= groundY) {
			y = groundY - ballRadius; // Stop the ball at the ground level
			clearInterval(animationInterval); // Stop the animation
		} else {
			previousPositions.push({ x: x, y: y }); // Store current position for trajectory
		}

		draw(); // Draw the updated state
		updateInfo(); // Update displayed information
	}

	draw(); // Initial draw
	animationInterval = setInterval(update, dt * 1000); // Start the animation
}

