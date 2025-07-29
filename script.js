class ProfessionalStopwatch {
    constructor() {
        this.startTime = 0;
        this.elapsedTime = 0;
        this.timerInterval = null;
        this.isRunning = false;
        this.lapCount = 0;
        this.lapTimes = [];
        this.theme = localStorage.getItem('theme') || 'light';
        this.isFullscreen = false;
        
        this.initializeApp();
    }

    async initializeApp() {
        // Show loading overlay
        this.showLoading();
        
        // Simulate initialization delay for professional feel
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        this.initializeElements();
        this.bindEvents();
        this.applyTheme();
        this.updateDisplay();
        this.updateStats();
        
        // Hide loading overlay
        this.hideLoading();
    }

    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        overlay.classList.remove('hidden');
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        overlay.classList.add('hidden');
    }

    initializeElements() {
        // Timer elements
        this.timerDisplay = document.getElementById('timerDisplay');
        this.timerStatus = document.getElementById('timerStatus');
        this.hoursElement = this.timerDisplay.querySelector('.hours');
        this.minutesElement = this.timerDisplay.querySelector('.minutes');
        this.secondsElement = this.timerDisplay.querySelector('.seconds');
        this.millisecondsElement = this.timerDisplay.querySelector('.milliseconds');
        
        // Control buttons
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.lapBtn = document.getElementById('lapBtn');
        
        // Other controls
        this.themeToggle = document.getElementById('themeToggle');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.clearLapsBtn = document.getElementById('clearLapsBtn');
        this.exportBtn = document.getElementById('exportBtn');
        
        // Display elements
        this.lapTimesContainer = document.getElementById('lapTimes');
        this.emptyState = document.getElementById('emptyState');
        this.statsSection = document.getElementById('statsSection');
        this.totalLapsElement = document.getElementById('totalLaps');
        this.bestLapElement = document.getElementById('bestLap');
        this.avgLapElement = document.getElementById('avgLap');
    }

    bindEvents() {
        // Timer controls
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.lapBtn.addEventListener('click', () => this.lap());
        
        // Other controls
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        this.clearLapsBtn.addEventListener('click', () => this.clearLaps());
        this.exportBtn.addEventListener('click', () => this.exportLaps());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Fullscreen change events
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('MSFullscreenChange', () => this.handleFullscreenChange());
        
        // Button click animations
        this.addButtonAnimations();
    }

    addButtonAnimations() {
        const buttons = document.querySelectorAll('.btn, .btn-small');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                if (!button.disabled) {
                    this.createRippleEffect(e);
                }
            });
        });
    }

    createRippleEffect(e) {
        const button = e.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    start() {
        if (!this.isRunning) {
            this.startTime = Date.now() - this.elapsedTime;
            this.timerInterval = setInterval(() => this.updateDisplay(), 10);
            this.isRunning = true;
            
            this.updateButtonStates();
            this.updateTimerStatus('Running...');
            this.timerDisplay.classList.add('running');
            
            // Update button text and icon
            this.startBtn.querySelector('.btn-text').textContent = 'Running';
            this.startBtn.querySelector('.btn-icon').textContent = '⏸';
        }
    }

    pause() {
        if (this.isRunning) {
            clearInterval(this.timerInterval);
            this.isRunning = false;
            
            this.updateButtonStates();
            this.updateTimerStatus('Paused');
            this.timerDisplay.classList.remove('running');
            
            // Update button text and icon
            this.startBtn.querySelector('.btn-text').textContent = 'Resume';
            this.startBtn.querySelector('.btn-icon').textContent = '▶';
        }
    }

    reset() {
        clearInterval(this.timerInterval);
        this.isRunning = false;
        this.elapsedTime = 0;
        this.lapCount = 0;
        this.lapTimes = [];
        
        this.updateDisplay();
        this.updateButtonStates();
        this.updateTimerStatus('Ready to start');
        this.updateStats();
        this.clearLapDisplay();
        this.timerDisplay.classList.remove('running');
        
        // Reset button text and icon
        this.startBtn.querySelector('.btn-text').textContent = 'Start';
        this.startBtn.querySelector('.btn-icon').textContent = '▶';
    }

    lap() {
        if (this.isRunning) {
            this.lapCount++;
            const currentTime = this.elapsedTime;
            const previousTime = this.lapTimes.length > 0 ? this.lapTimes[this.lapTimes.length - 1].time : 0;
            const splitTime = currentTime - previousTime;
            
            const lapData = {
                number: this.lapCount,
                time: currentTime,
                split: splitTime,
                timestamp: new Date()
            };
            
            this.lapTimes.push(lapData);
            this.addLapToDisplay(lapData);
            this.updateStats();
            this.updateButtonStates();
        }
    }

    updateDisplay() {
        if (this.isRunning) {
            this.elapsedTime = Date.now() - this.startTime;
        }
        
        const time = this.formatTimeObject(this.elapsedTime);
        
        this.hoursElement.textContent = time.hours;
        this.minutesElement.textContent = time.minutes;
        this.secondsElement.textContent = time.seconds;
        this.millisecondsElement.textContent = time.milliseconds;
    }

    formatTimeObject(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const ms = Math.floor((milliseconds % 1000) / 10);

        return {
            hours: hours.toString().padStart(2, '0'),
            minutes: minutes.toString().padStart(2, '0'),
            seconds: seconds.toString().padStart(2, '0'),
            milliseconds: ms.toString().padStart(2, '0')
        };
    }

    formatTime(milliseconds) {
        const time = this.formatTimeObject(milliseconds);
        return `${time.hours}:${time.minutes}:${time.seconds}.${time.milliseconds}`;
    }

    updateButtonStates() {
        if (this.isRunning) {
            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
            this.resetBtn.disabled = true;
            this.lapBtn.disabled = false;
        } else {
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
            this.resetBtn.disabled = false;
            this.lapBtn.disabled = true;
        }
        
        // Update lap-related buttons
        const hasLaps = this.lapTimes.length > 0;
        this.clearLapsBtn.disabled = !hasLaps;
        this.exportBtn.disabled = !hasLaps;
    }

    updateTimerStatus(status) {
        this.timerStatus.textContent = status;
    }

    addLapToDisplay(lapData) {
        if (this.emptyState.style.display !== 'none') {
            this.emptyState.style.display = 'none';
        }

        const lapItem = document.createElement('div');
        lapItem.className = 'lap-item new';
        lapItem.innerHTML = `
            <div class="lap-info">
                <span class="lap-number">#${lapData.number}</span>
                <span class="lap-time">${this.formatTime(lapData.time)}</span>
            </div>
            <span class="lap-split">+${this.formatTime(lapData.split)}</span>
        `;

        // Insert at the top (after empty state)
        const firstChild = this.lapTimesContainer.firstElementChild.nextElementSibling;
        if (firstChild) {
            this.lapTimesContainer.insertBefore(lapItem, firstChild);
        } else {
            this.lapTimesContainer.appendChild(lapItem);
        }

        // Remove animation class after animation completes
        setTimeout(() => {
            lapItem.classList.remove('new');
        }, 300);

        // Auto-scroll to show new lap
        this.lapTimesContainer.scrollTop = 0;
    }

    clearLapDisplay() {
        const lapItems = this.lapTimesContainer.querySelectorAll('.lap-item');
        lapItems.forEach(item => item.remove());
        this.emptyState.style.display = 'block';
    }

    clearLaps() {
        if (confirm('Are you sure you want to clear all lap times?')) {
            this.lapTimes = [];
            this.lapCount = 0;
            this.clearLapDisplay();
            this.updateStats();
            this.updateButtonStates();
        }
    }

    updateStats() {
        this.totalLapsElement.textContent = this.lapTimes.length;
        
        if (this.lapTimes.length === 0) {
            this.bestLapElement.textContent = '--:--:--';
            this.avgLapElement.textContent = '--:--:--';
            return;
        }
        
        // Calculate best lap (shortest split time)
        const bestLap = this.lapTimes.reduce((best, current) => 
            current.split < best.split ? current : best
        );
        this.bestLapElement.textContent = this.formatTime(bestLap.split);
        
        // Calculate average lap time
        const totalSplitTime = this.lapTimes.reduce((sum, lap) => sum + lap.split, 0);
        const avgSplitTime = totalSplitTime / this.lapTimes.length;
        this.avgLapElement.textContent = this.formatTime(avgSplitTime);
    }

    exportLaps() {
        if (this.lapTimes.length === 0) return;
        
        const data = [
            'ChronoMaster Pro - Lap Times Export',
            `Exported on: ${new Date().toLocaleString()}`,
            `Total Laps: ${this.lapTimes.length}`,
            '',
            'Lap#\tTotal Time\tSplit Time'
        ];
        
        this.lapTimes.forEach(lap => {
            data.push(`${lap.number}\t${this.formatTime(lap.time)}\t${this.formatTime(lap.split)}`);
        });
        
        const blob = new Blob([data.join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chronomaster-laps-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        localStorage.setItem('theme', this.theme);
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const themeIcon = this.themeToggle.querySelector('.theme-icon');
        themeIcon.textContent = this.theme === 'light' ? '🌙' : '☀️';
    }

    toggleFullscreen() {
        if (!this.isFullscreen) {
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
        }
    }

    enterFullscreen() {
        const element = document.documentElement;
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }

    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    handleFullscreenChange() {
        this.isFullscreen = !!(document.fullscreenElement || 
                              document.webkitFullscreenElement || 
                              document.mozFullScreenElement || 
                              document.msFullscreenElement);
        
        const appContainer = document.querySelector('.app-container');
        const fullscreenIcon = this.fullscreenBtn.querySelector('.fullscreen-icon');
        
        if (this.isFullscreen) {
            appContainer.classList.add('fullscreen-mode');
            fullscreenIcon.textContent = '⛶';
        } else {
            appContainer.classList.remove('fullscreen-mode');
            fullscreenIcon.textContent = '⛶';
        }
    }

    handleKeyboard(e) {
        // Prevent shortcuts when typing in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        switch(e.code) {
            case 'Space':
                e.preventDefault();
                if (!this.startBtn.disabled) {
                    this.start();
                } else if (!this.pauseBtn.disabled) {
                    this.pause();
                }
                break;
            case 'KeyR':
                if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    if (!this.resetBtn.disabled) {
                        this.reset();
                    }
                }
                break;
            case 'KeyL':
                if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    if (!this.lapBtn.disabled) {
                        this.lap();
                    }
                }
                break;
            case 'KeyF':
                e.preventDefault();
                this.toggleFullscreen();
                break;
            case 'KeyT':
                e.preventDefault();
                this.toggleTheme();
                break;
        }
    }
}

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProfessionalStopwatch();
});

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}