import type { Metadata } from "next";
import { ChecklistClient } from "./ChecklistClient";

export const metadata: Metadata = {
  title: "Pre-Market Checklist — Trading Journal",
};

export default function ChecklistPage(): React.JSX.Element {
  return <ChecklistClient />;
}
