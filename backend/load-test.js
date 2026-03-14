import autocannon from "autocannon";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use localhost:6050 for development backend, or update this URL for different environments
const instance = autocannon(
  {
    url: "http://localhost:6050",
    connections: 100,
    pipelining: 10,
    duration: 30,
    requests: [
      {
        path: "/",
        method: "GET",
        weight: 10,
      },
      {
        path: "/api/messages/contacts",
        method: "GET",
        weight: 5,
      },
      {
        path: "/api/messages/chats",
        method: "GET",
        weight: 5,
      },
      {
        path: "/metrics",
        method: "GET",
        weight: 2,
      },
    ],
  },
  finishedBench,
);

autocannon.track(instance, { renderProgressBar: true });

function finishedBench(err, res) {
  if (err) {
    throw err;
  }

  console.log("\n=== Load Testing Complete ===\n");
  console.log("Results Summary:");
  console.log(`- Requests: ${res.requests.total}`);
  console.log(`- Throughput: ${Math.round(res.throughput.total)} bytes/sec`);
  console.log(`- Latency (avg): ${Math.round(res.latency.mean)}ms`);
  console.log(`- Latency (p99): ${Math.round(res.latency.p99)}ms`);
  console.log(`- Errors: ${res.errors}`);
  console.log(`- Timeouts: ${res.timeouts}`);
}
