import type { Meta } from "@storybook/react";
import AuthCard from "../auth/AuthCard";

const meta = {
  title: "Components/AuthCard",
  component: AuthCard,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    mode: "login",
    email: "",
    password: "",
    errorMessage: null,
    successMessage: null,
    isSubmitting: false,
    onModeChange: () => {},
    onEmailChange: () => {},
    onPasswordChange: () => {},
    onSubmit: (event) => {
      event.preventDefault();
    },
  },
} satisfies Meta<typeof AuthCard>;

export default meta;

export const Default = {
  args: {},
};

export const SignUpMode = {
  args: {
    mode: "signup",
  },
};

export const WithError = {
  args: {
    errorMessage: "Invalid email or password.",
  },
};

export const Submitting = {
  args: {
    isSubmitting: true,
  },
};
