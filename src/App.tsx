import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
	const [breakLength, setBreakLength] = useState(5);
	const [sessionLength, setSessionLength] = useState(25);
	const [isSession, setIsSession] = useState(true);
	const [isActive, setIsActive] = useState(false);
	const [time, setTime] = useState(sessionLength * 60);

	const formatTime = (seconds: number): string => {
		const minutes = Math.floor(seconds / 60)
			.toString()
			.padStart(2, '0');
		const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
		return `${minutes}:${remainingSeconds}`;
	};

	const handleBreakDecrement = () => {
		setBreakLength((prevLength) => Math.max(prevLength - 1, 1));
	};

	const handleBreakIncrement = () => {
		setBreakLength((prevLength) => Math.min(prevLength + 1, 60));
	};

	const handleSessionDecrement = () => {
		setSessionLength((prevLength) => Math.max(prevLength - 1, 1));
	};

	const handleSessionIncrement = () => {
		setSessionLength((prevLength) => Math.min(prevLength + 1, 60));
	};

	const handleStartStop = () => {
		setIsActive(!isActive);
	};

	const handleReset = () => {
		setIsActive(false);
		setBreakLength(5);
		setSessionLength(25);
		setTime(25 * 60);
		setIsSession(true);
	};

	useEffect(() => {
		let interval: NodeJS.Timeout;

		if (isActive) {
			interval = setInterval(() => {
				setTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
			}, 1000);
		} else {
			clearInterval(interval);
		}

		return () => clearInterval(interval);
	}, [isActive]);

	useEffect(() => {
		if (time === 0) {
			// Handle switch between session and break
			setIsSession((prevIsSession) => {
				const newLabel = prevIsSession ? 'Break' : 'Session';
				return !prevIsSession;
			});

			// Set the time for the new session or break
			setTime((prevTime) => (isSession ? breakLength : sessionLength) * 60);
		}
	}, [time, isSession, breakLength, sessionLength]);

	return (
		<div id="root">
			<div id="break-label">Break Length</div>
			<button id="break-decrement" onClick={handleBreakDecrement}>
				Decrement
			</button>
			<div id="break-length">{breakLength}</div>
			<button id="break-increment" onClick={handleBreakIncrement}>
				Increment
			</button>

			<div id="session-label">Session Length</div>
			<button id="session-decrement" onClick={handleSessionDecrement}>
				Decrement
			</button>
			<div id="session-length">{sessionLength}</div>
			<button id="session-increment" onClick={handleSessionIncrement}>
				Increment
			</button>

			<div id="timer-label">{isSession ? 'Session' : 'Break'}</div>
			<div id="time-left">{formatTime(time)}</div>

			<button id="start_stop" onClick={handleStartStop}>
				Start/Stop
			</button>
			<button id="reset" onClick={handleReset}>
				Reset
			</button>
			<audio id="beep" src="path/to/audio.mp3" />
		</div>
	);
}

export default App;
