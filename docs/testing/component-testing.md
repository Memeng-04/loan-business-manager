# Component & Storybook Testing

**Component Testing** verifies that UI elements render correctly and respond to user interactions. **Storybook** is used to develop and test components in isolation.

## Implementation in LEND

LEND utilizes Storybook for visual documentation and automated interaction tests using React Testing Library.

- **Tools:** Storybook, Vitest, React Testing Library
- **Location:** `src/components/stories/*.stories.tsx` and `src/components/**/*.test.tsx`
- **Command:** `npm run storybook` (interactive) or `npm run test` (headless)

## What we test

1.  **UI Components:** Testing buttons, inputs, and modals in various states (loading, error, disabled).
2.  **Complex Forms:** Verifying that input validation works for borrower registration and loan creation.
3.  **Visual States:** Ensuring "Add Borrower" and "Loan Details" components look correct across different themes or data inputs.

## Why we use it

1.  **Isolation:** We can build and test a "Loan Card" without having to log in or create a real loan.
2.  **Visual Documentation:** Storybook acts as a "living style guide" for teams to see all available UI components.
3.  **Interaction Testing:** Automated "Play" functions in Storybook simulate user clicks and typing to verify behavior.

## How we do it

We define "Stories" for each component that represent its different states.

### Storybook Example ([src/components/stories/ui/Button.stories.tsx](../../src/components/stories/ui/Button.stories.tsx))

```tsx
export const Primary: Story = {
  args: {
    children: "Submit Payment",
    variant: "primary",
  },
};

export const Loading: Story = {
  args: {
    children: "Processing...",
    isLoading: true,
  },
};
```

By isolating components, we ensure that changes to one part of the UI don't accidentally break others.
