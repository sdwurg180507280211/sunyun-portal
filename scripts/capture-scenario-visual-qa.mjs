import {spawn} from "node:child_process";
import {mkdtemp, mkdir, readFile, rm, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";

const baseUrl = process.argv[2] || "http://127.0.0.1:8081";
const outputDir = process.argv[3] || "visual-qa";
const chromeBinary = process.env.CHROME_BIN || "google-chrome";
const captures = [
  {name: "1440x1000", width: 1440, height: 1000, reducedMotion: false},
  {name: "1280x800", width: 1280, height: 800, reducedMotion: false},
  {name: "1024x768", width: 1024, height: 768, reducedMotion: false},
  {name: "768x1024", width: 768, height: 1024, reducedMotion: false},
  {name: "390x844", width: 390, height: 844, reducedMotion: false},
  {name: "375x667", width: 375, height: 667, reducedMotion: false},
  {name: "1440x1000-reduced-motion", width: 1440, height: 1000, reducedMotion: true},
];

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const userDataDir = await mkdtemp(join(tmpdir(), "yunyihui-chrome-"));
const devToolsPortFile = join(userDataDir, "DevToolsActivePort");
await mkdir(outputDir, {recursive: true});

const chrome = spawn(
  chromeBinary,
  [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--hide-scrollbars",
    "--remote-debugging-port=0",
    `--user-data-dir=${userDataDir}`,
    "about:blank",
  ],
  {stdio: ["ignore", "ignore", "pipe"]},
);

let chromeError = "";
let chromeSpawnError;
chrome.stderr.setEncoding("utf8");
chrome.stderr.on("data", (chunk) => {
  chromeError += chunk;
});
chrome.on("error", (error) => {
  chromeSpawnError = error;
});

async function waitForDebugPort() {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (chromeSpawnError) {
      throw new Error(`Chrome could not start: ${chromeSpawnError.message}`);
    }
    if (chrome.exitCode !== null) {
      throw new Error(`Chrome exited before DevTools became ready (code ${chrome.exitCode}).\n${chromeError}`);
    }
    try {
      const [portLine] = (await readFile(devToolsPortFile, "utf8")).trim().split(/\r?\n/);
      const port = Number(portLine);
      if (Number.isInteger(port) && port > 0) return port;
    } catch {
      // Chrome has not written its assigned DevTools port yet.
    }
    await sleep(100);
  }
  throw new Error(`Chrome did not publish DevToolsActivePort.\n${chromeError}`);
}

const debugPort = await waitForDebugPort();

async function waitForTarget() {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (chromeSpawnError) {
      throw new Error(`Chrome could not start: ${chromeSpawnError.message}`);
    }
    if (chrome.exitCode !== null) {
      throw new Error(`Chrome exited before a page target became ready (code ${chrome.exitCode}).\n${chromeError}`);
    }
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
      const targets = await response.json();
      const page = targets.find((target) => target.type === "page");
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      // Chrome DevTools is still starting.
    }
    await sleep(100);
  }
  throw new Error(`Chrome DevTools target did not become ready.\n${chromeError}`);
}

const webSocketUrl = await waitForTarget();
const socket = new WebSocket(webSocketUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, {once: true});
  socket.addEventListener("error", reject, {once: true});
});

let commandId = 0;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (!message.id) return;
  const request = pending.get(message.id);
  if (!request) return;
  pending.delete(message.id);
  if (message.error) request.reject(new Error(`${request.method}: ${message.error.message}`));
  else request.resolve(message.result);
});

function send(method, params = {}) {
  const id = ++commandId;
  return new Promise((resolve, reject) => {
    pending.set(id, {method, resolve, reject});
    socket.send(JSON.stringify({id, method, params}));
  });
}

async function waitForDocument() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const {result} = await send("Runtime.evaluate", {
      expression: "document.readyState === 'complete' && Boolean(document.getElementById('scenarios'))",
      returnByValue: true,
    });
    if (result.value === true) return;
    await sleep(100);
  }
  const {result} = await send("Runtime.evaluate", {
    expression:
      "JSON.stringify({href: location.href, readyState: document.readyState, body: document.body?.innerText?.slice(0, 160)})",
    returnByValue: true,
  });
  throw new Error(`Scenario section did not become ready: ${result.value}`);
}

