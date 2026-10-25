import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.testoyun.roadmaster",
  appName: "RoadMaster Bus Empire",
  webDir: "dist",
  android: { allowMixedContent: false }
};

export default config;
