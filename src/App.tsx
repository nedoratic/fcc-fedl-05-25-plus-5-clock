import React from 'react';
import './App.css';

interface LengthControlProps {
	addID: string;
	length: number;
	lengthID: string;
	minID: string;
	onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
	title: string;
	titleID: string;
}

class LengthControl extends React.Component<LengthControlProps> {
	render() {
		return (
			<div className="length-control">
				<div id={this.props.titleID}>{this.props.title}</div>
				<button className="btn-level" id={this.props.minID} onClick={this.props.onClick} value="-">
					-
				</button>
				<div className="btn-level" id={this.props.lengthID}>
					{this.props.length}
				</div>
				<button className="btn-level" id={this.props.addID} onClick={this.props.onClick} value="+">
					+
				</button>
			</div>
		);
	}
}

interface AppState {
	brkLength: number;
	seshLength: number;
	timerState: 'stopped' | 'running';
	timerType: 'Session' | 'Break';
	timer: number;
	intervalID: NodeJS.Timeout | number | undefined;
	alarmColor: { color: string };
}

class App extends React.Component<unknown, AppState> {
	private audioBeep: HTMLAudioElement | null;

	constructor(props: unknown) {
		super(props);
		this.state = {
			brkLength: 5,
			seshLength: 25,
			timerState: 'stopped',
			timerType: 'Session',
			timer: 1500,
			intervalID: undefined,
			alarmColor: { color: 'white' },
		};

		this.setBrkLength = this.setBrkLength.bind(this);
		this.setSeshLength = this.setSeshLength.bind(this);
		this.lengthControl = this.lengthControl.bind(this);
		this.timerControl = this.timerControl.bind(this);
		this.beginCountDown = this.beginCountDown.bind(this);
		this.decrementTimer = this.decrementTimer.bind(this);
		this.phaseControl = this.phaseControl.bind(this);
		this.warning = this.warning.bind(this);
		this.buzzer = this.buzzer.bind(this);
		this.switchTimer = this.switchTimer.bind(this);
		this.clockify = this.clockify.bind(this);
		this.reset = this.reset.bind(this);
		this.audioBeep = null;
	}

	setBrkLength(e: React.MouseEvent<HTMLButtonElement>) {
		this.lengthControl('brkLength', e.currentTarget.value, this.state.brkLength, 'Session');
	}

	setSeshLength(e: React.MouseEvent<HTMLButtonElement>) {
		this.lengthControl('seshLength', e.currentTarget.value, this.state.seshLength, 'Break');
	}

	lengthControl(e: string, t: string, s: number, i: string) {
		if (this.state.timerState !== 'running') {
			if (this.state.timerType === i) {
				if (t === '-' && s !== 1) {
					this.setState({ [e]: s - 1 } as unknown as Pick<AppState, keyof AppState>);
				} else if (t === '+' && s !== 60) {
					this.setState({ [e]: s + 1 } as unknown as Pick<AppState, keyof AppState>);
				}
			} else {
				if (t === '-' && s !== 1) {
					this.setState({ [e]: s - 1, timer: 60 * s - 60 } as unknown as Pick<AppState, keyof AppState>);
				} else if (t === '+' && s !== 60) {
					this.setState({ [e]: s + 1, timer: 60 * s + 60 } as unknown as Pick<AppState, keyof AppState>);
				}
			}
		}
	}

	timerControl() {
		if (this.state.timerState === 'stopped') {
			this.beginCountDown();
			this.setState({ timerState: 'running' });
		} else {
			this.setState({ timerState: 'stopped' });
			clearInterval(this.state.intervalID as NodeJS.Timeout | number | undefined);
		}
	}

	beginCountDown() {
		this.setState({
			intervalID: setInterval(() => {
				this.decrementTimer();
				this.phaseControl();
			}, 1000) as unknown as NodeJS.Timeout,
		});
	}

	decrementTimer() {
		this.setState({ timer: this.state.timer - 1 });
	}

	phaseControl() {
		const time = this.state.timer;
		this.warning(time);
		this.buzzer(time);

		if (time < 0) {
			clearInterval(this.state.intervalID as NodeJS.Timeout | number | undefined);

			if (this.state.timerType === 'Session') {
				this.beginCountDown();
				this.switchTimer(60 * this.state.brkLength, 'Break');
			} else {
				this.beginCountDown();
				this.switchTimer(60 * this.state.seshLength, 'Session');
			}
		}
	}

	warning(time: number) {
		this.setState({ alarmColor: time < 61 ? { color: '#a50d0d' } : { color: 'white' } });
	}

	buzzer(time: number) {
		if (time === 0) {
			this.audioBeep?.play();
		}
	}

	switchTimer(newTime: number, newType: 'Session' | 'Break') {
		this.setState({ timer: newTime, timerType: newType, alarmColor: { color: 'white' } });
		if (newType === 'Break') {
			this.audioBeep?.play();
		}
	}

	clockify() {
		if (this.state.timer < 0) return '00:00';
		const minutes = Math.floor(this.state.timer / 60);
		const seconds = this.state.timer % 60;
		const displayMinutes = minutes < 10 ? '0' + minutes : minutes;
		const displaySeconds = seconds < 10 ? '0' + seconds : seconds;
		return `${displayMinutes}:${displaySeconds}`;
	}

	reset() {
		this.setState({
			brkLength: 5,
			seshLength: 25,
			timerState: 'stopped',
			timerType: 'Session',
			timer: 1500,
			intervalID: undefined,
			alarmColor: { color: 'white' },
		});

		clearInterval(this.state.intervalID as NodeJS.Timeout | number | undefined);

		if (this.audioBeep) {
			this.audioBeep.pause();
			this.audioBeep.currentTime = 0;
		}
	}

	render() {
		return (
			<div className="container">
				<div className="main-title">25 + 5 Clock</div>
				<LengthControl addID="break-increment" length={this.state.brkLength} lengthID="break-length" minID="break-decrement" onClick={this.setBrkLength} title="Break Length" titleID="break-label" />
				<LengthControl addID="session-increment" length={this.state.seshLength} lengthID="session-length" minID="session-decrement" onClick={this.setSeshLength} title="Session Length" titleID="session-label" />
				<div className="timer" style={this.state.alarmColor}>
					<div className="timer-wrapper">
						<div id="timer-label">{this.state.timerType}</div>
						<div id="time-left">{this.clockify()}</div>
					</div>
				</div>
				<div className="timer-control">
					<button id="start_stop" onClick={this.timerControl}>
						{this.state.timerState === 'stopped' ? <span>Start</span> : <span>Stop</span>}
					</button>
					<button id="reset" onClick={this.reset}>
						Reset
					</button>
				</div>
				<audio
					id="beep"
					preload="auto"
					ref={(e) => {
						this.audioBeep = e;
					}}
					src="https://cdn.freecodecamp.org/testable-projects-fcc/audio/BeepSound.wav"
				/>
			</div>
		);
	}
}

export default App;
