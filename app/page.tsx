"use client";

import { Code } from "@heroui/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Home() {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.userAgent));
  }, []);

  const commands = isMac
    ? [
        { n: 3, cmd: "$imlost", label: "to get unstuck" },
        { n: 4, cmd: "$fixit", label: "to fix problems" },
        { n: 5, cmd: "$deploy", label: "to put it on the internet" },
      ]
    : [
        { n: 3, cmd: "$start", label: "to begin building" },
        { n: 4, cmd: "$imlost", label: "to get unstuck" },
        { n: 5, cmd: "$fixit", label: "to fix problems" },
        { n: 6, cmd: "$deploy", label: "to put it on the internet" },
      ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 p-8 bg-gradient-to-b from-amber-50/50 via-orange-50/30 to-background">
      <motion.div
        className="text-center flex flex-col items-center gap-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="text-6xl">☀️</div>
        <h1 className="font-[family-name:var(--font-manrope)] text-4xl sm:text-5xl font-bold tracking-tight text-zinc-800">
          makesomething
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        className="flex flex-col items-start gap-4 text-zinc-600"
      >
        <div className="flex items-start gap-3">
          <span className="text-zinc-400 font-mono text-sm w-5 text-right shrink-0 mt-0.5">1</span>
          <span>go back to your terminal</span>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-zinc-400 font-mono text-sm w-5 text-right shrink-0 mt-0.5">2</span>
          <span>sign in with your chatgpt account</span>
        </div>
        {commands.map((item) => (
          <div key={item.cmd} className="flex items-center gap-3">
            <span className="text-zinc-400 font-mono text-sm w-5 text-right shrink-0">{item.n}</span>
            <span>
              type{" "}
              <Code className="text-sm font-semibold bg-amber-50 text-amber-700">
                {item.cmd}
              </Code>{" "}
              {item.label}
            </span>
          </div>
        ))}
        <p className="text-zinc-400 text-sm mt-2">
          your progress tracker is in the top left — click it anytime
        </p>
      </motion.div>
    </div>
  );
}
