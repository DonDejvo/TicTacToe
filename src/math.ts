export const math = (function() {
    return {
        rand(min: number, max: number) {
            return Math.random() * (max - min) + min;
        },
        randint(min: number, max: number) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        },
        lerp(x: number, a: number, b: number) {
            return a + (b - a) * x;
        },
        clamp(x: number, a: number, b: number) {
            return Math.min(Math.max(x, a), b);
        },
        sat(x: number) {
            return Math.min(Math.max(x, 0), 1);
        },
        ease_out(x: number) {
            return Math.min(Math.max(Math.pow(x, 1 / 3), 0), 1);
        },
        ease_in(x: number) {
            return Math.min(Math.max(Math.pow(x, 3), 0), 1);
        }
    }
})();