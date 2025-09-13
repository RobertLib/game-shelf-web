import { renderWithProviders, screen } from "../../test-utils";
import { Settings, Upload, User } from "lucide-react";
import { userEvent } from "@testing-library/user-event";
import Stepper, { type StepperStep } from "../../../components/ui/stepper";

describe("Stepper Component", () => {
  const mockSteps: StepperStep[] = [
    {
      id: "step1",
      title: "User Information",
      icon: User,
    },
    {
      id: "step2",
      title: "Settings",
      icon: Settings,
    },
    {
      id: "step3",
      title: "Upload Files",
      icon: Upload,
    },
  ];

  const defaultProps = {
    steps: mockSteps,
    currentStepId: "step1",
  };

  it("renders correctly with default props", () => {
    renderWithProviders(<Stepper {...defaultProps} />);

    expect(screen.getByTitle("User Information")).toBeInTheDocument();
    expect(screen.getByTitle("Settings")).toBeInTheDocument();
    expect(screen.getByTitle("Upload Files")).toBeInTheDocument();
  });

  it("highlights the current step correctly", () => {
    renderWithProviders(<Stepper {...defaultProps} currentStepId="step2" />);

    const settingsStep = screen.getByTitle("Settings");
    expect(settingsStep).toHaveClass(
      "border-primary-500",
      "bg-primary-500",
      "scale-110",
    );
  });

  it("shows completed steps correctly", () => {
    renderWithProviders(<Stepper {...defaultProps} currentStepId="step3" />);

    const userStep = screen.getByTitle("User Information");
    const settingsStep = screen.getByTitle("Settings");

    expect(userStep).toHaveClass("border-primary-500", "bg-primary-500");
    expect(settingsStep).toHaveClass("border-primary-500", "bg-primary-500");
  });

  it("shows error state correctly", () => {
    const stepsWithError: StepperStep[] = [
      ...mockSteps.slice(0, 1),
      { ...mockSteps[1], hasError: true },
      ...mockSteps.slice(2),
    ];

    renderWithProviders(
      <Stepper steps={stepsWithError} currentStepId="step2" />,
    );

    const errorStep = screen.getByTitle("Settings");
    expect(errorStep).toHaveClass("border-danger-500", "bg-danger-500");
  });

  it("shows completed step with error state", () => {
    const stepsWithError: StepperStep[] = [
      { ...mockSteps[0], hasError: true },
      ...mockSteps.slice(1),
    ];

    renderWithProviders(
      <Stepper steps={stepsWithError} currentStepId="step2" />,
    );

    const errorStep = screen.getByTitle("User Information");
    expect(errorStep).toHaveClass("border-danger-500", "bg-danger-500");
  });

  it("handles step click correctly", async () => {
    const user = userEvent.setup();
    const mockOnStepClick = vi.fn();

    renderWithProviders(
      <Stepper {...defaultProps} onStepClick={mockOnStepClick} />,
    );

    const settingsStep = screen.getByTitle("Settings");
    await user.click(settingsStep);

    expect(mockOnStepClick).toHaveBeenCalledWith("step2");
  });

  it("respects isClickable property", async () => {
    const user = userEvent.setup();
    const mockOnStepClick = vi.fn();
    const stepsWithNonClickable: StepperStep[] = [
      ...mockSteps.slice(0, 1),
      { ...mockSteps[1], isClickable: false },
      ...mockSteps.slice(2),
    ];

    renderWithProviders(
      <Stepper
        steps={stepsWithNonClickable}
        currentStepId="step1"
        onStepClick={mockOnStepClick}
      />,
    );

    const nonClickableStep = screen.getByTitle("Settings");
    expect(nonClickableStep).toHaveClass("cursor-not-allowed");
    expect(nonClickableStep).toBeDisabled();

    await user.click(nonClickableStep);
    expect(mockOnStepClick).not.toHaveBeenCalled();
  });

  it("shows custom isCompleted state", () => {
    const stepsWithCustomCompletion: StepperStep[] = [
      { ...mockSteps[0], isCompleted: true },
      ...mockSteps.slice(1),
    ];

    renderWithProviders(
      <Stepper steps={stepsWithCustomCompletion} currentStepId="step1" />,
    );

    const completedStep = screen.getByTitle("User Information");
    expect(completedStep).toHaveClass("border-primary-500", "bg-primary-500");
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(
      <Stepper {...defaultProps} className="custom-stepper-class" />,
    );

    const stepperContainer = container.firstChild as HTMLElement;
    expect(stepperContainer).toHaveClass("custom-stepper-class");
  });

  it("shows connecting lines between steps", () => {
    renderWithProviders(<Stepper {...defaultProps} />);

    const connectingLines = screen
      .getAllByRole("generic")
      .filter((el) => el.className.includes("border-dashed"));
    expect(connectingLines).toHaveLength(2);
  });

  it("styles connecting lines based on completion state", () => {
    renderWithProviders(<Stepper {...defaultProps} currentStepId="step3" />);

    const connectingLines = screen
      .getAllByRole("generic")
      .filter((el) => el.className.includes("border-dashed"));

    expect(connectingLines[0]).toHaveClass("border-primary-500");
    expect(connectingLines[1]).toHaveClass("border-primary-500");
  });

  it("shows pulse animation on active step", () => {
    renderWithProviders(<Stepper {...defaultProps} currentStepId="step2" />);

    const activeStep = screen.getByTitle("Settings");
    const pulseElement = activeStep.querySelector(".animate-pulse");
    expect(pulseElement).toBeInTheDocument();
    expect(pulseElement).toHaveClass("border-primary-200");
  });

  it("shows error pulse animation on active step with error", () => {
    const stepsWithError: StepperStep[] = [
      ...mockSteps.slice(0, 1),
      { ...mockSteps[1], hasError: true },
      ...mockSteps.slice(2),
    ];

    renderWithProviders(
      <Stepper steps={stepsWithError} currentStepId="step2" />,
    );

    const activeErrorStep = screen.getByTitle("Settings");
    const pulseElement = activeErrorStep.querySelector(".animate-pulse");
    expect(pulseElement).toBeInTheDocument();
    expect(pulseElement).toHaveClass("border-danger-200");
  });

  it("handles string and number IDs correctly", async () => {
    const user = userEvent.setup();
    const mockOnStepClick = vi.fn();
    const stepsWithNumberIds: StepperStep[] = [
      { id: 1, title: "Step 1", icon: User },
      { id: 2, title: "Step 2", icon: Settings },
      { id: 3, title: "Step 3", icon: Upload },
    ];

    renderWithProviders(
      <Stepper
        steps={stepsWithNumberIds}
        currentStepId={2}
        onStepClick={mockOnStepClick}
      />,
    );

    const step3 = screen.getByTitle("Step 3");
    await user.click(step3);

    expect(mockOnStepClick).toHaveBeenCalledWith(3);
  });

  it("handles hover effects on clickable steps", () => {
    renderWithProviders(<Stepper {...defaultProps} />);

    const clickableStep = screen.getByTitle("Settings");
    expect(clickableStep).toHaveClass("cursor-pointer", "hover:scale-105");
  });

  it("renders without onStepClick handler", () => {
    renderWithProviders(<Stepper {...defaultProps} />);

    expect(screen.getByTitle("User Information")).toBeInTheDocument();
  });
});
