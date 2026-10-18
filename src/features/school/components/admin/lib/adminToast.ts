import toast from "react-hot-toast";

// Charcoal and limestone from the UT palette; the icon takes the org primary
// (burnt orange for UT). Styled per toast so the app-wide Toaster is untouched.
const style = {
  background: "#333f48",
  color: "#d6d2c4",
  fontSize: "14px",
};

const iconTheme = {
  primary: "var(--org-primary, #bf5700)",
  secondary: "#d6d2c4",
};

export const adminToast = {
  success: (message: string) => toast.success(message, { style, iconTheme }),
  error: (message: string) => toast.error(message, { style }),
};
