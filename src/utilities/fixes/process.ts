import { maybe } from "../common/maybe";
import global from "../common/global";

let needToUndo = false;

if (global && maybe(() => process.env.NODE_ENV) === void 0) {
  // Inherit from process and process.env, just in case they are defined.
  const stub = Object.create(maybe(() => process) || null);
  stub.env = Object.create(stub.env || null, {
    NODE_ENV: {
      // This default needs to be "production" instead of "development", to
      // avoid the problem https://github.com/graphql/graphql-js/pull/2894
      // will eventually solve, once merged.
      value: "production",
    },
  });

  try {
    Object.defineProperty(global, "process", {
      value: stub,
      // Let anyone else change global.process as they see fit, but hide it from
      // Object.keys(global) enumeration.
      configurable: true,
      enumerable: false,
      writable: true,
    });
  } catch {
    // If the global object is immutable, then we're out of luck, but we
    // shouldn't crash the application just because of that.
  }

  // We expect this to be true now.
  needToUndo = "process" in global;
}

export function undo() {
  if (needToUndo) {
    delete (global as any).process;
    needToUndo = false;
  }
}
