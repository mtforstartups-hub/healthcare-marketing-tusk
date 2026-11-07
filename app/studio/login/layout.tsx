import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Owner sign in | Marketing Tusk Healthcare",
  robots: { index: false, follow: false },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
