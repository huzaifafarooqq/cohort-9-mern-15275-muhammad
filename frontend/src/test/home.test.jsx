import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Home from "../pages/Home/Home";
import axiosInstance from "../utils/axiosInstance";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => {
  const router = jest.requireActual("react-router-dom");

  return {
    ...router,
    useNavigate: () => mockNavigate,
  };
});

jest.mock("../utils/axiosInstance", () => ({
  get: jest.fn(),
  delete: jest.fn(),
  put: jest.fn(),
}));

jest.mock("../components/Navbar/Navbar", () => {
  return function MockNavbar() {
    return <div>Navbar</div>;
  };
});

jest.mock("../components/Cards/NoteCard", () => {
  return function MockNoteCard({ title }) {
    return <div>{title}</div>;
  };
});

jest.mock("../components/EmptyCard/EmptyCard", () => {
  return function MockEmptyCard({ message }) {
    return <div>{message}</div>;
  };
});

jest.mock("../pages/Home/AddEditNotes", () => {
  return function MockAddEditNotes() {
    return <div>Note Editor</div>;
  };
});

jest.mock("../components/ToastMessage/Toast", () => {
  return function MockToast({ isShown, message }) {
    return isShown ? <div>{message}</div> : null;
  };
});

jest.mock("react-modal", () => {
  return function MockModal({ isOpen, children, contentLabel }) {
    if (!isOpen) return null;

    return (
      <div role="dialog" aria-label={contentLabel}>
        {children}
      </div>
    );
  };
});

describe("Home page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    axiosInstance.get.mockImplementation((url) => {
      if (url === "/get-user") {
        return Promise.resolve({
          data: {
            user: {
              _id: "user-1",
              fullName: "Test User",
              email: "test@example.com",
            },
          },
        });
      }

      if (url === "/get-all-notes") {
        return Promise.resolve({
          data: {
            notes: [],
          },
        });
      }

      return Promise.resolve({ data: {} });
    });
  });

  test("loads the user and notes when the page opens", async () => {
    render(<Home />);

    await waitFor(() => {
      expect(axiosInstance.get).toHaveBeenCalledWith("/get-all-notes");
      expect(axiosInstance.get).toHaveBeenCalledWith("/get-user");
    });
  });

  test("shows the empty state when there are no notes", async () => {
    render(<Home />);

    expect(
      await screen.findByText(/Start creating your first note/i),
    ).toBeInTheDocument();
  });

  test("renders notes returned by the API", async () => {
    axiosInstance.get.mockImplementation((url) => {
      if (url === "/get-all-notes") {
        return Promise.resolve({
          data: {
            notes: [
              {
                _id: "note-1",
                title: "University Notes",
                content: "<p>Study material</p>",
                tags: ["study"],
                isPinned: false,
                noteColor: "success",
                createdOn: "2026-08-04",
              },
            ],
          },
        });
      }

      return Promise.resolve({
        data: {
          user: {
            _id: "user-1",
            fullName: "Test User",
          },
        },
      });
    });

    render(<Home />);

    expect(
      await screen.findByText("University Notes"),
    ).toBeInTheDocument();
  });

  test("opens the add-note modal", async () => {
    const user = userEvent.setup();

    render(<Home />);

    await user.click(
      screen.getByRole("button", {
        name: "Add note",
      }),
    );

    expect(
      screen.getByRole("dialog", {
        name: "Add note",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Note Editor")).toBeInTheDocument();
  });

  test("redirects to login when the user request is unauthorized", async () => {
    localStorage.setItem("token", "expired-token");

    axiosInstance.get.mockImplementation((url) => {
      if (url === "/get-user") {
        return Promise.reject({
          response: {
            status: 401,
          },
        });
      }

      return Promise.resolve({
        data: {
          notes: [],
        },
      });
    });

    render(<Home />);

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBeNull();
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });
});