import { fireEvent, render } from 'solid-testing-library'

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

})
