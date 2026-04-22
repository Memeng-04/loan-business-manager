import React, { useState } from "react";
import Card from "../card/Card";
import Button from "../Button";
import { PaymentService } from "../../services/PaymentService";
import {
  CheckCircle2,
  PieChart,
  TrendingUp,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "../../lib/formatters";

interface PaymentActionModalProps {
  loanId: string;
  scheduleId: string;
  defaultAmountDue: number;
  onClose: () => void;
  onSuccess: () => void;
}

type ActionType = "paid" | "partial" | "advance" | "absent";

export default function PaymentActionModal({
  loanId,
  scheduleId,
  defaultAmountDue,
  onClose,
  onSuccess,
}: PaymentActionModalProps) {
  const [actionType, setActionType] = useState<ActionType>("paid");
  const [amountPaid, setAmountPaid] = useState<string>(
    defaultAmountDue.toString(),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let finalAmount = parseFloat(amountPaid) || 0;

      // Validation Logic
      if (actionType === "partial") {
        if (finalAmount <= 0)
          throw new Error("Partial payment must be greater than 0");
        if (finalAmount >= defaultAmountDue)
          throw new Error(
            'Partial payment must be less than the total due. Use "Full Payment" instead.',
          );
      }

      if (actionType === "advance") {
        if (finalAmount <= defaultAmountDue)
          throw new Error(
            "Advance payment must be greater than the current installment.",
          );
      }

      if (actionType === "absent") finalAmount = 0;
      if (actionType === "paid") finalAmount = defaultAmountDue;

      await PaymentService.processPaymentAction({
        loanId,
        scheduleId,
        amountPaid: finalAmount,
        paymentDate: new Date().toISOString().split("T")[0],
        status: actionType,
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to process payment");
    } finally {
      setLoading(false);
    }
  };

  const actions = [
    {
      id: "paid",
      label: "Full Payment",
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
      hover: "hover:border-green-400 hover:shadow-green-100",
      border: "border-green-500",
      activeBg: "bg-green-500 text-white",
    },
    {
      id: "partial",
      label: "Partial",
      icon: PieChart,
      color: "text-orange-500",
      bg: "bg-orange-50",
      hover: "hover:border-orange-400 hover:shadow-orange-100",
      border: "border-orange-400",
      activeBg: "bg-orange-500 text-white",
    },
    {
      id: "advance",
      label: "Advance",
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
      hover: "hover:border-blue-400 hover:shadow-blue-100",
      border: "border-blue-500",
      activeBg: "bg-main-blue text-white",
    },
    {
      id: "absent",
      label: "Missed",
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-50",
      hover: "hover:border-red-400 hover:shadow-red-100",
      border: "border-red-500",
      activeBg: "bg-red-500 text-white",
    },
  ] as const;

  const handleActionSelect = (type: ActionType) => {
    setActionType(type);
    if (type === "paid") setAmountPaid(defaultAmountDue.toString());
    if (type === "absent") setAmountPaid("0");
    setError(null);
  };

  // Dynamic helper text
  const getHelperText = () => {
    if (actionType === 'paid') return `Marks exactly ${formatCurrency(defaultAmountDue)} as paid today.`;
    if (actionType === 'partial') {
      const remaining = defaultAmountDue - (parseFloat(amountPaid) || 0);
      if (remaining <= 0) return `Consider using Full or Advance payment instead.`;
      return `${formatCurrency(remaining)} will be rolled into the next schedule.`;
    }
    if (actionType === "advance") {
      const overpayment = (parseFloat(amountPaid) || 0) - defaultAmountDue;
      if (overpayment <= 0) return `Consider using Full or Partial payment instead.`;
      return `${formatCurrency(overpayment)} extra will reduce the end of the loan term.`;
    }
    if (actionType === 'absent') return `Entire ${formatCurrency(defaultAmountDue)} rolls over. Automatic penalty applies every 3 misses.`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-md"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <Card
        variant="elevated"
        padding="lg"
        className="w-full max-w-[420px] bg-white relative z-10 shadow-2xl rounded-3xl border border-gray-100 overflow-hidden transform transition-all flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Record Action</h2>
            <p className="text-gray-500 font-medium text-sm mt-1">Expected: <span className="font-bold text-main-blue">{formatCurrency(defaultAmountDue)}</span></p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-red-700 leading-tight">
              {error}
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 overflow-y-auto pr-1 custom-scrollbar"
        >
          {/* Action Grid */}
          <div className="grid grid-cols-2 gap-3">
            {actions.map((act) => {
              const Icon = act.icon;
              const isActive = actionType === act.id;
              return (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => handleActionSelect(act.id)}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ease-in-out ${
                    isActive
                      ? `${act.border} ${act.activeBg} shadow-md scale-[1.02]`
                      : `border-transparent bg-gray-50 hover:bg-white text-gray-400 hover:text-gray-600 ${act.hover} shadow-sm`
                  }`}
                >
                  <Icon
                    size={28}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? "text-white" : act.color}
                  />
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${isActive ? "text-white/90" : "text-gray-500"}`}
                  >
                    {act.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Content Area (Smooth height changes via flex) */}
          <div className="flex flex-col gap-4 transition-all">
            {/* Custom Amount Input */}
            {(actionType === "partial" || actionType === "advance") && (
              <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest pl-1">
                  Amount Given (₱)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-medium text-gray-400">
                    ₱
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    required
                    autoFocus
                    className="w-full bg-gray-50/50 hover:bg-white focus:bg-white py-4 pl-12 pr-6 border-2 border-transparent hover:border-gray-200 focus:border-main-blue rounded-2xl focus:outline-none transition-all text-2xl font-black text-gray-900"
                  />
                </div>
              </div>
            )}

            {/* Contextual Helper Text */}
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-3 items-start">
              <div className="mt-0.5 text-main-blue">
                <CheckCircle2 size={16} />
              </div>
              <p className="text-sm font-semibold text-blue-900 leading-snug">
                {getHelperText()}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-2 flex gap-3 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              size="lg"
              onClick={onClose}
              className="w-1/3 mt-0 text-gray-500 border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              variant="blue"
              size="lg"
              type="submit"
              disabled={loading}
              className="w-2/3 mt-0 shadow-lg shadow-blue-500/20"
            >
              {loading ? "Processing..." : "Confirm Action"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
