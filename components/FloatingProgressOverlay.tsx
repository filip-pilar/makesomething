"use client";

import { useState, useEffect, useRef } from "react";
import { Progress, Chip } from "@heroui/react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

const MILESTONES = [
  { key: "idea_locked", label: "idea locked", detail: "you know what you're building" },
  { key: "first_screen", label: "first screen", detail: "something real on the page" },
  { key: "features_added", label: "features added", detail: "it does things now" },
  { key: "deployed", label: "deployed", detail: "live on the internet" },
  { key: "shared", label: "shared", detail: "someone else has seen it" },
];

type MilestoneData = Record<string, boolean>;

// ── telemetry ──
const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdrKNy2xgnBInqPnilIKEOS19N-NC97X-B6NJBQcYPsQrdzHA/formResponse";
const FIELD_IDS = {
  name: "entry.408315530",
  email: "entry.753362713",
  milestone: "entry.524929387",
  timestamp: "entry.1027284314",
} as const;

function sendMilestoneEvent(name: string, email: string, milestone: string) {
  const body = new URLSearchParams({
    [FIELD_IDS.name]: name,
    [FIELD_IDS.email]: email,
    [FIELD_IDS.milestone]: milestone,
    [FIELD_IDS.timestamp]: new Date().toISOString(),
  });
  fetch(FORM_URL, { method: "POST", body, mode: "no-cors" }).catch(() => {});
}

function computeCurrentStep(data: MilestoneData): number {
  for (let i = 0; i < MILESTONES.length; i++) {
    if (!data[MILESTONES[i].key]) return i + 1;
  }
  return MILESTONES.length + 1; // all done — past the last step
}

// ── dev-only guard ──
export default function FloatingProgressOverlay() {
  if (process.env.NODE_ENV === "production") return null;

  const [expanded, setExpanded] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState(1);
  const prevMilestones = useRef<MilestoneData>({});
  const isFirstPoll = useRef(true);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    const fetchMilestones = () => {
      fetch("/milestones.json")
        .then((res) => {
          if (!res.ok) throw new Error("not found");
          return res.json();
        })
        .then((raw: Record<string, unknown>) => {
          const data: MilestoneData = {};
          for (const m of MILESTONES) data[m.key] = raw[m.key] === true;

          // send telemetry for newly completed milestones (skip first poll to avoid re-sends on refresh)
          if (!isFirstPoll.current) {
            const newMilestones = MILESTONES.filter(
              (m) => data[m.key] && !prevMilestones.current[m.key]
            );
            if (newMilestones.length > 0) {
              fetch("/api/userinfo")
                .then((res) => (res.ok ? res.json() : { name: "", email: "" }))
                .then((info: { name: string; email: string }) => {
                  for (const m of newMilestones) {
                    sendMilestoneEvent(info.name, info.email, m.key);
                  }
                })
                .catch(() => {});
            }
          }
          prevMilestones.current = data;
          isFirstPoll.current = false;

          setCurrentMilestone(computeCurrentStep(data));
        })
        .catch(() => {
          // file doesn't exist yet — default to step 1
          setCurrentMilestone(1);
        });
    };

    fetchMilestones();
    timer = setInterval(fetchMilestones, 5000);

    return () => clearInterval(timer);
  }, []);

  const completedCount = currentMilestone - 1; // step 1 = 0 done, step 6 = 5 done
  const pct = Math.round((completedCount / MILESTONES.length) * 100);

  return (
    <>
      {/* click-away backdrop when expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="fixed inset-0 z-[9998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpanded(false)}
          />
        )}
      </AnimatePresence>

      <LayoutGroup>
        <motion.div
          layout
          onClick={() => !expanded && setExpanded(true)}
          className={`fixed top-5 left-5 z-[9999] border border-zinc-200/60 ${
            expanded
              ? "w-72 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-5"
              : "bg-white/90 backdrop-blur rounded-full shadow-lg px-4 py-2.5 cursor-pointer hover:shadow-xl"
          }`}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          {!expanded ? (
            /* ── collapsed pill contents ── */
            <motion.div
              className="flex items-center gap-2.5"
              initial={false}
              animate={{ opacity: 1 }}
              key="pill-inner"
            >
              {/* amber dot */}
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
              </span>

              <span className="font-[family-name:var(--font-manrope)] text-sm font-semibold text-zinc-700">
                step {Math.min(currentMilestone, MILESTONES.length)} of {MILESTONES.length}
              </span>

              <Progress
                size="sm"
                value={pct}
                className="w-16"
                classNames={{
                  indicator: "bg-amber-500",
                  track: "bg-amber-100",
                }}
                aria-label="progress"
              />
            </motion.div>
          ) : (
            /* ── expanded card contents ── */
            <motion.div
              key="card-inner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.2 }}
            >
              {/* header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-[family-name:var(--font-manrope)] text-sm font-bold text-zinc-800">
                  your progress
                </h3>
                <button
                  onClick={() => setExpanded(false)}
                  className="text-zinc-400 hover:text-zinc-600 transition-colors text-lg leading-none cursor-pointer"
                  aria-label="close"
                >
                  &times;
                </button>
              </div>

              {/* timeline */}
              <div className="flex flex-col gap-0">
                {MILESTONES.map((m, i) => {
                  const step = i + 1;
                  const isCompleted = step < currentMilestone;
                  const isCurrent = step === currentMilestone;
                  const isLast = i === MILESTONES.length - 1;

                  return (
                    <motion.div
                      key={step}
                      className="flex gap-3"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.1 + 0.05 * i,
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                    >
                      {/* dot + connector line */}
                      <div className="flex flex-col items-center">
                        {isCompleted ? (
                          <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shrink-0 mt-0.5" />
                        ) : isCurrent ? (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-500 shrink-0 mt-0.5 flex items-center justify-center">
                            <span className="block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          </div>
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-300 shrink-0 mt-0.5" />
                        )}
                        {!isLast && (
                          <div
                            className={`w-0.5 flex-1 min-h-4 ${
                              isCompleted ? "bg-amber-500" : "bg-zinc-200"
                            }`}
                          />
                        )}
                      </div>

                      {/* text */}
                      <div className={`pb-3 ${isLast ? "pb-0" : ""}`}>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-sm font-medium ${
                              isCompleted || isCurrent
                                ? "text-zinc-800"
                                : "text-zinc-400"
                            }`}
                          >
                            {m.label}
                          </span>
                          {isCurrent && (
                            <Chip
                              size="sm"
                              variant="flat"
                              classNames={{
                                base: "bg-amber-50 h-5 px-1.5",
                                content:
                                  "text-amber-700 text-[10px] font-semibold px-0",
                              }}
                            >
                              now
                            </Chip>
                          )}
                        </div>
                        <p
                          className={`text-xs mt-0.5 ${
                            isCompleted || isCurrent
                              ? "text-zinc-500"
                              : "text-zinc-300"
                          }`}
                        >
                          {m.detail}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* bottom progress bar */}
              <div className="mt-4 pt-3 border-t border-zinc-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-zinc-400">{pct}% complete</span>
                </div>
                <Progress
                  size="sm"
                  value={pct}
                  className="w-full"
                  classNames={{
                    indicator: "bg-amber-500",
                    track: "bg-amber-100",
                  }}
                  aria-label="overall progress"
                />
              </div>
            </motion.div>
          )}
        </motion.div>
      </LayoutGroup>
    </>
  );
}
