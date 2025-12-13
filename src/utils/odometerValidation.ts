/**
 * Utility functions for odometer validation and trip calculations
 */

export interface ValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * Validate start odometer reading
 * @param startOdometer - The odometer reading at trip start
 * @param lastOdometer - The last recorded odometer reading (optional)
 * @returns Validation result with error message if invalid
 */
export const validateStartOdometer = (
    startOdometer: number,
    lastOdometer?: number
): ValidationResult => {
    if (startOdometer <= 0) {
        return { valid: false, error: "เลขไมล์ต้องมากกว่า 0" };
    }

    if (lastOdometer && startOdometer < lastOdometer) {
        return {
            valid: false,
            error: `เลขไมล์ต้องมากกว่าหรือเท่ากับเลขไมล์ล่าสุด (${lastOdometer.toLocaleString()} กม.)`,
        };
    }

    return { valid: true };
};

/**
 * Validate end odometer reading
 * @param endOdometer - The odometer reading at trip end
 * @param startOdometer - The odometer reading at trip start
 * @returns Validation result with error message if invalid
 */
export const validateEndOdometer = (
    endOdometer: number,
    startOdometer: number
): ValidationResult => {
    if (endOdometer <= startOdometer) {
        return {
            valid: false,
            error: `เลขไมล์สิ้นสุดต้องมากกว่าเลขไมล์เริ่มต้น (${startOdometer.toLocaleString()} กม.)`,
        };
    }

    return { valid: true };
};

/**
 * Calculate trip metrics (distance and duration)
 * @param startOdometer - Starting odometer reading
 * @param endOdometer - Ending odometer reading
 * @param startTime - Trip start time (ISO string)
 * @param endTime - Trip end time (ISO string)
 * @returns Object containing total distance and trip duration in minutes
 */
export const calculateTripMetrics = (
    startOdometer: number,
    endOdometer: number,
    startTime: string,
    endTime: string
) => {
    const distance = endOdometer - startOdometer;
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end.getTime() - start.getTime();
    const durationMinutes = Math.floor(durationMs / (1000 * 60));

    return {
        totalDistance: distance,
        tripDuration: durationMinutes,
    };
};

/**
 * Format duration in minutes to Thai readable format
 * @param minutes - Duration in minutes
 * @returns Formatted string (e.g., "5 ชม. 30 นาที")
 */
export const formatDuration = (minutes?: number): string => {
    if (!minutes) return "-";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
        return `${mins} นาที`;
    }

    if (mins === 0) {
        return `${hours} ชม.`;
    }

    return `${hours} ชม. ${mins} นาที`;
};

/**
 * Get current date-time in ISO format for Thailand timezone
 * @returns ISO string of current date-time
 */
export const getCurrentDateTime = (): string => {
    return new Date().toISOString();
};

/**
 * Format ISO datetime to Thai time display
 * @param isoString - ISO datetime string
 * @returns Formatted time string (e.g., "08:30")
 */
export const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
};
