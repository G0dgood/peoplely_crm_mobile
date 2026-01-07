/**
 * Chart Data Generator Utility
 * Generates chart data based on data source and chart color
 */

import { filterDispositionsByTimeRange } from './filterUtils';
import { ChartDataItem } from './types';
 

interface SetupData {
	dashboardSettings: {
		dispositions?: { name: string; color?: string }[];
		callOutcomes?: { name: string }[];
		dispositionSettings?: {
			timeRangeView?: string;
		};
	};
}

interface DispositionFieldEntry {
	fieldName: string;
	fieldValue: any;
}

interface DispositionItem {
	dispositionData?: DispositionFieldEntry[];
	[key: string]: unknown;
}

// Disposition field mappings (same as AddWidgetModal)
// Removed static DISPOSITION_FIELDS as per request to use dynamic data


/**
 * Generate color variations from a base color
 */
export const generateColorVariations = (baseColor: string, count: number): string[] => {
	if (!baseColor || !baseColor.startsWith('#')) {
		// Default colors if no valid color provided
		const defaultColors = ['#FF6B6B', '#4ECDC4', '#A8E6CF', '#FFD93D', '#6BCF7F', '#95A5A6', '#E74C3C', '#3498DB'];
		return defaultColors.slice(0, count);
	}

	// Convert hex to HSL
	const hexToHsl = (hex: string) => {
		const r = parseInt(hex.slice(1, 3), 16) / 255;
		const g = parseInt(hex.slice(3, 5), 16) / 255;
		const b = parseInt(hex.slice(5, 7), 16) / 255;
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
        let h = 0, s = 0; const l = (max + min) / 2;
		if (max !== min) {
			const d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch (max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}
		return { h: h * 360, s: s * 100, l: l * 100 };
	};

	// Convert HSL to hex
	const hslToHex = (h: number, s: number, l: number) => {
		h /= 360; s /= 100; l /= 100;
		const hue2rgb = (p: number, q: number, t: number) => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};
		let r, g, b;
		if (s === 0) {
			r = g = b = l;
		} else {
			const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			const p = 2 * l - q;
			r = hue2rgb(p, q, h + 1 / 3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1 / 3);
		}
		const toHex = (c: number) => {
			const hex = Math.round(c * 255).toString(16);
			return hex.length === 1 ? '0' + hex : hex;
		};
		return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
	};

	const baseHsl = hexToHsl(baseColor);
	const colors: string[] = [];
	
	// Generate variations by adjusting lightness and saturation
	for (let i = 0; i < count; i++) {
		const lightness = Math.max(20, Math.min(80, baseHsl.l + (i % 3 - 1) * 15));
		const saturation = Math.max(30, Math.min(100, baseHsl.s + (i % 2) * 10));
		const hue = (baseHsl.h + (i * 30)) % 360; // Rotate hue for variety
		colors.push(hslToHex(hue, saturation, lightness));
	}
	
	return colors;
};

/**
 * Generate chart data based on dataSource(s)
 * Supports both single string and array of strings for multiple data sources
 */
export const generateChartData = (
	dataSource: string | string[],
	chartColor: string | undefined,
	setupData: SetupData,
	pendingDispositionsCount: number,
	colors?: Record<string, string>, // Map of data source to color
	providedDispositions?: DispositionItem[]
): ChartDataItem[] => {
	// Handle multiple data sources
	if (Array.isArray(dataSource) && dataSource.length > 1) {
		const labelMap = new Map<string, { value: number; color: string }>();

		// Generate data for each source
		dataSource.forEach((source, index) => {
			// Get color for this specific data source
			const sourceColor = colors?.[source] || chartColor;
			// Call the internal function to generate data for a single source
			const sourceData = generateSingleSourceData(source, sourceColor, setupData, pendingDispositionsCount, providedDispositions);
			
			// Combine data by label, summing values
			sourceData.forEach(item => {
				const existing = labelMap.get(item.label);
				if (existing) {
					existing.value += item.value;
				} else {
					// Use color from the data source's color map, or generate variations
					let itemColor = item.color;
					if (colors?.[source]) {
						// Use the specific color for this data source
						itemColor = colors[source];
					} else if (chartColor) {
						// Generate color variations based on base color
						const colorVariations = generateColorVariations(chartColor, dataSource.length);
						itemColor = colorVariations[index % colorVariations.length] || item.color;
					} else {
						// Use default colors
						const defaultColors = [
							'#FF6B6B',
							'#4ECDC4',
							'#A8E6CF', 
							'#FFD93D', 
							'#6BCF7F',
							'#95A5A6', 
							'#E74C3C',
							'#3498DB'];
						itemColor = defaultColors[index % defaultColors.length] || item.color;
					}
					labelMap.set(item.label, {
						value: item.value,
						color: itemColor
					});
				}
			});
		});

		// Convert map to array
		return Array.from(labelMap.entries()).map(([label, data]) => ({
			label,
			value: data.value,
			color: data.color
		}));
	}

	// Handle single data source (backward compatibility)
	const singleSource = Array.isArray(dataSource) ? dataSource[0] : dataSource;
	const sourceColor = colors?.[singleSource] || chartColor;
	return generateSingleSourceData(singleSource, sourceColor, setupData, pendingDispositionsCount, providedDispositions);
};

