import { PORT_LAYOUT_DEFAULT } from "../constants";
import { PortSpec } from "../types";

// Ports are fully static: every port's hex and connector geometry is fixed
// (see PORT_LAYOUT_DEFAULT). Only terrain and number tokens are randomized.
export function generatePorts(): PortSpec[] {
  return PORT_LAYOUT_DEFAULT.map((port) => ({ ...port }));
}
