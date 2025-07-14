"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SplashScreen() {
  const { authenticated, user } = usePrivy();
  const router = useRouter();
  const [hasMinTimeElapsed, setHasMinTimeElapsed] = useState(false);

  // Set minimum display time (2.5 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasMinTimeElapsed(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Handle navigation only after both auth is determined AND minimum time has elapsed
  useEffect(() => {
    if (hasMinTimeElapsed && authenticated !== undefined) {
      if (authenticated && user) {
        router.push('/dashboard');
      } else {
        router.push('/auth');
      }
    }
  }, [authenticated, user, hasMinTimeElapsed, router]);

  return (
    <div className="bg-background h-dvh w-dvw flex flex-col items-center justify-center">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{
          scale: [1.1, 1.2, 1.05, 1.15, 1.1],
          opacity: 1,
        }}
        transition={{
          duration: 1.6,
          times: [0, 0.25, 0.5, 0.75, 1],
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
        }}
      >
        <Image
          src='/kaiko-orange-icon.svg'
          alt='Kaiko Icon'
          width={131}
          height={105}
          className="w-[50px] h-[50px]"
        />
      </motion.div>
      
      {/* Optional: Add loading indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-primary rounded-full"
              animate={{
                y: [0, -8, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}