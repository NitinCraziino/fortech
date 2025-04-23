"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface FulfillOrdersDialogProps {
    isOpen: boolean;
    setOpen: (open: boolean) => void;
    selectedOrders: string[];
    onConfirm: (orderIds: string[]) => void;
    isLoading?: boolean;
}

export function FulfillOrdersDialog({
    isOpen,
    setOpen,
    selectedOrders,
    onConfirm,
    isLoading = false,
}: FulfillOrdersDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Fulfill Selected Orders</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to mark {selectedOrders.length} selected order{selectedOrders.length !== 1 ? 's' : ''} as fulfilled?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            onConfirm(selectedOrders);
                            setOpen(false);
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? "Processing..." : "Fulfill Orders"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}