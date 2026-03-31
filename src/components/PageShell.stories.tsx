import type { Meta } from "@storybook/react";
import PageShell from "./PageShell";

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
            <button className="w-1/2 rounded-lg bg-white px-4 py-2 text-main-blue font-semibold">
              Tab 1
            </button>
            <button className="w-1/2 rounded-lg border border-white px-4 py-2 text-white">
              Tab 2
            </button>
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
            <button className="w-full rounded-lg bg-white px-4 py-3 text-main-blue font-semibold">
              Submit
            </button>
          </form>
        </div>
      </div>
    </PageShell>
  ),
};

export const WithLongContent = {
  render: () => (
    <PageShell>
      <div className="mx-auto w-full max-w-3xl rounded-3xl bg-white/10 p-6 sm:p-8">
        <p className="text-sm text-blue-100">Dashboard</p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
          Welcome back
        </h1>
        <p className="mt-4 text-sm sm:text-base">
          This demonstrates a content card like the dashboard page.
        </p>

        <div className="mt-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/20 bg-white/5 p-4"
            >
              <p className="text-sm font-semibold">Item {i + 1}</p>
              <p className="mt-1 text-xs text-blue-100">
                Some additional details here
              </p>
            </div>
          ))}
        </div>

        <button className="mt-8 rounded-full bg-white px-6 py-3 text-base font-semibold text-main-blue">
          Action
        </button>
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