/**
 * Generate chart data for a single data source
 * This is the internal implementation that handles one data source at a time
 */
const generateSingleSourceData = (
	dataSource: string,
	chartColor: string | undefined,
	setupData: SetupData,
	pendingDispositionsCount: number,
	providedDispositions?: DispositionItem[]
): ChartDataItem[] => {
	let allDispositions: DispositionItem[];
	if (providedDispositions) {
		allDispositions = providedDispositions;
	} else {
		allDispositions = [];
	}

	// Filter by time range if specified
	const timeRange = setupData.dashboardSettings?.dispositionSettings?.timeRangeView || 'daily';
	const filteredDispositions = filterDispositionsByTimeRange(allDispositions, timeRange);

	// Use filtered dispositions for counting
	const dispositionsToCount = filteredDispositions;

	// Handle disposition categories (Fields) - Aggregate values
	if (setupData.dashboardSettings.dispositions) {
		const disposition = setupData.dashboardSettings.dispositions.find((d: { name: string; color?: string }) => d.name === dataSource);
		if (disposition) {
			const counts: Record<string, number> = {};
			
			dispositionsToCount.forEach(disp => {
				let value: string | undefined;

				// Check dispositionData array
				if (disp.dispositionData && Array.isArray(disp.dispositionData)) {
					const field = disp.dispositionData.find((f: DispositionFieldEntry) => f.fieldName === disposition.name);
					if (field) {
						value = field.fieldValue?.toString().trim();
					}
				}

				// Fallback for direct property access
				if (!value) {
					const directValue = disp[disposition.name as keyof typeof disp];
					if (directValue) {
						value = directValue.toString().trim();
					}
				}

				if (value && value !== '-') {
					counts[value] = (counts[value] || 0) + 1;
				}
			});

			const labels = Object.keys(counts);
			const fieldColors = generateColorVariations(chartColor || disposition.color || '#FF6B6B', labels.length);

			return labels.map((label, index) => ({
				label,
				value: counts[label],
				color: fieldColors[index]
			}));
		}
	}

	// Handle call outcomes (Specific Values) - Count occurrences
	if (setupData.dashboardSettings.callOutcomes) {
		const outcome = setupData.dashboardSettings.callOutcomes.find((o: { name: string }) => o.name === dataSource);
		if (outcome) {
			// Count call outcomes (fieldValue matches outcome name)
			const count = dispositionsToCount.filter(disp => {
				if (disp.dispositionData && Array.isArray(disp.dispositionData)) {
					return disp.dispositionData.some((f: DispositionFieldEntry) =>
						f.fieldValue && f.fieldValue.toString().toLowerCase() === outcome.name.toLowerCase()
					);
				}
				return false;
			}).length;
			
			return [{ label: outcome.name, value: count, color: chartColor || '#4ECDC4' }];
		}
	}

	// Handle special cases
	if (dataSource === 'Pending Dispositions') {
		return [{ label: 'Pending', value: pendingDispositionsCount, color: chartColor || '#FFD93D' }];
	}

	if (dataSource === 'Total Dispositions') {
		return [{ label: 'Total', value: dispositionsToCount.length, color: chartColor || '#6BCF7F' }];
	}

	if (dataSource === 'Total Calls') {
		return [{ label: 'Total Calls', value: dispositionsToCount.length, color: chartColor || '#3498DB' }];
	}

	if (dataSource === 'Completed Calls') {
		const completed = dispositionsToCount.filter(disp => {
			return 'status' in disp && disp.status !== 'pending';
		}).length;
		return [{ label: 'Completed', value: completed, color: chartColor || '#6BCF7F' }];
	}

	// Remove static placeholders (Active Agents, Average Call Duration, Custom Data)
	// Return empty array if no match found
	return [];
};
