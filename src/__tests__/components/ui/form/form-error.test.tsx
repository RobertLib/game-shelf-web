import { renderWithProviders, screen } from "../../../test-utils";
import FormError from "../../../../components/ui/form/form-error";

describe("FormError Component", () => {
  it("renders correctly with children", () => {
    renderWithProviders(<FormError>Error message</FormError>);

    const errorElement = screen.getByTestId("form-error");
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveTextContent("Error message");
  });

  it("does not render when children are empty", () => {
    renderWithProviders(<FormError></FormError>);
    expect(screen.queryByTestId("form-error")).not.toBeInTheDocument();
  });

  it("does not render when children are null", () => {
    renderWithProviders(<FormError>{null}</FormError>);
    expect(screen.queryByTestId("form-error")).not.toBeInTheDocument();
  });

  it("does not render when children are undefined", () => {
    renderWithProviders(<FormError>{undefined}</FormError>);
    expect(screen.queryByTestId("form-error")).not.toBeInTheDocument();
  });

  it("does not render when children are empty string", () => {
    renderWithProviders(<FormError>{""}</FormError>);
    expect(screen.queryByTestId("form-error")).not.toBeInTheDocument();
  });

  it("applies default CSS classes", () => {
    renderWithProviders(<FormError>Error message</FormError>);

    const errorElement = screen.getByTestId("form-error");
    expect(errorElement).toHaveClass("text-danger-600");
    expect(errorElement).toHaveClass("dark:text-danger-400");
    expect(errorElement).toHaveClass("animate-fade-in");
    expect(errorElement).toHaveClass("text-sm");
  });

  it("applies custom className", () => {
    renderWithProviders(
      <FormError className="custom-class">Error message</FormError>,
    );

    const errorElement = screen.getByTestId("form-error");
    expect(errorElement).toHaveClass("custom-class");
    expect(errorElement).toHaveClass("text-danger-600");
    expect(errorElement).toHaveClass("text-sm");
  });

  it("sets correct ARIA attributes", () => {
    renderWithProviders(<FormError>Error message</FormError>);

    const errorElement = screen.getByTestId("form-error");
    expect(errorElement).toHaveAttribute("role", "alert");
  });

  it("forwards additional props to div element", () => {
    renderWithProviders(
      <FormError id="custom-id" aria-describedby="field-id">
        Error message
      </FormError>,
    );

    const errorElement = screen.getByTestId("form-error");
    expect(errorElement).toHaveAttribute("id", "custom-id");
    expect(errorElement).toHaveAttribute("aria-describedby", "field-id");
  });

  it("renders with React elements as children", () => {
    renderWithProviders(
      <FormError>
        <span>This field is </span>
        <strong>required</strong>
      </FormError>,
    );

    const errorElement = screen.getByTestId("form-error");
    expect(errorElement).toBeInTheDocument();
    expect(screen.getByText("This field is")).toBeInTheDocument();
    expect(screen.getByText("required")).toBeInTheDocument();
  });

  it("renders with complex content", () => {
    renderWithProviders(
      <FormError>
        <div>
          <p>Multiple validation errors:</p>
          <ul>
            <li>Field is required</li>
            <li>Must be valid email</li>
          </ul>
        </div>
      </FormError>,
    );

    const errorElement = screen.getByTestId("form-error");
    expect(errorElement).toBeInTheDocument();
    expect(screen.getByText("Multiple validation errors:")).toBeInTheDocument();
    expect(screen.getByText("Field is required")).toBeInTheDocument();
    expect(screen.getByText("Must be valid email")).toBeInTheDocument();
  });

  it("renders whitespace-only children", () => {
    renderWithProviders(<FormError> </FormError>);

    const errorElement = screen.getByTestId("form-error");
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveTextContent("");
  });

  it("does not render number 0 children", () => {
    renderWithProviders(<FormError>{0}</FormError>);
    expect(screen.queryByTestId("form-error")).not.toBeInTheDocument();
  });

  it("renders non-zero number children", () => {
    renderWithProviders(<FormError>{42}</FormError>);

    const errorElement = screen.getByTestId("form-error");
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveTextContent("42");
  });

  it("renders boolean true children", () => {
    renderWithProviders(<FormError>{true}</FormError>);

    const errorElement = screen.getByTestId("form-error");
    expect(errorElement).toBeInTheDocument();
  });

  it("does not render boolean false children", () => {
    renderWithProviders(<FormError>{false}</FormError>);
    expect(screen.queryByTestId("form-error")).not.toBeInTheDocument();
  });

  it("renders array of elements as children", () => {
    const errors = ["Error 1", "Error 2", "Error 3"];
    renderWithProviders(
      <FormError>
        {errors.map((error, index) => (
          <div key={index}>{error}</div>
        ))}
      </FormError>,
    );

    const errorElement = screen.getByTestId("form-error");
    expect(errorElement).toBeInTheDocument();
    expect(screen.getByText("Error 1")).toBeInTheDocument();
    expect(screen.getByText("Error 2")).toBeInTheDocument();
    expect(screen.getByText("Error 3")).toBeInTheDocument();
  });

  it("maintains semantic structure", () => {
    renderWithProviders(<FormError>Validation error</FormError>);

    const errorElement = screen.getByRole("alert");
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveTextContent("Validation error");
  });
});
