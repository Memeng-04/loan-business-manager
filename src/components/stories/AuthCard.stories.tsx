import type { Meta } from "@storybook/react";
import logoWhite from "../../assets/icons/192x192/lend-white.png";
import AuthCard from "../auth/AuthCard";
import styles from "../../pages/styles/AuthPage.module.css";

const meta = {
  title: "Components/AuthCard",
  component: AuthCard,
  parameters: {
    layout: "fullscreen",
    backgrounds: {
      default: "main-blue",
      values: [
        {
          name: "main-blue",
          value: "#012a6a",
        },
      ],
    },
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
  render: (args) => (
    <main className={styles.page}>
      <section className={styles.shell}>
        <div className={styles.layout}>
          <div className={styles.hero}>
            <img src={logoWhite} alt="LEND logo" className={styles.logo} />
            <p className={styles.tagline}>
              Lending Efficiency through Networked Data
            </p>
            <h1 className={styles.heading}>
              Because your business deserves better than a notebook.
            </h1>
          </div>

          <AuthCard {...args} />
        </div>
      </section>
    </main>
  ),
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
