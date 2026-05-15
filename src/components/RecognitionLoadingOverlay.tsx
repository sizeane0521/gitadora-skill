import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ScanLine } from "lucide-react";

interface Props {
  visible: boolean;
}

export default function RecognitionLoadingOverlay({ visible }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md flex flex-col items-center justify-center gap-4"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center"
          >
            <ScanLine size={32} className="text-primary" />
          </motion.div>

          <div className="flex items-center gap-2">
            <Loader2 size={16} className="animate-spin text-primary" />
            <span className="font-display font-semibold text-sm text-foreground tracking-wide">
              AI 辨識結算畫面中...
            </span>
          </div>

          <p className="text-xs font-body text-muted-foreground">
            請稍候，正在分析圖片
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
