"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, className, action }: EmptyStateProps) {
  return (
    <Card className={`overflow-hidden border-dashed bg-muted/20 ${className || ""}`}>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 0.5,
          }}
          className="relative mb-6"
        >
          {/* Animated Background Blobs */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -inset-4 bg-primary/10 rounded-full blur-xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              rotate: [0, -90, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -inset-4 bg-orange-500/10 rounded-full blur-xl"
          />
          
          <div className="relative bg-background/50 backdrop-blur-sm p-4 rounded-full border border-border shadow-sm">
            <Icon className="h-8 w-8 text-primary" />
          </div>
        </motion.div>

        <motion.h3 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-xl font-semibold tracking-tight text-foreground"
        >
          {title}
        </motion.h3>
        
        <motion.p 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground mt-2 max-w-sm"
        >
          {description}
        </motion.p>

        {action && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            {action}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
