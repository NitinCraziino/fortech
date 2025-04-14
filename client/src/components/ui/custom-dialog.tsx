"use client";

import React, { ReactNode } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface CustomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: ReactNode;
}

const CustomDialog: React.FC<CustomDialogProps> = ({
  open,
  onOpenChange,
  content,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default CustomDialog;
