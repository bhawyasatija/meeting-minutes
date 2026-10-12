// Stand-in for the "server-only" package under tests. In the real app, Next.js's bundler
// swaps this import for a no-op on the server and makes it throw in a client bundle; outside
// that bundler (plain Node, which is what Vitest runs tests in), importing the real package
// always throws, since it has no way to know it's "on the server". Service files under test
// genuinely only ever run on the server, so this stub is accurate, not a workaround for a bug.
export {};
