import { fireEvent, render, screen } from 'solid-testing-library'
import userEvent from "@testing-library/user-event";
import { UPLOAD_CONSTANTS } from "../constants";

import FileUpload from "./FileUpload"

describe('<FileUpload />', () => {
  test("renders", () => {
    const { container, unmount } = render(() => (
      <FileUpload
        onFileChange={(e) => console.log("file changed")}
        onFileDropped={(e) => console.log("file dropped")}
        title={UPLOAD_CONSTANTS.UPLOAD_FORM_TITLE}
        description={UPLOAD_CONSTANTS.UPLOAD_FORM_DESC} />
    )
    )
    expect(container.innerHTML).toMatchSnapshot()
    unmount()
  }
  )

  test("Asks to select a file", () => {
    const { container, unmount } = render(() => (
      <FileUpload
        onFileChange={(e) => console.log("file changed")}
        onFileDropped={(e) => console.log("file dropped")}
        title={UPLOAD_CONSTANTS.UPLOAD_FORM_TITLE}
        description={UPLOAD_CONSTANTS.UPLOAD_FORM_DESC} />
    )
    )
    const visibleButtonText = [UPLOAD_CONSTANTS.FILE_SELECT, UPLOAD_CONSTANTS.FILE_SELECT_DRAG]
    visibleButtonText.forEach((t) => {
      const button = screen.getByText(t)
      expect(button).toBeInTheDocument();
    })
  })

  test("User  can upload file and click upload button", async () => {
    const user = userEvent.setup()
    const { container, unmount } = render(() => (
      <FileUpload
        onFileChange={(e) => console.log("file changed")}
        onFileDropped={(e) => console.log("file dropped")}
        title={UPLOAD_CONSTANTS.UPLOAD_FORM_TITLE}
        description={UPLOAD_CONSTANTS.UPLOAD_FORM_DESC} />
    ))


    const selectFileButton = screen.getByText(UPLOAD_CONSTANTS.FILE_SELECT)
    expect(selectFileButton).toBeInTheDocument();
    await user.click(selectFileButton)

    const input = screen.getByTitle("upload-input")

    const file = new File(['hello'], 'hello.png', { type: 'image/png' })
    await userEvent.upload(input, file)
    expect(input.files[0]).toBe(file)
    expect(input.files[1]).toBe(file2)
    expect(input.files.item(0)).toBe(file)

    const file1 = new File(['hello again'], 'hello.png', { type: 'image/png' })
    const file2 = new File(['goodbye'], 'hello.png', { type: 'image/png' })
    const files = [file1, file2]
    await userEvent.upload(input, files)
    expect(input.files).toHaveLength(2)
    expect(input.files[0]).toBe(file1)
    expect(input.files[1]).toBe(file2)
    expect(input.files.item(0)).toBe(file1)
    expect(input.files.item(1)).toBe(file2)

  })
})
