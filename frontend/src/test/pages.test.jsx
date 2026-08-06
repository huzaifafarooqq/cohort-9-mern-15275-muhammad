import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import Login from "../pages/Login/Login";
import SignUp from "../pages/SignUp/SignUp";
import AddEditNotes from "../pages/Home/AddEditNotes";
import axiosInstance from "../utils/axiosInstance";

const mockNavigate = jest.fn();

const mockEditor = {
  isEmpty: false,
  isActive: jest.fn(() => false),
  chain: jest.fn(() => ({
    focus: jest.fn(() => ({
      toggleBold: jest.fn(() => ({ run: jest.fn() })),
      toggleItalic: jest.fn(() => ({ run: jest.fn() })),
      toggleBulletList: jest.fn(() => ({ run: jest.fn() })),
      toggleOrderedList: jest.fn(() => ({ run: jest.fn() })),
    })),
  })),
};

jest.mock("react-router-dom", () => {
  const router = jest.requireActual("react-router-dom");

  return {
    ...router,
    useNavigate: () => mockNavigate,
  };
});

jest.mock("../components/Navbar/Navbar", () => {
  return function MockNavbar() {
    return <div>Navbar</div>;
  };
});

jest.mock("../utils/axiosInstance", () => ({
  post: jest.fn(),
  put: jest.fn(),
}));

jest.mock("@tiptap/react", () => ({
  useEditor: jest.fn(() => mockEditor),
  EditorContent: () => <div data-testid="note-editor" />,
}));

jest.mock("@tiptap/starter-kit", () => ({}));

const renderPage = (component) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  mockEditor.isEmpty = false;
});

describe("Login page", () => {
  test("shows an error for an invalid email", async () => {
    const user = userEvent.setup();

    renderPage(<Login />);

    await user.type(screen.getByPlaceholderText("Email"), "invalid-email");
    await user.type(screen.getByPlaceholderText("Password"), "123456");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(
      screen.getByText("Please enter a valid email address."),
    ).toBeInTheDocument();

    expect(axiosInstance.post).not.toHaveBeenCalled();
  });

  test("requires a password", async () => {
    const user = userEvent.setup();

    renderPage(<Login />);

    await user.type(
      screen.getByPlaceholderText("Email"),
      "test@example.com",
    );

    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(
      screen.getByText("Please enter the password"),
    ).toBeInTheDocument();
  });

  test("stores the token and opens the dashboard after login", async () => {
    const user = userEvent.setup();

    axiosInstance.post.mockResolvedValue({
      data: {
        accessToken: "login-token",
      },
    });

    renderPage(<Login />);

    await user.type(
      screen.getByPlaceholderText("Email"),
      "test@example.com",
    );
    await user.type(screen.getByPlaceholderText("Password"), "123456");
    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith("/login", {
        email: "test@example.com",
        password: "123456",
      });
    });

    expect(localStorage.getItem("token")).toBe("login-token");
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  test("shows the API error message when login fails", async () => {
    const user = userEvent.setup();

    axiosInstance.post.mockRejectedValue({
      response: {
        data: {
          message: "Invalid Credentials",
        },
      },
    });

    renderPage(<Login />);

    await user.type(
      screen.getByPlaceholderText("Email"),
      "test@example.com",
    );
    await user.type(screen.getByPlaceholderText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(
      await screen.findByText("Invalid Credentials"),
    ).toBeInTheDocument();
  });
});

describe("SignUp page", () => {
  test("requires the user's name", async () => {
    const user = userEvent.setup();

    renderPage(<SignUp />);

    await user.click(
      screen.getByRole("button", { name: "Create Account" }),
    );

    expect(
      screen.getByText("Please enter your name"),
    ).toBeInTheDocument();
  });

  test("shows an error when the account already exists", async () => {
    const user = userEvent.setup();

    axiosInstance.post.mockResolvedValue({
      data: {
        error: true,
        message: "User already exist",
      },
    });

    renderPage(<SignUp />);

    await user.type(screen.getByPlaceholderText("Name"), "Test User");
    await user.type(
      screen.getByPlaceholderText("Email"),
      "test@example.com",
    );
    await user.type(screen.getByPlaceholderText("Password"), "123456");

    await user.click(
      screen.getByRole("button", { name: "Create Account" }),
    );

    expect(
      await screen.findByText("User already exist"),
    ).toBeInTheDocument();
  });

  test("stores the token after successful registration", async () => {
    const user = userEvent.setup();

    axiosInstance.post.mockResolvedValue({
      data: {
        error: false,
        accessToken: "signup-token",
      },
    });

    renderPage(<SignUp />);

    await user.type(screen.getByPlaceholderText("Name"), "Test User");
    await user.type(
      screen.getByPlaceholderText("Email"),
      "test@example.com",
    );
    await user.type(screen.getByPlaceholderText("Password"), "123456");

    await user.click(
      screen.getByRole("button", { name: "Create Account" }),
    );

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/create-account",
        {
          fullName: "Test User",
          email: "test@example.com",
          password: "123456",
        },
      );
    });

    expect(localStorage.getItem("token")).toBe("signup-token");
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });
});

