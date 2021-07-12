import { EOL } from "os";
import * as core from "@actions/core";
import * as system from "./os";
import * as versions from "./swift-versions";
import * as macos from "./macos-install";
import * as linux from "./linux-install";
import { getVersion } from "./get-version";

async function run() {
  try {
    const requestedVersion = core.getInput("swift-version", { required: true });

    let platform = await system.getSystem();
    let version = versions.verify(requestedVersion, platform);

    switch (platform.os) {
      case system.OS.MacOS:
        await macos.install(version, platform);
        break;
      case system.OS.Ubuntu:
        await linux.install(version, platform);
        break;
    }

    const finalCheckedVersion = (requestedVersion == "99.0" ? "Apple Swift version 5.5-dev (LLVM bfbe7824c6678f9, Swift 97033232b2807ca)" : version);

    const current = await getVersion();
    if (current === finalCheckedVersion) {
      core.setOutput("version", version);
    } else {
      core.error("Failed to setup requested swift version");
    }
  } catch (error) {
    let dump: String;
    if (error instanceof Error) {
      dump = `${error.message}${EOL}Stacktrace:${EOL}${error.stack}`;
    } else {
      dump = `${error}`;
    }

    core.setFailed(
      `Unexpected error, unable to continue. Please report at https://github.com/fwal/setup-swift/issues${EOL}${dump}`
    );
  }
}

run();
