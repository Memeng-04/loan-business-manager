import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import SearchBar from "../search/SearchBar";

const meta = {
  title: "Components/SearchBar",
  component: SearchBar,
  parameters: {
    layout: "centered",
  },
  args: {
    value: "",
    placeholder: "Search borrowers",
  },
  render: (args) => {
    const [value, setValue] = useState(args.value ?? "");

    return (
      <div style={{ width: "min(560px, 92vw)" }}>
        <SearchBar {...args} value={value} onChange={setValue} />
      </div>
    );
  },
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: {
    value: "Maria",
  },
};
