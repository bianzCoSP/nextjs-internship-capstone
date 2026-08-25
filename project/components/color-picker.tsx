"use client";

import { Check } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";

interface ColorPickerProps {
	name?: string;
	defaultValue?: string;
	error?: string;
}

const HEX_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const PRESET_COLORS = [
	{ label: "Blue Munsell", value: "#4a89a9" },
	{ label: "Paynes Gray", value: "#4c6a7e" },
	{ label: "Red", value: "#ef4444" },
	{ label: "Orange", value: "#f97316" },
	{ label: "Amber", value: "#f59e0b" },
	{ label: "Green", value: "#22c55e" },
	{ label: "Teal", value: "#14b8a6" },
	{ label: "Purple", value: "#a855f7" },
	{ label: "Pink", value: "#ec4899" },
	{ label: "Slate", value: "#64748b" },
];

const DEFAULT_COLOR = PRESET_COLORS[0].value;

export function ColorPicker({
	name = "color",
	defaultValue,
	error,
}: ColorPickerProps) {
	const initial =
		defaultValue && HEX_PATTERN.test(defaultValue)
			? defaultValue
			: DEFAULT_COLOR;

	const [color, setColor] = useState(initial);
	const [isPickerOpen, setIsPickerOpen] = useState(false);
	const popoverRef = useRef<HTMLDivElement>(null);
	const swatchButtonRef = useRef<HTMLButtonElement>(null);
	const inputId = useId();

	useEffect(() => {
		if (!isPickerOpen) return;

		function handlePointerDown(e: MouseEvent) {
			const target = e.target as Node;
			if (
				popoverRef.current &&
				!popoverRef.current.contains(target) &&
				!swatchButtonRef.current?.contains(target)
			) {
				setIsPickerOpen(false);
			}
		}

		document.addEventListener("mousedown", handlePointerDown);
		return () => document.removeEventListener("mousedown", handlePointerDown);
	}, [isPickerOpen]);

	return (
		<div>
			<label
				htmlFor={inputId}
				className="block text-sm font-medium mb-2 text-outer_space-500 dark:text-platinum-500"
			>
				Color
			</label>

			<input type="hidden" name={name} value={color} />

			<div className="flex flex-wrap gap-2 mb-3">
				{PRESET_COLORS.map((preset) => {
					const isSelected = preset.value.toLowerCase() === color.toLowerCase();
					return (
						<button
							key={preset.value}
							type="button"
							title={preset.label}
							aria-label={preset.label}
							aria-pressed={isSelected}
							onClick={() => setColor(preset.value)}
							className="relative w-8 h-8 rounded-full border border-black/10 dark:border-white/10 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue_munsell-500"
							style={{ backgroundColor: preset.value }}
						>
							{isSelected && (
								<Check
									size={16}
									className="absolute inset-0 m-auto text-white drop-shadow"
								/>
							)}
						</button>
					);
				})}
			</div>

			<div className="relative flex items-center gap-2">
				<button
					ref={swatchButtonRef}
					type="button"
					onClick={() => setIsPickerOpen((open) => !open)}
					aria-label="Open custom color picker"
					aria-expanded={isPickerOpen}
					className="w-9 h-9 rounded-lg border border-black/10 dark:border-white/10 shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue_munsell-500"
					style={{ backgroundColor: color }}
				/>

				<div className="relative flex-1">
					<span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-paynes_gray-500 dark:text-french_gray-400 pointer-events-none">
						#
					</span>
					<HexColorInput
						id={inputId}
						color={color}
						onChange={setColor}
						prefixed={false}
						className="w-full pl-6 pr-3 py-2 border rounded-lg font-mono text-sm bg-transparent text-outer_space-500 dark:text-platinum-500"
					/>
				</div>

				{isPickerOpen && (
					<div
						ref={popoverRef}
						className="absolute z-20 top-full left-0 mt-2 p-3 bg-white dark:bg-outer_space-500 border border-french_gray-300 dark:border-paynes_gray-400 rounded-lg shadow-xl"
					>
						<HexColorPicker color={color} onChange={setColor} />
					</div>
				)}
			</div>

			{error && <p className="text-sm text-red-500 mt-1">{error}</p>}
		</div>
	);
}
