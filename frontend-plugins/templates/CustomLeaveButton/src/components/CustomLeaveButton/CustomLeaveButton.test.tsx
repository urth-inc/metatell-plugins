import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { CustomLeaveButton } from "./CustomLeaveButton";

vi.mock("../CustomLeaveModal", () => ({
	CustomLeaveModal: ({
		modalIsOpen,
		closeModal,
	}: {
		modalIsOpen: boolean;
		closeModal: () => void;
	}) => (
		<div
			data-testid="custom-leave-modal"
			style={{ display: modalIsOpen ? "block" : "none" }}
		>
			<button type="button" data-testid="close-button" onClick={closeModal}>
				Close
			</button>
		</div>
	),
}));

vi.mock("./SampleIcon", () => ({
	SampleIcon: () => <div data-testid="sample-icon">Sample Icon</div>,
}));

vi.mock("./CustomLeaveButton.module.scss", () => ({
	default: {
		customLeaveButtonContainer: "customLeaveButtonContainer",
		sampleIconContainer: "sampleIconContainer",
		customLeaveButtonLabel: "customLeaveButtonLabel",
	},
}));

describe("CustomLeaveButton", () => {
	it("should render the CustomLeaveButton component", () => {
		render(
			<CustomLeaveButton showDefaultModal={() => {}} destinationUrl="/test" />,
		);

		expect(screen.getByText("Leave")).toBeInTheDocument();
		expect(screen.getByRole("button")).toBeInTheDocument();
	});

	it("should open the modal when the button is clicked", () => {
		render(
			<CustomLeaveButton showDefaultModal={() => {}} destinationUrl="/test" />,
		);

		fireEvent.click(screen.getByRole("button"));
		expect(screen.getByTestId("custom-leave-modal")).toBeVisible();
	});

	it("should close the modal when close button in modal is clicked", () => {
		render(
			<CustomLeaveButton showDefaultModal={() => {}} destinationUrl="/test" />,
		);

		fireEvent.click(screen.getByRole("button"));
		fireEvent.click(screen.getByTestId("close-button"));
		expect(screen.queryByTestId("custom-leave-modal")).not.toBeVisible();
	});
});
