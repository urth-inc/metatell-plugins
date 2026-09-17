import { render } from "@testing-library/react";
import React from "react";
import { CustomOverlay } from "./CustomOverlay";
import styles from "./CustomOverlay.module.scss";

vi.mock("./CustomOverlay.module.scss", () => ({
	default: {
		customOverlayContainer: "customOverlayContainer",
		sampleOverlay1: "sampleOverlay1",
		overlayWrapper: "overlayWrapper",
		sampleOverlay2: "sampleOverlay2",
		sampleOverlay3: "sampleOverlay3",
	},
}));

describe("CustomOverlay", () => {
	test("renders the CustomOverlay component correctly", () => {
		const { getByText, container } = render(<CustomOverlay />);

		expect(container.firstChild).toHaveClass("customOverlayContainer");
		expect(getByText("Sample Overlay1")).toBeInTheDocument();
		expect(getByText("Sample Overlay2")).toBeInTheDocument();
		expect(getByText("Sample Overlay3")).toBeInTheDocument();
	});

	test("applies the correct styles to the elements", () => {
		const { container } = render(<CustomOverlay />);

		const overlayContainer = container.firstChild;
		const overlayWrapper = container.querySelector(".overlayWrapper");
		const sampleOverlay1 = container.querySelector(".sampleOverlay1");
		const sampleOverlay2 = container.querySelector(".sampleOverlay2");
		const sampleOverlay3 = container.querySelector(".sampleOverlay3");

		expect(overlayContainer).toHaveClass("customOverlayContainer");
		expect(overlayWrapper).toHaveClass("overlayWrapper");
		expect(sampleOverlay1).toHaveClass("sampleOverlay1");
		expect(sampleOverlay2).toHaveClass("sampleOverlay2");
		expect(sampleOverlay3).toHaveClass("sampleOverlay3");
	});
});
