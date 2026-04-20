import type { Meta, StoryObj } from "@storybook/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../../hooks/useAuth";
import ProfileOnboardingPage from "../../pages/onboarding/ProfileOnboardingPage";
import CapitalOnboardingPage from "../../pages/onboarding/CapitalOnboardingPage";
import { UserProfileRepository } from "../../repositories/UserProfileRepository";

import { ProfileProvider } from "../../contexts/ProfileContext";

UserProfileRepository.getByUserId = async () => null;

const mockAuthValue = {
  user: { id: "123", email: "test@example.com" } as any,
  session: {} as any,
  isLoading: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null, hasSession: true }),
  signOut: async () => ({ error: null }),
};

const meta: Meta = {
  title: "Pages/Onboarding",
  decorators: [
    (Story) => (
      <AuthContext.Provider value={mockAuthValue}>
        <ProfileProvider>
          <MemoryRouter>
            <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
               <Story />
            </div>
          </MemoryRouter>
        </ProfileProvider>
      </AuthContext.Provider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

export const Step1Profile: StoryObj = {
  render: () => <ProfileOnboardingPage />,
};

export const Step2Capital: StoryObj = {
  decorators: [
    (Story) => {
      // Initialize session storage for step 2
      sessionStorage.setItem("onboarding_profile_step", JSON.stringify({
        legal_full_name: "Juan Dela Cruz",
        display_name: "Juan"
      }));
      return <Story />;
    }
  ],
  render: () => <CapitalOnboardingPage />,
};