async function waitForScenarioReveal() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const {result} = await send("Runtime.evaluate", {
      expression: `(() => {
        const elements = Array.from(document.querySelectorAll("#scenarios .reveal"));
        return elements.length > 0 && elements.every((element) => element.dataset.state === "visible");
      })()`,
      returnByValue: true,
    });
    if (result.value === true) {
      await send("Runtime.evaluate", {
        expression: `Promise.all(
          Array.from(document.getElementById("scenarios").getAnimations({subtree: true})).map((animation) =>
            animation.finished.catch(() => undefined),
          ),
        )`,
        awaitPromise: true,
      });
      return;
    }
    await sleep(100);
  }

  const {result} = await send("Runtime.evaluate", {
    expression: `JSON.stringify(
      Array.from(document.querySelectorAll("#scenarios .reveal")).map((element) => ({
        state: element.dataset.state,
        opacity: getComputedStyle(element).opacity,
      })),
    )`,
    returnByValue: true,
  });
  throw new Error(`Scenario Reveal elements did not become visible: ${result.value}`);
}

async function stopChrome(signal) {
  if (chrome.exitCode !== null) return;
  const exited = new Promise((resolve) => chrome.once("exit", resolve));
  chrome.kill(signal);
  await Promise.race([exited, sleep(2_000)]);
}

try {
  await send("Page.enable");
  await send("Runtime.enable");

  for (const capture of captures) {
    await send("Emulation.setDeviceMetricsOverride", {
      width: capture.width,
      height: capture.height,
      deviceScaleFactor: 1,
      mobile: capture.width < 768,
    });
    await send("Emulation.setEmulatedMedia", {
      media: "screen",
      features: [
        {
          name: "prefers-reduced-motion",
          value: capture.reducedMotion ? "reduce" : "no-preference",
        },
      ],
    });
    const navigation = await send("Page.navigate", {url: `${baseUrl}/`});
    if (navigation.errorText) {
      throw new Error(`${capture.name}: navigation failed: ${navigation.errorText}`);
    }
    await waitForDocument();
    await send("Runtime.evaluate", {
      expression: "document.fonts?.ready ?? Promise.resolve()",
      awaitPromise: true,
    });
    await send("Runtime.evaluate", {
      expression: `(() => {
        document.documentElement.style.scrollBehavior = "auto";
        const target = document.getElementById("scenarios");
        const top = window.scrollY + target.getBoundingClientRect().top - 80;
        window.scrollTo({top, left: 0, behavior: "auto"});
      })()`,
    });
    await send("Runtime.evaluate", {
      expression: "new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))",
      awaitPromise: true,
    });
    await waitForScenarioReveal();

    const {result: metricsResult} = await send("Runtime.evaluate", {
      expression: `JSON.stringify({
        scrollY: window.scrollY,
        targetTop: document.getElementById("scenarios").getBoundingClientRect().top,
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth
      })`,
      returnByValue: true,
    });
    const metrics = JSON.parse(metricsResult.value);
    if (Math.abs(metrics.targetTop - 80) > 4) {
      throw new Error(`${capture.name}: scenario anchor is at ${metrics.targetTop}px instead of 80px`);
    }
    if (metrics.scrollWidth > metrics.viewportWidth + 1) {
      throw new Error(
        `${capture.name}: horizontal overflow (${metrics.scrollWidth}px document vs ${metrics.viewportWidth}px viewport)`,
      );
    }

    const {data} = await send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: false,
    });
    const image = Buffer.from(data, "base64");
    if (image.length < 15_000) {
      throw new Error(`${capture.name}: screenshot is unexpectedly small (${image.length} bytes)`);
    }
    await writeFile(join(outputDir, `${capture.name}.png`), image);
    console.log(
      `${capture.name}: ${capture.width}x${capture.height}, scrollY=${metrics.scrollY}, ${image.length} bytes`,
    );
  }
} finally {
  socket.close();
  await stopChrome("SIGTERM");
  if (chrome.exitCode === null) await stopChrome("SIGKILL");
  await rm(userDataDir, {recursive: true, force: true, maxRetries: 5, retryDelay: 100});
}
