import { loadConfettiPreset } from "@tsparticles/preset-confetti";
import Particles, {
	ParticlesProvider,
	useParticlesProvider,
} from "@tsparticles/react";
import type React from "react";

type Props = {
	show: boolean;
	option: "single" | "flow";
};

type ParticlesOptions = React.ComponentProps<typeof Particles>["options"];

const singleConfettiOptions: ParticlesOptions = {
	preset: "confetti",
};

const flowConfettiOptions: ParticlesOptions = {
	fullScreen: {
		zIndex: 1,
	},
	particles: {
		color: {
			value: ["#00FFFC", "#FC00FF", "#fffc00"],
		},
		move: {
			direction: "bottom",
			enable: true,
			outModes: {
				default: "out",
			},
			size: true,
			speed: {
				min: 1,
				max: 3,
			},
		},
		number: {
			value: 500,
			density: {
				enable: true,
			},
		},
		opacity: {
			value: {
				min: 0,
				max: 1,
			},
			animation: {
				enable: false,
				startValue: "max",
				destroy: "min",
				speed: 2,
				sync: true,
			},
		},
		rotate: {
			value: {
				min: 0,
				max: 360,
			},
			direction: "random",
			move: true,
			animation: {
				enable: true,
				speed: 60,
			},
		},
		tilt: {
			direction: "random",
			enable: true,
			move: true,
			value: {
				min: 0,
				max: 360,
			},
			animation: {
				enable: true,
				speed: 60,
			},
		},
		shape: {
			type: ["circle", "square"],
			options: {},
		},
		size: {
			value: {
				min: 4,
				max: 8,
			},
		},
		roll: {
			darken: {
				enable: true,
				value: 30,
			},
			enlighten: {
				enable: true,
				value: 30,
			},
			enable: true,
			speed: {
				min: 15,
				max: 25,
			},
		},
		wobble: {
			distance: 30,
			enable: true,
			move: true,
			speed: {
				min: -15,
				max: 15,
			},
		},
	},
};

const registerConfettiPreset = async (
	engine: Parameters<React.ComponentProps<typeof ParticlesProvider>["init"]>[0],
) => {
	await loadConfettiPreset(engine);
};

/** Renders only once ParticlesProvider has finished loading the preset. */
const ConfettiParticles: React.FC<{ options: ParticlesOptions }> = ({
	options,
}) => {
	const { loaded } = useParticlesProvider();

	return loaded ? <Particles id="tsparticles" options={options} /> : null;
};

export const ParticleEffect: React.FC<Props> = ({
	show = false,
	option = "single",
}: Props) => {
	const options =
		option === "single" ? singleConfettiOptions : flowConfettiOptions;

	if (!show) {
		return null;
	}

	return (
		<ParticlesProvider init={registerConfettiPreset}>
			<ConfettiParticles options={options} />
		</ParticlesProvider>
	);
};
