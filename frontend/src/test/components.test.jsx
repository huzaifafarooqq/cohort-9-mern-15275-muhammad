import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import PasswordInput from "../components/Input/PasswordInput";
import TagInput from "../components/Input/TagInput";
import NoteCard from "../components/Cards/NoteCard";
import { validateEmail, getInitials } from "../utils/helper";

import SearchBar from "../components/SearchBar/SearchBar";
import ProfileInfo from "../components/Cards/ProfileInfo";
import Toast from "../components/ToastMessage/Toast";
import EmptyCard from "../components/EmptyCard/EmptyCard";

describe("Helper functions", () => {
  test("validates email addresses", () => {
    expect(validateEmail("user@example.com")).toBe(true);
    expect(validateEmail("invalid-email")).toBe(false);
  });

  test("returns initials from a name", () => {
    expect(getInitials("Test User")).toBe("TU");
    expect(getInitials("Huzaifa")).toBe("H");
    expect(getInitials("")).toBe("");
  });
});

describe("PasswordInput", () => {
  test("shows and hides the password", async () => {
    const user = userEvent.setup();

    const { container } = render(
      <PasswordInput value="secret123" onChange={jest.fn()} />,
    );

    const input = screen.getByPlaceholderText("Password");

    expect(input).toHaveAttribute("type", "password");

    await user.click(container.querySelector("svg"));

    expect(input).toHaveAttribute("type", "text");

    await user.click(container.querySelector("svg"));

    expect(input).toHaveAttribute("type", "password");
  });

  test("calls onChange when the password changes", () => {
    const onChange = jest.fn();

    render(<PasswordInput value="" onChange={onChange} />);

    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "new-password" },
    });

    expect(onChange).toHaveBeenCalled();
  });
});

describe("TagInput", () => {
  test("adds a tag using the add button", async () => {
    const user = userEvent.setup();
    const setTags = jest.fn();

    render(<TagInput tags={[]} setTags={setTags} />);

    await user.type(screen.getByPlaceholderText("Add tags"), "university");
    await user.click(screen.getByRole("button"));

    expect(setTags).toHaveBeenCalledWith(["university"]);
  });

  test("adds a tag by pressing Enter", async () => {
    const user = userEvent.setup();
    const setTags = jest.fn();

    render(<TagInput tags={[]} setTags={setTags} />);

    const input = screen.getByPlaceholderText("Add tags");

    await user.type(input, "project");
    await user.keyboard("{Enter}");

    expect(setTags).toHaveBeenCalledWith(["project"]);
  });

  test("removes a tag", async () => {
    const user = userEvent.setup();
    const setTags = jest.fn();

    render(<TagInput tags={["work", "study"]} setTags={setTags} />);

    const removeButtons = screen.getAllByRole("button");

    await user.click(removeButtons[0]);

    expect(setTags).toHaveBeenCalledWith(["study"]);
  });
});

describe("NoteCard", () => {
  const noteProps = {
    title: "Test Note",
    date: "2026-08-04",
    content: "<p>Note content</p>",
    tags: ["study"],
    isPinned: false,
    noteColor: "success",
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onPinNote: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("displays the note information", () => {
    render(<NoteCard {...noteProps} />);

    expect(screen.getByText("Test Note")).toBeInTheDocument();
    expect(screen.getByText("Note content")).toBeInTheDocument();
    expect(screen.getByText("#study")).toBeInTheDocument();
  });

  test("calls the note action handlers", async () => {
    const user = userEvent.setup();

    render(<NoteCard {...noteProps} />);

    await user.click(screen.getByRole("button", { name: "Pin note" }));
    await user.click(screen.getByRole("button", { name: "Edit note" }));
    await user.click(screen.getByRole("button", { name: "Delete note" }));

    expect(noteProps.onPinNote).toHaveBeenCalledTimes(1);
    expect(noteProps.onEdit).toHaveBeenCalledTimes(1);
    expect(noteProps.onDelete).toHaveBeenCalledTimes(1);
  });
});

describe("SearchBar", () => {
  test("calls search when Enter is pressed", () => {
    const handleSearch = jest.fn();

    render(
      <SearchBar
        value="project"
        onChange={jest.fn()}
        handleSearch={handleSearch}
        onClearSearch={jest.fn()}
      />,
    );

    fireEvent.keyDown(screen.getByPlaceholderText("Search Notes"), {
      key: "Enter",
    });

    expect(handleSearch).toHaveBeenCalledTimes(1);
  });

  test("calls clear search when the close icon is clicked", async () => {
    const user = userEvent.setup();
    const onClearSearch = jest.fn();

    const { container } = render(
      <SearchBar
        value="project"
        onChange={jest.fn()}
        handleSearch={jest.fn()}
        onClearSearch={onClearSearch}
      />,
    );

    const icons = container.querySelectorAll("svg");

    await user.click(icons[0]);

    expect(onClearSearch).toHaveBeenCalledTimes(1);
  });

  test("calls onChange when the input changes", () => {
    const onChange = jest.fn();

    render(
      <SearchBar
        value=""
        onChange={onChange}
        handleSearch={jest.fn()}
        onClearSearch={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Search Notes"), {
      target: { value: "university" },
    });

    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

describe("ProfileInfo", () => {
  test("shows the user's name and initials", () => {
    render(
      <ProfileInfo userInfo={{ fullName: "Test User" }} onLogout={jest.fn()} />,
    );

    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("TU")).toBeInTheDocument();
  });

  test("calls logout when clicked", async () => {
    const user = userEvent.setup();
    const onLogout = jest.fn();

    render(
      <ProfileInfo userInfo={{ fullName: "Test User" }} onLogout={onLogout} />,
    );

    await user.click(screen.getByRole("button", { name: "Logout" }));

    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});

describe("Toast", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  test("shows the message", () => {
    render(
      <Toast
        isShown={true}
        message="Note Added Successfully"
        type="add"
        onClose={jest.fn()}
      />,
    );

    expect(screen.getByText("Note Added Successfully")).toBeInTheDocument();
  });

  test("closes after three seconds", () => {
    jest.useFakeTimers();

    const onClose = jest.fn();

    render(
      <Toast
        isShown={true}
        message="Note Deleted Successfully"
        type="delete"
        onClose={onClose}
      />,
    );

    jest.advanceTimersByTime(3000);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("EmptyCard", () => {
  test("shows the image and message", () => {
    render(<EmptyCard imgSrc="empty-image.svg" message="No notes available" />);

    expect(screen.getByAltText("No notes")).toHaveAttribute(
      "src",
      "empty-image.svg",
    );

    expect(screen.getByText("No notes available")).toBeInTheDocument();
  });
});
