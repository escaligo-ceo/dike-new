export function getDefaultPort(protocol: string): number {
  switch (protocol) {
    case "http":
      return 80;
    case "https":
      return 443;
    default:
      throw new Error(`Unsupported protocol: ${protocol}`);
  }
}
