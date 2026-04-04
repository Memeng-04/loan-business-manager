import type { Meta, StoryObj } from "@storybook/react";
import AddBorrowerForm from "../borrowers/AddBorrowerForm";

const meta = {
  title: "Components/AddBorrowerForm",
  component: AddBorrowerForm,
  parameters: {
    layout: "centered",
  },
  args: {
    onSubmit: async () => {},
    onCancel: () => {},
    loading: false,
    error: null,
  },
  render: (args) => (
    <div style={{ width: "min(860px, 94vw)" }}>
      <AddBorrowerForm {...args} />
    </div>
  ),
} satisfies Meta<typeof AddBorrowerForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithError: Story = {
  args: {
    error: "Failed to save borrower. Please try again.",
  },
};

export const Saving: Story = {
  args: {
    loading: true,
  },
};
