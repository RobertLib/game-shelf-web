import { renderWithProviders, screen } from "../../test-utils";
import { fireEvent } from "@testing-library/react";
import FileUpload from "../../../components/ui/file-upload";

// Mock crypto.randomUUID
Object.defineProperty(global.crypto, "randomUUID", {
  value: vi.fn(() => "mock-uuid"),
  writable: true,
});

describe.skip("FileUpload Component", () => {
  it("renders correctly with default props", () => {
    renderWithProviders(<FileUpload />);

    expect(screen.getByRole("button", { name: /nahrát/i })).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("renders label when provided", () => {
    const label = "Upload your file";
    renderWithProviders(<FileUpload label={label} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("renders default attachments", () => {
    const defaultAttachments = [
      {
        id: "1",
        blobSignedId: "signed-id-1",
        filename: "document.pdf",
        url: "https://example.com/document.pdf",
      },
    ];

    renderWithProviders(<FileUpload defaultAttachments={defaultAttachments} />);

    expect(screen.getByText("document.pdf")).toBeInTheDocument();
    const link = screen.getByText("document.pdf").closest("a");
    expect(link).toHaveAttribute("href", "https://example.com/document.pdf");
  });

  it("opens file dialog when upload button is clicked", () => {
    renderWithProviders(<FileUpload />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const clickSpy = vi.spyOn(fileInput, "click").mockImplementation(() => {});

    const uploadButton = screen.getByRole("button", { name: /nahrát/i });
    fireEvent.click(uploadButton);

    expect(clickSpy).toHaveBeenCalled();
  });

  it("removes file when delete button is clicked", () => {
    const defaultAttachments = [
      {
        id: "1",
        blobSignedId: "signed-id-1",
        filename: "document.pdf",
        url: "https://example.com/document.pdf",
      },
    ];

    renderWithProviders(<FileUpload defaultAttachments={defaultAttachments} />);

    expect(screen.getByText("document.pdf")).toBeInTheDocument();

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(screen.queryByText("document.pdf")).not.toBeInTheDocument();
  });

  it("generates hidden inputs for uploaded files", () => {
    const defaultAttachments = [
      {
        id: "1",
        blobSignedId: "signed-id-1",
        filename: "document.pdf",
      },
    ];

    renderWithProviders(
      <FileUpload name="attachments" defaultAttachments={defaultAttachments} />,
    );

    const hiddenInput = document.querySelector(
      'input[type="hidden"][name="attachments"]',
    ) as HTMLInputElement;

    expect(hiddenInput).toBeInTheDocument();
    expect(hiddenInput.value).toBe("signed-id-1");
  });

  it("shows upload button with correct text", () => {
    renderWithProviders(<FileUpload />);

    const uploadButton = screen.getByRole("button", { name: /nahrát/i });
    expect(uploadButton).toBeInTheDocument();
    expect(uploadButton).toHaveTextContent("Nahrát");
  });

  it("renders file input as hidden", () => {
    renderWithProviders(<FileUpload />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveStyle({ display: "none" });
  });

  it("displays multiple default attachments", () => {
    const defaultAttachments = [
      {
        id: "1",
        blobSignedId: "signed-id-1",
        filename: "document1.pdf",
        url: "https://example.com/document1.pdf",
      },
      {
        id: "2",
        blobSignedId: "signed-id-2",
        filename: "document2.txt",
        url: "https://example.com/document2.txt",
      },
    ];

    renderWithProviders(<FileUpload defaultAttachments={defaultAttachments} />);

    expect(screen.getByText("document1.pdf")).toBeInTheDocument();
    expect(screen.getByText("document2.txt")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /delete/i })).toHaveLength(2);
  });

  it("handles attachment without URL", () => {
    const defaultAttachments = [
      {
        id: "1",
        blobSignedId: "signed-id-1",
        filename: "document.pdf",
        url: null,
      },
    ];

    renderWithProviders(<FileUpload defaultAttachments={defaultAttachments} />);

    const link = screen.getByText("document.pdf").closest("a");
    expect(link).toHaveAttribute("href", "");
  });

  it("generates correct number of hidden inputs", () => {
    const defaultAttachments = [
      {
        id: "1",
        blobSignedId: "signed-id-1",
        filename: "document1.pdf",
      },
      {
        id: "2",
        blobSignedId: "signed-id-2",
        filename: "document2.txt",
      },
      {
        id: "3",
        blobSignedId: null, // This should not generate a hidden input
        filename: "document3.docx",
      },
    ];

    renderWithProviders(
      <FileUpload name="files" defaultAttachments={defaultAttachments} />,
    );

    const hiddenInputs = document.querySelectorAll(
      'input[type="hidden"][name="files"]',
    );

    // Only 2 hidden inputs should be generated (signed-id-1 and signed-id-2)
    expect(hiddenInputs).toHaveLength(2);
  });
});
