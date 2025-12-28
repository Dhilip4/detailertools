export function toFraction(decimal: number): string {
    if (decimal === 0) return '0"';

    // Precision: 1/16th inch
    const precision = 16;
    const rounded = Math.round(decimal * precision) / precision;

    const whole = Math.floor(rounded);
    const fraction = rounded - whole;

    // Tolerance for float comparison
    if (fraction < 1.0 / (precision * 2)) return `${whole}"`;

    let numerator = Math.round(fraction * precision);
    let denominator = precision;

    // Simplify fraction
    while (numerator % 2 === 0 && denominator % 2 === 0) {
        numerator /= 2;
        denominator /= 2;
    }

    if (whole > 0) {
        return `${whole}-${numerator}/${denominator}"`;
    }
    return `${numerator}/${denominator}"`;
}
