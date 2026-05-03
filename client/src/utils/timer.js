export function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const minutesString = String(minutes);
    const secondsString = String(seconds);
    const formattedMinutes = minutesString.padStart(2, '0');
    const formattedSeconds = secondsString.padStart(2, '0');

    const result = `${formattedMinutes}:${formattedSeconds}`;
    return result;
    }

    export function createLevelTimer(scene) {
        let startAt = scene.time.now;

        return {
            reset() {
                startAt = scene.time.now;
            },

            getMs() {
                return Math.max(0, scene.time.now - startAt);
            },

            getElapsedSeconds() {
                return Math.floor(this.getMs() / 1000);Ф
            },

            getFormatted() {
                return formatTime(this.getMs());
            }
    };
}