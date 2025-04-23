"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type Props = {
    isOpen: boolean;
    setOpen: (open: boolean) => void;
    onConfirm: () => Promise<void>;
};

export function ConfirmDeleteOrder({
    isOpen,
    setOpen,
    onConfirm,
}: Props) {
    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Fulfill Selected Orders</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to Delete the selected Order. This action can't be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            onConfirm();
                            setOpen(false);
                        }}
                    >
                        Delete Order
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}