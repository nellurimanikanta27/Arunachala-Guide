import { Redirect } from "expo-router";
import React from "react";

// Default landing is now the Local Guide (pilgrim-first).
// The previous dashboard is preserved as a hidden route at /(tabs)/home.
export default function Index() {
  return <Redirect href="/(tabs)/local-guide" />;
}
