import { useRouter } from "next/router";
import React from "react";

export default function IndexPage() {
  const router = useRouter();

  React.useEffect(() => {
    console.log("rerouting");
    router.push("/events");
  });
  return "Please wait...";
}
