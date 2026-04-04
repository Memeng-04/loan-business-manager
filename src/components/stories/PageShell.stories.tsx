import type { Meta } from "@storybook/react";
import Button from "../Button";
import PageShell from "../PageShell";

const meta = {
  title: "Components/PageShell",
  component: PageShell,
  parameters: {
    layout: "fullscreen",
  },
  args: {},
} satisfies Meta<typeof PageShell>;

export default meta;

export const Default = {
  render: () => (
    <PageShell>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">Welcome</h1>
        <p className="text-lg">This is the default PageShell layout.</p>
      </div>
    </PageShell>
  ),
};

export const WithForm = {
  render: () => (
    <PageShell>
      <div className="mx-auto grid w-full max-w-5xl gap-8 md:grid-cols-2 md:items-center">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-semibold sm:text-4xl">Welcome</h1>
          <p className="mt-4 text-sm text-blue-100">
            This is an example of the auth page layout with logo and branding on
            the left.
          </p>
        </div>

        <div className="rounded-3xl bg-white/10 p-7 backdrop-blur-sm">
          <div className="mb-6 flex gap-2">
            <Button type="button" variant="white" size="md" className="mt-0 w-1/2">
              Tab 1
            </Button>
            <Button type="button" variant="outline" size="md" className="mt-0 w-1/2">
              Tab 2
            </Button>
          </div>

          <form className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm text-blue-100">Email</span>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-blue-100">Password</span>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white"
              />
            </label>
            <Button type="button" variant="white" size="md" className="mt-0 w-full">
              Submit
            </Button>
          </form>
        </div>
      </div>
    </PageShell>
  ),
};


export const Centered = {
  render: () => (
    <PageShell>
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Centered Content</h1>
        <p className="text-lg">
          PageShell centers content both horizontally and vertically.
        </p>
      </div>
    </PageShell>
  ),
};