describe("AddEditNotes", () => {
  const defaultProps = {
    noteData: null,
    type: "add",
    getAllNotes: jest.fn(),
    onClose: jest.fn(),
    showToastMessage: jest.fn(),
  };

  test("requires a title", async () => {
    const user = userEvent.setup();

    render(<AddEditNotes {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "ADD" }));

    expect(
      screen.getByText("Please enter the title"),
    ).toBeInTheDocument();

    expect(axiosInstance.post).not.toHaveBeenCalled();
  });

  test("requires note content", async () => {
    const user = userEvent.setup();
    mockEditor.isEmpty = true;

    render(<AddEditNotes {...defaultProps} />);

    await user.type(
      screen.getByPlaceholderText("Enter note title"),
      "Test Note",
    );

    await user.click(screen.getByRole("button", { name: "ADD" }));

    expect(
      screen.getByText("Please enter the content"),
    ).toBeInTheDocument();
  });

  test("adds a new note successfully", async () => {
    const user = userEvent.setup();
    const getAllNotes = jest.fn();
    const onClose = jest.fn();
    const showToastMessage = jest.fn();

    axiosInstance.post.mockResolvedValue({
      data: {
        note: {
          _id: "note-1",
        },
      },
    });

    render(
      <AddEditNotes
        {...defaultProps}
        getAllNotes={getAllNotes}
        onClose={onClose}
        showToastMessage={showToastMessage}
      />,
    );

    await user.type(
      screen.getByPlaceholderText("Enter note title"),
      "Test Note",
    );

    await user.click(screen.getByRole("button", { name: "ADD" }));

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith("/add-note", {
        title: "Test Note",
        content: "",
        tags: [],
      });
    });

    expect(showToastMessage).toHaveBeenCalledWith(
      "Note Added Successfully",
      "add",
    );
    expect(getAllNotes).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  test("updates an existing note", async () => {
    const user = userEvent.setup();
    const getAllNotes = jest.fn();
    const onClose = jest.fn();
    const showToastMessage = jest.fn();

    axiosInstance.put.mockResolvedValue({
      data: {
        note: {
          _id: "note-1",
        },
      },
    });

    render(
      <AddEditNotes
        noteData={{
          _id: "note-1",
          title: "Existing Note",
          content: "<p>Existing content</p>",
          tags: ["study"],
        }}
        type="edit"
        getAllNotes={getAllNotes}
        onClose={onClose}
        showToastMessage={showToastMessage}
      />,
    );

    await user.click(screen.getByRole("button", { name: "UPDATE" }));

    await waitFor(() => {
      expect(axiosInstance.put).toHaveBeenCalledWith(
        "/edit-note/note-1",
        {
          title: "Existing Note",
          content: "<p>Existing content</p>",
          tags: ["study"],
        },
      );
    });

    expect(showToastMessage).toHaveBeenCalledWith(
      "Note Updated Successfully",
      "add",
    );
    expect(getAllNotes).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});