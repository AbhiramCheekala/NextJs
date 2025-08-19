import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/login");
  return null; // Or a loading component if preferred before redirect
}
