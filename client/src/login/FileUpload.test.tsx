import { fireEvent, render, screen } from "solid-testing-library";
import userEvent from "@testing-library/user-event";
import { UPLOAD_CONSTANTS } from "../constants";
import { getStorage } from "@sifrr/storage";

import FileUpload from "./FileUpload";

describe("<FileUpload />", () => {
  test("renders", () => {
    const { container, unmount } = render(() => (
      <FileUpload
        onFileChange={(e) => console.log("file changed")}
        onFileDropped={(e) => console.log("file dropped")}
        title={UPLOAD_CONSTANTS.UPLOAD_FORM_TITLE}
        description={UPLOAD_CONSTANTS.UPLOAD_FORM_DESC}
      />
    ));
    expect(container.innerHTML).toMatchSnapshot();
    unmount();
  });

  test("Asks to select a file", () => {
    const { container, unmount } = render(() => (
      <FileUpload
        onFileChange={(e) => console.log("file changed")}
        onFileDropped={(e) => console.log("file dropped")}
        title={UPLOAD_CONSTANTS.UPLOAD_FORM_TITLE}
        description={UPLOAD_CONSTANTS.UPLOAD_FORM_DESC}
      />
    ));
    const visibleButtonText = [
      UPLOAD_CONSTANTS.FILE_SELECT_DRAG,
    ];
    visibleButtonText.forEach((t) => {
      const button = screen.getByText(t);
      expect(button).toBeInTheDocument();
    });
  });

  test("User  can upload multiple files using the upload button", async () => {
    const user = userEvent.setup();
    const { container, unmount } = render(() => (
      <FileUpload
        onFileChange={(e) => console.log("file changed")}
        onFileDropped={(e) => console.log("file dropped")}
        title={UPLOAD_CONSTANTS.UPLOAD_FORM_TITLE}
        description={UPLOAD_CONSTANTS.UPLOAD_FORM_DESC}
      />
    ));

    const selectFileButton = screen.getByText(UPLOAD_CONSTANTS.FILE_SELECT_DRAG);
    expect(selectFileButton).toBeInTheDocument();
    await user.click(selectFileButton);

    const input = screen.getByTitle("upload-input");

    const file = new File(["hello"], "hello.png", { type: "image/png" });
    await userEvent.upload(input, file);
    expect(input.files[0]).toBe(file);
    expect(input.files[1]).toBe(file2);
    expect(input.files.item(0)).toBe(file);

    const file1 = new File(["hello again"], "hello.png", { type: "image/png" });
    const file2 = new File(["goodbye"], "hello.png", { type: "image/png" });
    const files = [file1, file2];
    await userEvent.upload(input, files);
    expect(input.files).toHaveLength(2);
    expect(input.files[0]).toBe(file1);
    expect(input.files[1]).toBe(file2);
    expect(input.files.item(0)).toBe(file1);
    expect(input.files.item(1)).toBe(file2);
  });

  // test("User can drag and drop files to upload, and cancel an upload", async () => {
  //   const user = userEvent.setup();
  //   const { container, unmount } = render(() => <ExportWizard />);

  //   const draggedFile = new File(["(⌐□_□)"], "cool.png", { type: "image/png" });

  //   const input = screen.getByTitle("upload-input");
  //   const dragText = screen.getByText(UPLOAD_CONSTANTS.FILE_SELECT_DRAG);

  //   fireEvent.drop(screen.getByTitle("upload-box"), {
  //     dataTransfer: {
  //       files: [draggedFile],
  //     },
  //   });

  //   expect(dragText).not.toBeInTheDocument();

  //   // check if cancel removes our cancel button
  //   const cancelButton = screen.getByText(/cancel/i);
  //   await user.click(cancelButton);
  //   expect(cancelButton).not.toBeInTheDocument();
  // });
});
